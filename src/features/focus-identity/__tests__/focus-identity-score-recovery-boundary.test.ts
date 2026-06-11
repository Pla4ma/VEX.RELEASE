import { FOCUS_SCORE_CONFIG } from '../focus-score-config';
import { FocusIdentityService } from '../focus-identity-service';

describe('FocusIdentityService recovery boundaries', () => {
  let service: FocusIdentityService;

  beforeEach(() => {
    service = new FocusIdentityService('recovery-user-1');
  });

  afterEach(async () => {
    await service.getProfile();
  });

  it('applies recovery bonus to positive events while recovery is active', async () => {
    await service.initializeProfile();
    await service.updateScore('STREAK_BREAK', {});
    const first = await service.getProfile();
    expect(first?.isInRecovery).toBe(true);

    const result = await service.updateScore('SESSION_COMPLETE', {
      streakLength: 1,
      sessionGrade: 'A',
    });

    expect(result.change).toBeGreaterThan(0);
    expect(first?.recoveryProgress).toBeGreaterThanOrEqual(0);
  });

  it('does not complete recovery from a negative event during recovery', async () => {
    await service.initializeProfile();
    await service.updateScore('STREAK_BREAK', {});
    const first = await service.getProfile();

    expect(first?.isInRecovery).toBe(true);
    const recoveryStart = first?.recoveryStartDate;

    const result = await service.updateScore('MISSED_DAY', {});
    const profile = await service.getProfile();

    expect(result.change).toBeLessThan(0);
    expect(profile?.isInRecovery).toBe(true);
    expect(profile?.recoveryStartDate).toBe(recoveryStart);
  });

  it('does not decrease recovery progress on a neutral or negative event', async () => {
    await service.initializeProfile();
    await service.updateScore('MISSED_DAY', {});
    const profileBefore = await service.getProfile();

    const progressBefore = profileBefore?.recoveryProgress ?? 0;
    expect(profileBefore?.isInRecovery).toBe(true);

    await service.updateScore('MISSED_DAY', {});
    const profileAfter = await service.getProfile();

    expect(profileAfter?.recoveryProgress).toBeGreaterThanOrEqual(
      progressBefore,
    );
  });

  it('does not overflow band when max score boundary is hit', async () => {
    await service.initializeProfile();
    const profile = await service.getProfile();
    if (!profile) {
      throw new Error('profile missing');
    }
    profile.currentScore = FOCUS_SCORE_CONFIG.MAX_SCORE;
    await service.saveProfile(profile);

    const result = await service.updateScore('PERFECT_SESSION', {
      streakLength: 50,
      sessionGrade: 'S',
    });

    expect(result.newScore).toBeLessThanOrEqual(
      FOCUS_SCORE_CONFIG.MAX_SCORE,
    );
  });

  it('does not underflow band when min score boundary is hit', async () => {
    await service.initializeProfile();
    const profile = await service.getProfile();
    if (!profile) {
      throw new Error('profile missing');
    }
    profile.currentScore = FOCUS_SCORE_CONFIG.MIN_SCORE;
    await service.saveProfile(profile);

    const result = await service.updateScore('STREAK_BREAK', {});

    expect(result.newScore).toBeGreaterThanOrEqual(
      FOCUS_SCORE_CONFIG.MIN_SCORE,
    );
  });
});
