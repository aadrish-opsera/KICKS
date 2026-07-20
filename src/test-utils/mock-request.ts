/**
 * Factory for mock Request objects used by Edge Middleware tests.
 */
export function createMockRequest(options: {
  ip?: string
  url?: string
  method?: string
  realIp?: string
}): Request {
  const headers = new Headers()
  if (options.ip) {
    headers.set('x-forwarded-for', options.ip)
  }
  if (options.realIp) {
    headers.set('x-real-ip', options.realIp)
  }
  return new Request(options.url ?? 'https://kicks.example/api/health', {
    method: options.method ?? 'GET',
    headers,
  })
}
