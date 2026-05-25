import { SessionMode } from '../../../session/modes';
import { buildCompletionPersonalization } from '../service';
import { createSessionSummary } from './ledger-test-utils';

describe('completion personalization', () => {
  it.each([
    ['student', 'What made this study block work?', 'study_os'],
    ['game_like', 'What kept the run clean?', 'run_board'],
    ['deep_creative', 'What should VEX remember for next block?', 'project_thread'],
    ['minimal_normal', 'Keep same setup next time?', 'today_strip'],
  ] as const)('trains %s completion', (lane, prompt, unlockKey) => {
    const result = buildCompletionPersonalization({
      lane,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
    });

    expect(result.reflectionQuestion).toBe(prompt);
    expect(result.memoryCandidates).toHaveLength(1);
    expect(result.unlockDecision.key).toBe(unlockKey);
    expect(result.unlockDecision.hidden).toBe(false);
  });

  it('uses partial and abandoned recovery prompts', () => {
    const partial = buildCompletionPersonalization({
      lane: 'student',
      summary: createSessionSummary({ completionPercentage: 40 }),
    });
    const abandoned = buildCompletionPersonalization({
      lane: 'game_like',
      summary: createSessionSummary({ completionPercentage: 0, status: 'ABANDONED' }),
    });

    expect(partial.reflectionQuestion).toBe('Was the task too big or unclear?');
    expect(abandoned.reflectionQuestion).toBe('What interrupted the encounter?');
  });

  it('respects deleted memory and hidden unlock gates', () => {
    const summary = createSessionSummary();
    const memoryId = `${summary.sessionId}:minimal_normal:clean`;
    const result = buildCompletionPersonalization({
      deletedMemoryIds: [memoryId],
      hiddenFeatureKeys: ['today_strip'],
      lane: 'minimal_normal',
      summary,
    });

    expect(result.memoryCandidates).toEqual([]);
    expect(result.unlockDecision.hidden).toBe(true);
    expect(result.unlockDecision.status).toBe('blocked');
  });

  it('builds comeback prompt safely from missing lane history', () => {
    const result = buildCompletionPersonalization({
      isComeback: true,
      lane: 'deep_creative',
      summary: createSessionSummary({ completionPercentage: 70 }),
    });

    expect(result.reflectionQuestion).toBe('What is the re-entry point?');
    expect(result.nextActionLabel).toBe('Resume thread');
  });
});
