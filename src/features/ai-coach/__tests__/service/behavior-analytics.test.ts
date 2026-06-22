import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  processBehaviorSignal,
  detectPatterns,
} from '../../service/behavior-analytics';
import * as repository from '../../repository';
import {
  createMockBehaviorProfile,
  mockUserId,
} from './helpers';

jest.mock('../../repository');

describe('Behavior Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processBehaviorSignal', () => {
    it('creates and persists behavior signal', async () => {
      (repository.addBehaviorSignal as jest.Mock).mockImplementation((s) => s);
      (repository.fetchRecentBehaviorSignals as jest.Mock).mockResolvedValue(
        [],
      );
      (repository.upsertBehaviorProfile as jest.Mock).mockImplementation(
        (p) => p,
      );
      const profile = await processBehaviorSignal(
        mockUserId,
        'SESSION_QUALITY_TREND',
        0.85,
        { source: 'test' },
      );
      expect(profile).toBeDefined();
      expect(profile.userId).toBe(mockUserId);
      expect(repository.addBehaviorSignal).toHaveBeenCalled();
    });

    it('calculates correct confidence for different signal types', async () => {
      const capturedSignals: unknown[] = [];
      (repository.addBehaviorSignal as jest.Mock).mockImplementation((s) => {
        capturedSignals.push(s);
        return s;
      });
      (repository.fetchRecentBehaviorSignals as jest.Mock).mockImplementation(
        () => Promise.resolve(capturedSignals),
      );
      (repository.upsertBehaviorProfile as jest.Mock).mockImplementation(
        (p) => p,
      );
      const profile1 = await processBehaviorSignal(
        mockUserId,
        'STREAK_MAINTENANCE_RATE',
        0.9,
        {},
      );
      const profile2 = await processBehaviorSignal(
        mockUserId,
        'SOCIAL_ENGAGEMENT',
        0.9,
        {},
      );
      expect(profile1.signals.length).toBeGreaterThan(0);
      expect(profile2.signals.length).toBeGreaterThan(0);
      expect(profile1.signals[0].confidence).toBeGreaterThanOrEqual(profile2.signals[0].confidence);

    });
  });

  describe('detectPatterns', () => {
    it('detects morning person pattern', () => {
      const profile = createMockBehaviorProfile({
        confidenceLevel: 'HIGH',
        coldStart: false,
        dataPoints: 25,
        signals: [
          {
            id: 'sig-1',
            userId: mockUserId,
            signalType: 'MORNING_PERSON',
            value: 0.85,
            confidence: 0.8,
            timestamp: Date.now(),
            metadata: {},
            expiresAt: Date.now() + 86400000,
          },
        ],
      });
      const patterns = detectPatterns(profile);
      expect(patterns.some((p) => p.patternType === 'CHRONOTYPE')).toBe(true);
    });

    it('detects streak maintainer pattern', () => {
      const profile = createMockBehaviorProfile({
        confidenceLevel: 'HIGH',
        coldStart: false,
        dataPoints: 30,
        signals: [
          {
            id: 'sig-1',
            userId: mockUserId,
            signalType: 'STREAK_MAINTENANCE_RATE',
            value: 0.9,
            confidence: 0.85,
            timestamp: Date.now(),
            metadata: {},
            expiresAt: Date.now() + 86400000,
          },
        ],
      });
      const patterns = detectPatterns(profile);
      expect(patterns.some((p) => p.patternType === 'CONSISTENCY')).toBe(true);
    });

    it('returns empty patterns for cold start users', () => {
      const profile = createMockBehaviorProfile({
        confidenceLevel: 'LOW',
        coldStart: true,
        dataPoints: 2,
      });
      const patterns = detectPatterns(profile);
      expect(patterns).toHaveLength(0);
    });
  });
});
