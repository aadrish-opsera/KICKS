import { afterAll, afterEach, beforeAll } from 'vitest'
import { integrationServer } from './msw-handlers'

beforeAll(() => {
  integrationServer.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  integrationServer.resetHandlers()
})

afterAll(() => {
  integrationServer.close()
})
