// Simple in-memory rate-limiter for API routes in Next.js.
// Keeps track of client IPs in a Map and resets count based on a window size.

const tracker = new Map<string, { count: number; resetTime: number }>();

// Periodically clean up expired entries from the memory tracker map to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const globalAny = globalThis as any;
  if (!globalAny.rateLimitInterval) {
    globalAny.rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of tracker.entries()) {
        if (now > data.resetTime) {
          tracker.delete(ip);
        }
      }
    }, 5 * 60 * 1000); // Cleanup runs every 5 minutes
  }
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(ip: string, limit = 5, windowMs = 60000): RateLimitResult {
  const now = Date.now();
  const client = tracker.get(ip);

  if (!client) {
    tracker.set(ip, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (now > client.resetTime) {
    client.count = 1;
    client.resetTime = now + windowMs;
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: client.resetTime,
    };
  }

  client.count++;
  const remaining = Math.max(0, limit - client.count);

  if (client.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: client.resetTime,
    };
  }

  return {
    success: true,
    limit,
    remaining,
    reset: client.resetTime,
  };
}
