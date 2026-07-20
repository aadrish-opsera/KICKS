const SCRIPT_BLOCK_PATTERN = /<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/gi
const EVENT_HANDLER_PATTERN = /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const DANGEROUS_URI_PATTERN = /(?:javascript|data|vbscript)\s*:/gi

/**
 * Client-side preference sanitizer (XSS / injection neutralization).
 * Never throws — unexpected input types yield an empty string.
 * Does not trim — callers validate trimmed length separately for typing UX.
 */
export function sanitizeInput(raw: unknown): string {
  if (typeof raw !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('[sanitizeInput] expected string, received', typeof raw)
    }
    return ''
  }

  let text = raw
  text = text.replace(SCRIPT_BLOCK_PATTERN, '')
  text = text.replace(HTML_TAG_PATTERN, '')
  text = text.replace(EVENT_HANDLER_PATTERN, '')
  text = text.replace(DANGEROUS_URI_PATTERN, '')
  text = text.replace(/[<>]/g, '')
  return text
}
