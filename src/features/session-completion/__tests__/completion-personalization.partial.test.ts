import { SessionMode } from '../../../session/modes';

import {
  LANES,
  PARTIAL_REFLECTIONS,
  ABANDONED_REFLECTIONS,
  buildResult,
} from './completion-personalization.helpers';

describe('Phase 5 - Completion Personalization > Partial completion per lane', () => {
  it.each(LANES)('%s: partial uses recovery question', (lane) => {
    const result = buildResult(lane, {
      grade: 'C',
      summary: {
        completionPercentage: 40,
        sessionMode: SessionMode.FLOW,
        status: 'COMPLETED',
      },
      xpDelta: 50,
      focusScoreDelta: 0,
    });
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.userFacingSummary.tone).toBe('info');
  });
});

describe('Phase 5 - Completion Personalization > Abandoned completion per lane', () => {
  it.each(LANES)('%s: abandoned uses recovery question, no shame', (lane) => {
    const result = buildResult(lane, {
      grade: 'D',
      summary: {
        completionPercentage: 0,
        sessionMode: SessionMode.FLOW,
        status: 'ABANDONED',
        actualDuration: 300,
        effectiveDuration: 200,
        interruptions: 2,
        xpEarned: 10,
      },
      focusScoreDelta: -8,
      xpDelta: 20,
    });
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.userFacingSummary.tone).toBe('warning');
    expect(result.memoryCandidates.length).toBe(1);
    expect(result.memoryCandidates[0].confidence).toBeLessThan(0.6);
  });
});
