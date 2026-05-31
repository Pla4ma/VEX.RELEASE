import { describe, it } from '@jest/globals';

type ManualProofArea = {
  area: string;
  checks: string[];
};

const manualProofAreas: ManualProofArea[] = [
  {
    area: 'Device matrix',
    checks: [
      'small iPhone core screens',
      'large iPhone core screens',
      'Android core screens',
      'dark mode',
      'safe area insets',
    ],
  },
  {
    area: 'Network resilience',
    checks: [
      'slow network session start',
      'offline session completion queue',
      'offline banner',
      'reconnect sync once',
      'network retry controls',
    ],
  },
  {
    area: 'Session lifecycle',
    checks: [
      'background active timer',
      'app kill resume',
      'interruption recovery',
      'logout clears sensitive state',
      'login restores remote state',
    ],
  },
  {
    area: 'Launch services',
    checks: [
      'RevenueCat outage fallback',
      'Sentry test event',
      'PostHog test event',
      'push permission denied path',
    ],
  },
  {
    area: 'Accessibility and performance',
    checks: [
      'VoiceOver core flow',
      '44 point touch targets',
      'reduced motion',
      'cold start',
      'extended-use memory',
    ],
  },
];

describe('Real device proof contract', () => {
  it('documents the manual proof areas without claiming device execution', () => {
    expect(manualProofAreas).toHaveLength(5);
    expect(manualProofAreas.flatMap((area) => area.checks)).toHaveLength(24);
  });

  describe.skip.each(manualProofAreas)('$area', ({ checks }) => {
    it.each(checks)('requires recorded device evidence: %s', () => {
      throw new Error(
        'Manual device evidence is required before this can pass.',
      );
    });
  });
});
