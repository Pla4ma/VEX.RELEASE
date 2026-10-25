import * as Sentry from '@sentry/react-native';
import { getSessionOrchestrator } from '../../../session/SessionOrchestrator';
import { detectNewlyUnlockedFeatures } from '../completion-personalization-step';
import { summary } from './story-view-model-test-fixtures';
 
describe('completion unlock detection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the persisted completed-session count after app restart', async () => {
    const orchestrator = getSessionOrchestrator();
    jest.spyOn(orchestrator, 'getSessionStats').mockResolvedValue({
      totalSessions: 3,
      completedSessions: 3,
      abandonedSessions: 0,
      totalFocusTime: 0,
      averageSessionDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    const unlocked = await detectNewlyUnlockedFeatures('test-user', summary);

    expect(unlocked).toContain('study_intelligence');
    expect(unlocked).toContain('what_vex_learned');
    expect(unlocked).not.toContain('clean_today_strip');
  });

  it('returns no unlock claims when persisted session stats fail', async () => {
    const orchestrator = getSessionOrchestrator();
    jest
      .spyOn(orchestrator, 'getSessionStats')
      .mockRejectedValue(new Error('session stats unavailable'));
    const captureException = jest.spyOn(Sentry, 'captureException');

    await expect(
      detectNewlyUnlockedFeatures('test-user', summary),
    ).resolves.toEqual([]);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { feature: 'completion-unlock-detection' },
      }),
    );
  });
});
