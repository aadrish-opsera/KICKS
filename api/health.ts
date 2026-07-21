import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getColdStartMetrics } from './utils/cold-start'
import { captureServerError } from '../src/shared/utils/captureServerError'
import {
  probeGeminiApi,
  type GeminiApiProbe,
} from '../src/shared/utils/geminiApiProbe'
import { getGeminiQuotaRemaining } from '../src/shared/utils/geminiQuotaPlaceholder'
import {
  probeSneakerApi,
  type SneakerApiProbe,
} from '../src/shared/utils/sneakerApiProbe'
import { initSentryServer } from '../src/shared/utils/sentryServerInit'

initSentryServer()

export type HealthStatus = 'healthy' | 'degraded'
export type ApiReachability = 'up' | 'down'

export type HealthResponse = {
  status: HealthStatus
  sneakerApi: ApiReachability
  geminiApi: ApiReachability
  geminiQuotaRemaining: number
  timestamp: string
}

export type HealthErrorResponse = {
  error: true
  code: 'INTERNAL_ERROR'
  message: string
}

export type HealthHandlerDeps = {
  sneakerProbe: SneakerApiProbe
  geminiProbe: GeminiApiProbe
  getQuotaRemaining: () => number
  now: () => Date
}

const defaultDeps: HealthHandlerDeps = {
  sneakerProbe: probeSneakerApi,
  geminiProbe: probeGeminiApi,
  getQuotaRemaining: getGeminiQuotaRemaining,
  now: () => new Date(),
}

export async function runHealthCheck(
  deps: Partial<HealthHandlerDeps> = {},
): Promise<HealthResponse> {
  const {
    sneakerProbe,
    geminiProbe,
    getQuotaRemaining,
    now,
  } = { ...defaultDeps, ...deps }

  const [sneakerResult, geminiResult] = await Promise.allSettled([
    sneakerProbe(),
    geminiProbe(),
  ])

  const sneakerApi: ApiReachability =
    sneakerResult.status === 'fulfilled' ? sneakerResult.value : 'down'
  const geminiApi: ApiReachability =
    geminiResult.status === 'fulfilled' ? geminiResult.value : 'down'

  const status: HealthStatus =
    sneakerApi === 'up' && geminiApi === 'up' ? 'healthy' : 'degraded'

  return {
    status,
    sneakerApi,
    geminiApi,
    geminiQuotaRemaining: getQuotaRemaining(),
    timestamp: now().toISOString(),
  }
}

export function createHealthHandler(deps: Partial<HealthHandlerDeps> = {}) {
  return async function handler(
    _req: VercelRequest,
    res: VercelResponse,
  ): Promise<void> {
    const startedAt = Date.now()
    const coldStart = getColdStartMetrics(startedAt)
    console.info(
      JSON.stringify({
        endpoint: '/api/health',
        message: 'cold_start',
        isColdStart: coldStart.isColdStart,
        initDurationMs: coldStart.initDurationMs,
      }),
    )

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')

    try {
      const body = await runHealthCheck(deps)
      res.status(200).json(body)
    } catch (error) {
      captureServerError(error, {
        endpoint: '/api/health',
        requestId: 'health-check',
        errorType: 'INTERNAL_ERROR',
      })
      const errorBody: HealthErrorResponse = {
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Health check failed',
      }
      res.status(500).json(errorBody)
    }
  }
}

export default createHealthHandler()
