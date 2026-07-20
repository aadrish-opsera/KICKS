import { describe, expect, it } from 'vitest'
import { PromptConstructor } from '../prompt-constructor'
import { candidateSneakerFixtures } from './fixtures/candidate-sneakers'

describe('PromptConstructor', () => {
  const constructor = new PromptConstructor()

  it('builds system + user prompts with delimiters and JSON schema', () => {
    const prompt = constructor.buildPrompt(
      'comfortable running shoes',
      { min: 50, max: 100 },
      candidateSneakerFixtures,
    )

    expect(prompt.systemInstruction).toMatch(/family-friendly/i)
    expect(prompt.systemInstruction).toMatch(/BEGIN_USER_INPUT/)
    expect(prompt.systemInstruction).toMatch(/aiExplanation/)
    expect(prompt.userPrompt).toContain('BEGIN_USER_INPUT')
    expect(prompt.userPrompt).toContain('comfortable running shoes')
    expect(prompt.userPrompt).toContain('END_USER_INPUT')
    expect(prompt.userPrompt).toContain('"min":50')
    expect(prompt.userPrompt).toContain('id=c-1')
  })

  it('handles short preferences and open-ended budget', () => {
    const prompt = constructor.buildPrompt('run', { min: 150, max: 999999 }, [
      candidateSneakerFixtures[0]!,
    ])
    expect(prompt.userPrompt).toContain('BEGIN_USER_INPUT\nrun\nEND_USER_INPUT')
    expect(prompt.userPrompt).toContain('"max":999999')
  })

  it('includes all candidates from 1 to 10', () => {
    const ten = Array.from({ length: 10 }, (_, index) => ({
      ...candidateSneakerFixtures[0]!,
      id: `id-${index}`,
      name: `Shoe ${index}`,
    }))
    const prompt = constructor.buildPrompt('daily trainers', { min: 0, max: 50 }, ten)
    expect(prompt.userPrompt).toContain('id=id-0')
    expect(prompt.userPrompt).toContain('id=id-9')
  })
})
