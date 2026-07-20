import { next } from '@vercel/edge'
import { checkRateLimit, extractClientIp } from './src/edge/rateLimit'

export const config = {
  matcher: '/api/:path*',
}

export default function middleware(request: Request): Response {
  try {
    const ip = extractClientIp(request.headers)
    const result = checkRateLimit(ip)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again shortly.',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfter),
          },
        },
      )
    }

    return next()
  } catch (error) {
    console.error('[rate-limit] unexpected error; failing open', error)
    return next()
  }
}
