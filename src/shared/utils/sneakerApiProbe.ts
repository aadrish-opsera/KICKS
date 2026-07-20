export type ApiStatus = 'up' | 'down'

const DEFAULT_SNEAKER_API_URL =
  'https://api.thesneakerdatabase.com/v1/sneakers?limit=1'
const PROBE_TIMEOUT_MS = 3000

export type SneakerApiProbe = (apiKey?: string) => Promise<ApiStatus>

/**
 * Lightweight connectivity probe for The Sneaker Database.
 * Returns 'down' when the key is missing, the request fails, or it times out.
 */
export const probeSneakerApi: SneakerApiProbe = async (
  apiKey = process.env.SNEAKER_DB_API_KEY,
): Promise<ApiStatus> => {
  if (!apiKey) {
    return 'down'
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const response = await fetch(DEFAULT_SNEAKER_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-api-key': apiKey,
      },
      signal: controller.signal,
    })

    return response.ok ? 'up' : 'down'
  } catch {
    return 'down'
  } finally {
    clearTimeout(timeoutId)
  }
}
