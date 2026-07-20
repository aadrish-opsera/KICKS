export type StructuredLog = {
  sneakerApiLatencyMs: number
  sneakerApiStatus: 'success' | 'error' | 'circuit_open'
  retryCount: number
  circuitBreakerState: string
  message?: string
}

export type SneakerLogger = {
  info: (log: StructuredLog) => void
  error: (log: StructuredLog) => void
}

export const consoleSneakerLogger: SneakerLogger = {
  info: (log) => console.info(JSON.stringify(log)),
  error: (log) => console.error(JSON.stringify(log)),
}
