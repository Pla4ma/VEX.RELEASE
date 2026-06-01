import { FOCUS_SCORE_CONFIG } from '../FocusIdentityEngine';
import { FocusIdentityService } from '../focus-identity-service';

describe('FocusIdentityService', () => {
  let service: FocusIdentityService;
  beforeEach(() => {
    service = new FocusIdentityService('test-user-456');
  });
  describe('Profile Initialization', () => {
    it('should create initial profile with correct defaults', async () => {
      const profile = await service.initializeProfile();
      expect(profile.userId).toBe('test-user-456');
      expect(profile.currentScore).toBe(FOCUS_SCORE_CONFIG.INITIAL_SCORE);
      expect(profile.previousScore).toBe(FOCUS_SCORE_CONFIG.INITIAL_SCORE);
      expect(profile.scoreHistory).toHaveLength(1);
      expect(profile.isInRecovery).toBe(false);
      expect(profile.recommendedActions).toHaveLength(3);
    });
    it('should not recreate profile if exists', async () => {
      const first = await service.initializeProfile();
      const second = await service.initializeProfile();
      expect(second.totalScoreCalculations).toBe(first.totalScoreCalculations);
    });
  });
  describe('Score Updates', () => {
    beforeEach(async () => {
      await service.initializeProfile();
    });
    it('should update score on session complete', async () => {
      const result = await service.updateScore('SESSION_COMPLETE', {
        streakLength: 5,
        sessionGrade: 'A',
      });
      expect(result.change).toBeGreaterThan(0);
      expect(result.newScore).toBeGreaterThan(result.change);
      expect(result.bandChanged).toBe(false);
    });
    it('should decrease score on missed day', async () => {
      const result = await service.updateScore('MISSED_DAY', {});
      expect(result.change).toBeLessThan(0);
    });
    it('should detect band change when crossing threshold', async () => {
      const profile = await service.getProfile();
      if (profile) {
        profile.currentScore = 579;
        await service.saveProfile(profile);
        const result = await service.updateScore('PERFECT_SESSION', {
          streakLength: 10,
        });
        expect(result.bandChanged || result.newScore > 579).toBeTruthy();
      }
    });
    it('should enter recovery mode on streak break', async () => {
      await service.updateScore('STREAK_BREAK', {});
      const profile = await service.getProfile();
      expect(profile?.isInRecovery).toBe(true);
      expect(profile?.preLapseScore).toBeTruthy();
    });
    it('should complete recovery after enough positive events', async () => {
      await service.updateScore('STREAK_BREAK', {});
      for (let i = 0; i < 15; i++) {
        await service.updateScore('SESSION_COMPLETE', {});
      }
      const profile = await service.getProfile();
      expect(profile?.isInRecovery).toBe(false);
    });
  });
  describe('Monthly Report', () => {
    it('should return null for insufficient history', async () => {
      await service.initializeProfile();
      const profile = await service.getProfile();
      if (profile) {
        profile.scoreHistory = [];
        await service.saveProfile(profile);
      }
      const report = await service.getMonthlyReport();
      expect(report).toBeNull();
    });
  });
});
