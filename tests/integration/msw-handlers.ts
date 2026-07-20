import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import sneakerDbFixture from '../fixtures/sneaker-database-response.json'
import groqFixture from '../fixtures/groq-ranking-response.json'

/**
 * HTTP-boundary mocks for external APIs used by the recommend pipeline.
 * Handler unit/integration tests primarily use DI; MSW covers fetch-based paths.
 */
export const integrationHandlers = [
  http.get('https://api.thesneakerdatabase.com/*', () =>
    HttpResponse.json({ count: sneakerDbFixture.length, results: sneakerDbFixture }),
  ),
  http.get('https://the-sneaker-database.p.rapidapi.com/*', () =>
    HttpResponse.json({ count: sneakerDbFixture.length, results: sneakerDbFixture }),
  ),
  http.post('https://api.groq.com/*', () => HttpResponse.json(groqFixture)),
  http.get('https://api.groq.com/*', () => HttpResponse.json({ data: [] })),
]

export const integrationServer = setupServer(...integrationHandlers)
