/**
 * Lighthouse CI — WO-150 / WO-141
 *
 * Collect uses simulated Slow 4G (mobile defaults):
 *   rttMs ≈ 150, throughputKbps ≈ 1.6 Mbps, CPU 4× slowdown.
 * TTI (audit id: interactive) must be ≤ 3000ms using the median of 3 runs.
 * Category gates fail the build (error): Performance ≥ 80, Accessibility ≥ 90,
 * Best Practices ≥ 80.
 */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/results',
        'http://localhost:4173/comparison',
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      settings: {
        // Simulated 4G (Lighthouse mobile defaults) for TTI/NFR measurement.
        formFactor: 'mobile',
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474.56,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        // TTI ≤ 3s on simulated 4G; median of 3 runs (WO-150 edge case).
        interactive: [
          'error',
          { maxNumericValue: 3000, aggregationMethod: 'median-run' },
        ],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
