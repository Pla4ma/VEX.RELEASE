/**
 * Lane Engine — Reconsideration Tests
 *
 * Tests for shouldReconsiderLane and shouldSuggestLaneReconsideration.
 */

import {
  resolveInitialLane,
  shouldReconsiderLane,
  shouldSuggestLaneReconsideration,
  mergeLaneProfiles,
} from '../service';
import { observedAt } from './lane-engine.helpers';

describe('Lane Engine — Reconsideration', () => {
  const baseStudentProfile = resolveInitialLane({
    primaryGoal: 'study',
    motivationStyle: 'study_focused',
    observedAt,
  });

  describe('shouldReconsiderLane', () => {
    it('should return false for manual override source', () => {
      const result = shouldReconsiderLane({
        currentProfile: {
          ...baseStudentProfile,
          source: 'manual_override' as const,
        },
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'game_like',
          confidence: 0.8,
        },
        completedSessions: 10,
      });
      expect(result).toBe(false);
    });

    it('should return false for low session count', () => {
      const result = shouldReconsiderLane({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'game_like',
          confidence: 0.8,
        },
        completedSessions: 2,
      });
      expect(result).toBe(false);
    });

    it('should return false when lanes match', () => {
      const result = shouldReconsiderLane({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'student',
          confidence: 0.8,
        },
        completedSessions: 10,
      });
      expect(result).toBe(false);
    });

    it('should return false when confidence is below threshold', () => {
      const result = shouldReconsiderLane({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'game_like',
          confidence: 0.69,
        },
        completedSessions: 10,
      });
      expect(result).toBe(false);
    });

    it('should return true when lanes differ and confidence >= 0.7', () => {
      const result = shouldReconsiderLane({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'game_like',
          confidence: 0.7,
        },
        completedSessions: 10,
      });
      expect(result).toBe(true);
    });

    it('should return true when confidence is high', () => {
      const result = shouldReconsiderLane({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'deep_creative',
          confidence: 0.95,
        },
        completedSessions: 20,
      });
      expect(result).toBe(true);
    });
  });

  describe('shouldSuggestLaneReconsideration', () => {
    it('should return false for low session count', () => {
      const result = shouldSuggestLaneReconsideration({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'game_like',
          confidence: 0.9,
        },
        completedSessions: 2,
      });
      expect(result).toBe(false);
    });

    it('should return false when lanes match', () => {
      const result = shouldSuggestLaneReconsideration({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'student',
          confidence: 0.9,
        },
        completedSessions: 10,
      });
      expect(result).toBe(false);
    });

    it('should return true when lanes differ and confidence >= 0.7', () => {
      const result = shouldSuggestLaneReconsideration({
        currentProfile: baseStudentProfile,
        latestProfile: {
          ...baseStudentProfile,
          primaryLane: 'game_like',
          confidence: 0.7,
        },
        completedSessions: 10,
      });
      expect(result).toBe(true);
    });
  });

});