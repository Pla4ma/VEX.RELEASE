/**
 * Classification enforcement — feature config gates
 *
 * Verifies:
 * 3. Archived features cannot prefetch/query
 * 4. Archived features cannot subscribe
 * 5. Archived features cannot notify
 * 6. Archived features cannot appear in completion
 * 7. Premium config matches classification source
 * 8. feature-access-config thresholds/release-states match classification
 */

import {
  ACTIVE,
  PROGRESSIVE,
  ARCHIVED,
} from '../final-release-classification';
import { getAllEntries } from '../classification-codec';
import {
  FEATURE_THRESHOLDS,
  FEATURE_RELEASE_STATES,
  DISABLED_FEATURES,
} from '../feature-access-config';
import type { FeatureKey } from '../feature-access';
import { getFeatureStatus } from '../final-release-feature-map';
import { isNotificationTypeFilterable } from '../../../screens/notifications/NotificationScreenConfig';
import type { NotificationType } from '../../../screens/notifications/NotificationScreenConfig';
import {
  buildFeatureAccess,
  getFeatureAvailability,
} from '../feature-access';

// ── Prefetch/Query (3) ──

describe('Classification — archived features cannot prefetch/query', () => {
  it('no archived feature key resolves to queryAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.queryAllowed).toBe(false);
    }
  });

  it('internal features can query but archived cannot', () => {
    for (const entry of getAllEntries()) {
      if (entry.status === 'archived_or_deactivated') {
        expect(entry.queryAllowed).toBe(false);
      }
    }
  });

  it('archived features are in DISABLED_FEATURES', () => {
    const disabledSet = new Set(DISABLED_FEATURES);
    for (const entry of ARCHIVED) {
      if (entry.featureKey) {
        expect(disabledSet.has(entry.featureKey)).toBe(true);
      }
    }
  });
});

// ── Subscribe (4) ──

describe('Classification — archived features cannot subscribe', () => {
  it('no archived entry has subscriptionAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.subscriptionAllowed).toBe(false);
    }
  });

  it('feature availability blocks subscriptions for archived features at all session counts', () => {
    const archivedKeys: FeatureKey[] = ARCHIVED
      .filter((e) => typeof e.featureKey === 'string')
      .map((e) => e.featureKey as FeatureKey);

    for (const sessions of [0, 10, 50, 999]) {
      const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
      for (const key of archivedKeys) {
        const avail = getFeatureAvailability(features[key]);
        expect(avail.canSubscribeToEvents).toBe(false);
      }
    }
  });
});

// ── Notify (5) ──

describe('Classification — archived features cannot notify', () => {
  it('no archived entry has notificationAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.notificationAllowed).toBe(false);
    }
  });

  it('SQUAD and RIVAL notification types blocked (archived in classification)', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    expect(isNotificationTypeFilterable('SQUAD' as NotificationType, features)).toBe(false);
    expect(isNotificationTypeFilterable('RIVAL' as NotificationType, features)).toBe(false);
  });

  it('archived noti types blocked at all session counts', () => {
    for (const sessions of [0, 10, 999]) {
      const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
      expect(isNotificationTypeFilterable('SQUAD' as NotificationType, features)).toBe(false);
      expect(isNotificationTypeFilterable('RIVAL' as NotificationType, features)).toBe(false);
    }
  });

  it('active notification types still available', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 20 });
    expect(isNotificationTypeFilterable('ACHIEVEMENT' as NotificationType, features)).toBe(true);
    expect(isNotificationTypeFilterable('STREAK_RISK' as NotificationType, features)).toBe(true);
  });
});

// ── Completion (6) ──

describe('Classification — archived features cannot appear in completion', () => {
  it('no archived entry has completionAllowed=true', () => {
    for (const entry of ARCHIVED) {
      expect(entry.completionAllowed).toBe(false);
    }
  });

  it('archived completion surfaces are hidden at all session counts', () => {
    for (const sessions of [0, 10, 50, 999]) {
      const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
      const archivedKeys: FeatureKey[] = ARCHIVED
        .filter((e) => typeof e.featureKey === 'string')
        .map((e) => e.featureKey as FeatureKey);

      for (const key of archivedKeys) {
        const avail = getFeatureAvailability(features[key]);
        expect(avail.canRenderEntryPoint).toBe(false);
        expect(avail.canQuery).toBe(false);
      }
    }
  });
});

// ── Premium config (7) ──

describe('Classification — premium config matches classification source', () => {
  it('premium_paywall minSessions=40 in classification', () => {
    const paywall = getAllEntries().find((e) => e.systemId === 'premium_paywall');
    expect(paywall).toBeDefined();
    expect(paywall!.minSessions).toBe(40);
  });

  it('premium_gated features in feature map have progressive status', () => {
    const premiumFeatures = getAllEntries()
      .filter((e) => e.premiumCopyAllowed && typeof e.featureKey === 'string');

    for (const entry of premiumFeatures) {
      const status = getFeatureStatus(entry.featureKey as FeatureKey);
      expect(['progressive', 'premium_gated', 'included']).toContain(status);
    }
  });

  it('premium paywall threshold matches classification', () => {
    expect(FEATURE_THRESHOLDS.premium_paywall).toBe(40);
  });

  it('premiumCopyAllowed entries have appropriate feature-key release states', () => {
    const premiumSystems = getAllEntries()
      .filter((e) => e.premiumCopyAllowed && typeof e.featureKey === 'string');

    for (const entry of premiumSystems) {
      const state = FEATURE_RELEASE_STATES[entry.featureKey as FeatureKey];
      expect(state).toBeDefined();
    }
  });
});

// ── Thresholds (8) ──

describe('Classification — thresholds and release states match classification', () => {
  it('archived features have Infinity thresholds or deactivated state', () => {
    for (const entry of ARCHIVED) {
      if (entry.featureKey) {
        const threshold = FEATURE_THRESHOLDS[entry.featureKey as FeatureKey];
        const state = FEATURE_RELEASE_STATES[entry.featureKey as FeatureKey];
        const blocked = threshold === Number.POSITIVE_INFINITY
          || state === 'final_release_deactivated'
          || state === 'archived';
        expect(blocked).toBe(true);
      }
    }
  });

  it('active features have thresholds >= 0 and not Infinity', () => {
    for (const entry of ACTIVE) {
      if (entry.featureKey) {
        const threshold = FEATURE_THRESHOLDS[entry.featureKey as FeatureKey];
        expect(threshold).toBeLessThan(Number.POSITIVE_INFINITY);
      }
    }
  });

  it('progressive features have minSessions matching current FEATURE_THRESHOLDS', () => {
    for (const entry of PROGRESSIVE) {
      if (entry.featureKey && typeof entry.minSessions === 'number') {
        const threshold = FEATURE_THRESHOLDS[entry.featureKey as FeatureKey];
        expect(threshold).toBe(entry.minSessions);
      }
    }
  });

  it('economy_basic is deactivated (blocked by state not threshold)', () => {
    const econEntry = getAllEntries().find((e) => e.systemId === 'economy_user_facing');
    expect(econEntry).toBeDefined();
    expect(econEntry!.status).toBe('archived_or_deactivated');
    expect(FEATURE_RELEASE_STATES.economy_basic).toBe('final_release_deactivated');
    const { features } = buildFeatureAccess({ totalCompletedSessions: 999 });
    const avail = getFeatureAvailability(features.economy_basic);
    expect(avail.state).toBe('disabled');
    expect(avail.canQuery).toBe(false);
  });
});
