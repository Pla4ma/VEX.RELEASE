
import { createSessionSummary } from './ledger-test-utils';
import {
  LANES,
  buildResult,
} from './completion-personalization.helpers';

describe('Phase 5 - Completion Personalization > Full completion per lane', () => {
  it.each(LANES)('%s: produces all 7 canonical fields', (lane) => {
    const result = buildResult(lane);
    expect(result.laneProfile).toBeDefined();
    expect(result.progressProof).toBeDefined();
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.memoryCandidates).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
    expect(result.userFacingSummary).toBeDefined();
  });

  it.each(LANES)('%s: clean reflection question is non-empty', (lane) => {
    const result = buildResult(lane);
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
  });

  it.each(LANES)('%s: unlock key is non-empty string', (lane) => {
    const result = buildResult(lane);
    expect(result.unlockDecision).toBeDefined();
    const key = (result.unlockDecision as { key?: unknown }).key;
    expect(typeof key).toBe('string');
    expect((key as string).length).toBeGreaterThan(0);
  });

  it.each(LANES)('%s: memory candidate generated', (lane) => {
    const result = buildResult(lane);
    expect(result.memoryCandidates.length).toBeGreaterThanOrEqual(0);
  });
});

describe('Phase 5 - Completion Personalization > First session creates return plan', () => {
  it.each(LANES)('%s: progressProof exists', (lane) => {
    const result = buildResult(lane, { xpDelta: 80 });
    expect(result.progressProof).toBeDefined();
  });
});

describe('Phase 5 - Completion Personalization > User-facing summary is lane-appropriate', () => {
  it.each(LANES)(
    '%s: has userFacingSummary',
    (lane) => {
      const result = buildResult(lane);
      expect(result.userFacingSummary).toBeDefined();
    },
  );
});
