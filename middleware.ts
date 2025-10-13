import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for API Route Protection
 *
 * Features:
 * - Rate limiting per IP
 * - Security headers
 * - Request validation
 */

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimit = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Skip health check from rate limiting
    if (request.nextUrl.pathname === "/api/health") {
      return NextResponse.next();
    }

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const now = Date.now();

    // Get requests for this IP
    const requests = rateLimit.get(ip) || [];

    // Filter recent requests within the window
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    // Check if rate limit exceeded
    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Add current request timestamp
    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);

    // Cleanup old entries periodically (prevent memory leak)
    if (rateLimit.size > 1000) {
      const cutoff = now - RATE_LIMIT_WINDOW_MS;
      for (const [key, timestamps] of rateLimit.entries()) {
        const filtered = timestamps.filter((t) => t > cutoff);
        if (filtered.length === 0) {
          rateLimit.delete(key);
        } else {
          rateLimit.set(key, filtered);
        }
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
