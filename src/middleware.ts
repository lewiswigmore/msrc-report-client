import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiter for API routes.
// Note: In production with multiple instances, replace with Redis or equivalent.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
  // Use x-forwarded-for from trusted proxy, or fall back to a default.
  // In production behind a known reverse proxy, validate x-forwarded-for against
  // trusted proxy IPs. For now, use the first IP in the chain.
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}

function cleanupExpiredEntries(): void {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW;
  for (const [k, v] of rateLimitMap.entries()) {
    if (v.timestamp < cutoff) {
      rateLimitMap.delete(k);
    }
  }
}

function getRateLimitInfo(key: string): { limited: boolean; count: number; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Periodic cleanup to prevent memory growth
  if (rateLimitMap.size > 5000) {
    cleanupExpiredEntries();
  }

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return { limited: false, count: 1, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetMs: RATE_LIMIT_WINDOW };
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count);
  const resetMs = RATE_LIMIT_WINDOW - (now - entry.timestamp);

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return { limited: true, count: entry.count, remaining: 0, resetMs };
  }

  return { limited: false, count: entry.count, remaining, resetMs };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting only to API routes
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    const info = getRateLimitInfo(key);

    if (info.limited) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(info.resetMs / 1000)),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(info.resetMs / 1000)),
          },
        }
      );
    }

    // Add security + rate limit headers to API responses
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    response.headers.set('X-RateLimit-Remaining', String(info.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(info.resetMs / 1000)));
    return response;
  }

  return NextResponse.next();
}

// Configure which routes should use middleware
export const config = {
  matcher: [
    // Apply to API routes
    '/api/:path*',
  ],
};
