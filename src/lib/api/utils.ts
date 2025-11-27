/**
 * Shared API utilities for consistent request handling across all routes.
 * Centralizes rate limiting, validation, and error response patterns.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { rateLimit, addRateLimitHeaders } from "@/lib/rateLimit";
import { validateRequestSize } from "@/lib/validation";

/**
 * Standard error response with consistent formatting.
 */
export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response with rate limit headers.
 */
export function successResponse<T>(
  data: T,
  request: NextRequest
): NextResponse {
  const response = NextResponse.json(data);
  return addRateLimitHeaders(response, request);
}

/**
 * Parse JSON body with error handling.
 * Returns the parsed body or null if parsing fails.
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest
): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const data = (await request.json()) as T;
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: errorResponse("Invalid JSON in request body", 400),
    };
  }
}

interface RequestContext {
  request: NextRequest;
  requireBody?: boolean;
}

interface ValidatedRequest<T> {
  body: T | null;
  error: NextResponse | null;
}

/**
 * Validates a request with rate limiting and optional body parsing.
 * Combines common validation patterns into a single reusable function.
 */
export async function validateRequest<T = Record<string, unknown>>(
  ctx: RequestContext
): Promise<ValidatedRequest<T>> {
  const { request, requireBody = false } = ctx;

  // Check rate limit
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return { body: null, error: rateLimitResponse };
  }

  // For requests that need a body
  if (requireBody) {
    // Validate request size
    const sizeError = validateRequestSize(
      request.headers.get("content-length")
    );
    if (sizeError) {
      return { body: null, error: errorResponse(sizeError, 413) };
    }

    // Parse JSON body
    const { data, error } = await parseJsonBody<T>(request);
    if (error) {
      return { body: null, error };
    }

    return { body: data, error: null };
  }

  return { body: null, error: null };
}

/**
 * Wraps an async handler with standardized error handling.
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>,
  errorMessage: string
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    logger.error(errorMessage, { error: String(error) });
    return errorResponse(errorMessage, 500);
  });
}

