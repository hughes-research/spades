/**
 * Simple in-memory rate limiting for API routes.
 * For production, consider using Redis-based solutions like @upstash/ratelimit.
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute
const MAX_STORE_SIZE = 10000; // Maximum entries to prevent memory exhaustion

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Track cleanup interval for proper teardown
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Cleans up expired rate limit entries to prevent memory leaks.
 * Also enforces maximum store size by removing oldest entries.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleaned = 0;
  
  // First pass: remove expired entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  // Second pass: if still over limit, remove oldest entries
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    const entries = Array.from(rateLimitStore.entries())
      .sort((a, b) => a[1].resetTime - b[1].resetTime);
    
    const toRemove = rateLimitStore.size - MAX_STORE_SIZE;
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      rateLimitStore.delete(entries[i][0]);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.debug(`Rate limit cleanup: removed ${cleaned} entries, store size: ${rateLimitStore.size}`);
  }
}

/**
 * Starts the cleanup interval. Safe to call multiple times.
 */
function startCleanupInterval(): void {
  if (cleanupIntervalId === null && typeof setInterval !== "undefined") {
    cleanupIntervalId = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
    // Prevent interval from keeping Node.js process alive
    if (cleanupIntervalId.unref) {
      cleanupIntervalId.unref();
    }
  }
}

/**
 * Stops the cleanup interval. Useful for testing and graceful shutdown.
 */
export function stopCleanupInterval(): void {
  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

// Initialize cleanup on module load
startCleanupInterval();

/**
 * Extracts client identifier from request.
 * Uses X-Forwarded-For header if behind a proxy, otherwise uses a default.
 */
function getClientIdentifier(request: Request): string {
  // Check for forwarded IP (when behind proxy/load balancer)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(",")[0].trim();
  }
  
  // Check for real IP header (some proxies use this)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback for local development or direct connections
  return "anonymous";
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Checks and updates rate limit for a client.
 */
function checkRateLimit(clientId: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  
  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(clientId, newEntry);
    
    return {
      success: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime: newEntry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  // Check if over limit
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    logger.warn("Rate limit exceeded", { clientId, count: entry.count });
    
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  return {
    success: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limiting middleware for API routes.
 * Returns null if request is allowed, or a Response if rate limited.
 */
export function rateLimit(request: Request): NextResponse | null {
  const clientId = getClientIdentifier(request);
  const result = checkRateLimit(clientId);
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetTime),
        },
      }
    );
  }
  
  return null;
}

/**
 * Adds rate limit headers to a successful response.
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: Request
): NextResponse {
  const clientId = getClientIdentifier(request);
  const entry = rateLimitStore.get(clientId);
  
  if (entry) {
    response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS_PER_WINDOW));
    response.headers.set("X-RateLimit-Remaining", String(Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count)));
    response.headers.set("X-RateLimit-Reset", String(entry.resetTime));
  }
  
  return response;
}

export default rateLimit;

