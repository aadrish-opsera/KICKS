export type ApiStatus = 'up' | 'down'

const DEFAULT_GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models'
const PROBE_TIMEOUT_MS = 3000

export type GeminiApiProbe = (apiKey?: string) => Promise<ApiStatus>

/**
 * Non-generative Groq connectivity probe (list models).
 * Kept as probeGeminiApi for health-handler compatibility.
 */
export const probeGeminiApi: GeminiApiProbe = async (
  apiKey = process.env.GROQ_API_KEY ?? process.env.GEMINI_API_KEY,
): Promise<ApiStatus> => {
  if (!apiKey) {
    return 'down'
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const response = await fetch(DEFAULT_GROQ_MODELS_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
