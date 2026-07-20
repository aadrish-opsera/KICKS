export type ApiStatus = 'up' | 'down'

const DEFAULT_GEMINI_MODELS_URL =
  'https://generativelanguage.googleapis.com/v1/models'
const PROBE_TIMEOUT_MS = 3000

export type GeminiApiProbe = (apiKey?: string) => Promise<ApiStatus>

/**
 * Non-generative Gemini connectivity probe (list models).
 * Avoids consuming daily generation quota.
 */
export const probeGeminiApi: GeminiApiProbe = async (
  apiKey = process.env.GEMINI_API_KEY,
): Promise<ApiStatus> => {
  if (!apiKey) {
    return 'down'
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const url = `${DEFAULT_GEMINI_MODELS_URL}?key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    return response.ok ? 'up' : 'down'
  } catch {
    return 'down'
  } finally {
    clearTimeout(timeoutId)
  }
}
