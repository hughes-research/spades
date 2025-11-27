import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers proxy for all routes.
 * Adds essential security headers to protect against common web vulnerabilities.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy - Prevents XSS attacks
  // Allow self, inline scripts/styles (needed for Next.js), and data URIs for images
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
    "style-src 'self' 'unsafe-inline'", // Required for Framer Motion and styled components
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);

  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable browser XSS filter (legacy but still useful)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Control referrer information leakage
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - Restrict browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return response;
}

// Apply proxy to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|imgs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

