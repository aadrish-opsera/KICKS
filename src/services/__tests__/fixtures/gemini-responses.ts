export const geminiValidResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify([
              {
                rank: 1,
                sneakerId: 'c-1',
                aiExplanation: 'Great cushioning for daily runs and a friendly fit.',
                aiRating: 9,
              },
              {
                rank: 2,
                sneakerId: 'c-2',
                aiExplanation: 'Strong energy return and stable support for training.',
                aiRating: 8,
              },
              {
                rank: 3,
                sneakerId: 'c-3',
                aiExplanation: 'Soft ride that works well for longer easy miles.',
                aiRating: 8,
              },
              {
                rank: 4,
                sneakerId: 'c-4',
                aiExplanation: 'Smooth cushioning with a protective upper for comfort.',
                aiRating: 7,
              },
              {
                rank: 5,
                sneakerId: 'c-5',
                aiExplanation: 'Lightweight comfort with a fun everyday look.',
                aiRating: 7,
              },
            ]),
          },
        ],
      },
    },
  ],
  usageMetadata: { totalTokenCount: 420 },
} as const

export const geminiMalformedResponse = {
  candidates: [{ content: { parts: [{ text: 'not-json{{{' }] } }],
} as const

export const geminiUnsafeResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify([
              {
                rank: 1,
                sneakerId: 'c-1',
                aiExplanation: 'These damn shoes are killer for adults only.',
                aiRating: 9,
              },
            ]),
          },
        ],
      },
    },
  ],
} as const
