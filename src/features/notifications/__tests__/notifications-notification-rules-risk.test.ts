import { makeServiceCtx } from './notifications-test-setup';
import {
  shouldNotifyStreakAtRisk,
  shouldNotifyBossEscape,
  shouldNotifySquadStreakAtRisk,
  shouldNotifyRivalAhead,
} from '../notification-rules';

describe('Notification Rules', () => {
  describe('shouldNotifyStreakAtRisk', () => {
    it('returns false when no streak risk', () => {
      const result = shouldNotifyStreakAtRisk(makeServiceCtx({ streakRisk: undefined }));
      expect(result.shouldSend).toBe(false);
    });

    it('returns false when hoursRemaining > 12', () => {
      const result = shouldNotifyStreakAtRisk(makeServiceCtx({
        streakRisk: { hoursRemaining: 15, streakDays: 5, riskLevel: 'LOW' },
      }));
      expect(result.shouldSend).toBe(false);
    });

    it('returns true with CRITICAL risk level', () => {
      const result = shouldNotifyStreakAtRisk(makeServiceCtx({
        streakRisk: { hoursRemaining: 1, streakDays: 10, riskLevel: 'CRITICAL' },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(10);
      expect(result.message.title).toContain('LAST CHANCE');
    });

    it('returns true with HIGH risk level', () => {
      const result = shouldNotifyStreakAtRisk(makeServiceCtx({
        streakRisk: { hoursRemaining: 3, streakDays: 5, riskLevel: 'HIGH' },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(8);
      expect(result.message.title).toContain('Streak at Risk');
    });

    it('returns true with MEDIUM risk level', () => {
      const result = shouldNotifyStreakAtRisk(makeServiceCtx({
        streakRisk: { hoursRemaining: 6, streakDays: 3, riskLevel: 'MEDIUM' },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.message.title).toContain('Streak Warning');
    });
  });

  describe('shouldNotifyBossEscape', () => {
    it('returns false when no boss escape context', () => {
      expect(shouldNotifyBossEscape(makeServiceCtx({ bossEscape: undefined })).shouldSend).toBe(false);
    });

    it('returns false when hoursRemaining > 4', () => {
      expect(shouldNotifyBossEscape(makeServiceCtx({
        bossEscape: { bossName: 'Dragon', hoursRemaining: 5, healthPercent: 20 },
      })).shouldSend).toBe(false);
    });

    it('returns true when boss is escaping', () => {
      const result = shouldNotifyBossEscape(makeServiceCtx({
        bossEscape: { bossName: 'Dragon', hoursRemaining: 2, healthPercent: 15 },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(9);
      expect(result.message.body).toContain('Dragon');
    });
  });

  describe('shouldNotifySquadStreakAtRisk', () => {
    it('returns false when no squad streak context', () => {
      expect(shouldNotifySquadStreakAtRisk(makeServiceCtx({ squadStreak: undefined })).shouldSend).toBe(false);
    });

    it('returns true when squad streak is at risk', () => {
      const result = shouldNotifySquadStreakAtRisk(makeServiceCtx({
        squadStreak: { squadName: 'TestSquad', streakDays: 7, atRiskMemberName: 'Alice' },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(7);
      expect(result.message.body).toContain('Alice');
    });
  });

  describe('shouldNotifyRivalAhead', () => {
    it('returns false when no rival update', () => {
      expect(shouldNotifyRivalAhead(makeServiceCtx({ rivalUpdate: undefined })).shouldSend).toBe(false);
    });

    it('returns false when user is ahead', () => {
      expect(shouldNotifyRivalAhead(makeServiceCtx({
        rivalUpdate: { rivalName: 'Bob', theirNewSessionMinutes: 30, myScore: 100, theirScore: 80 },
      })).shouldSend).toBe(false);
    });

    it('returns true when rival is ahead', () => {
      const result = shouldNotifyRivalAhead(makeServiceCtx({
        rivalUpdate: { rivalName: 'Bob', theirNewSessionMinutes: 60, myScore: 80, theirScore: 120 },
      }));
      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(6);
      expect(result.message.title).toContain('Rival Alert');
    });
  });
});
