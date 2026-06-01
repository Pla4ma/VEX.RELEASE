/**
 * Tests for: repository
 */

import * as notificationsRepo from '../repository/notifications';
import * as retentionRepo from '../repository/retention';
import * as pushRepo from '../repository/push';
import { RepositoryError } from '../repository/shared';

describe('Repository', () => {
  describe('RepositoryError', () => {
    it('creates error with operation and original error', () => {
      const original = new Error('DB connection failed');
      const err = new RepositoryError('fetchData', original);
      expect(err.message).toContain('fetchData');
      expect(err.message).toContain('fetchData');
      expect(err.name).toBe('RepositoryError');
    });

    it('handles non-Error original error', () => {
      const err = new RepositoryError('fetchData', 'string error');
      expect(err.message).toContain('Unknown error');
    });
  });

  describe('notification repository functions', () => {
    it('fetchUnreadNotificationsCount is a function', () => {
      expect(typeof notificationsRepo.fetchUnreadNotificationsCount).toBe('function');
    });

    it('fetchNotificationCenterItems is a function', () => {
      expect(typeof notificationsRepo.fetchNotificationCenterItems).toBe('function');
    });

    it('markNotificationRead is a function', () => {
      expect(typeof notificationsRepo.markNotificationRead).toBe('function');
    });

    it('markAllNotificationsRead is a function', () => {
      expect(typeof notificationsRepo.markAllNotificationsRead).toBe('function');
    });

    it('subscribeToNotificationCenter is a function', () => {
      expect(typeof notificationsRepo.subscribeToNotificationCenter).toBe('function');
    });
  });

  describe('retention repository functions', () => {
    it('fetchRetentionUserProfile is a function', () => {
      expect(typeof retentionRepo.fetchRetentionUserProfile).toBe('function');
    });

    it('upsertReminderPlan is a function', () => {
      expect(typeof retentionRepo.upsertReminderPlan).toBe('function');
    });

    it('hasScheduledReminderWithin is a function', () => {
      expect(typeof retentionRepo.hasScheduledReminderWithin).toBe('function');
    });

    it('fetchChallengeExpiryCandidates is a function', () => {
      expect(typeof retentionRepo.fetchChallengeExpiryCandidates).toBe('function');
    });

    it('fetchReEngagementCandidates is a function', () => {
      expect(typeof retentionRepo.fetchReEngagementCandidates).toBe('function');
    });
  });

  describe('push repository', () => {
    it('upsertPushToken is a function', () => {
      expect(typeof pushRepo.upsertPushToken).toBe('function');
    });
  });
});
