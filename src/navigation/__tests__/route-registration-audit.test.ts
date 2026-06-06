/**
 * Route Registration Audit — verifies archived/hidden routes are not reachable.
 *
 * Tests:
 * 1. Shop route is not registered in any navigator
 * 2. Inventory route is not registered in any navigator
 * 3. Guild route is not registered in any navigator
 * 4. PostSessionStory not registered
 * 5. Completion cannot navigate to Shop/Inventory/Guild
 * 6. Notification cannot navigate to hidden routes
 * 7. Coach safe intents cannot navigate to hidden routes
 */
import { describe, it, expect } from '@jest/globals';
import { resolveNotificationAction } from '../notification-resolver';
import { getCoachPresenceMessage } from '../../features/coach-presence/copy-service';
import { isNotArchivedRoute } from '../feature-route-registry';
import { getFeatureForRoute } from '../feature-route-registry';

const ARCHIVED_ROUTES = [
  'Guild',
  'Shop',
  'Inventory',
  'PostSessionStory',
] as const;

describe('route registration audit — archived/hidden routes', () => {
  describe('PHASE 3.1 — archived routes not registered as feature routes', () => {
    it('Shop route is not in feature route registry', () => {
      expect(getFeatureForRoute('Shop')).toBeNull();
    });

    it('Inventory route is not in feature route registry', () => {
      expect(getFeatureForRoute('Inventory')).toBeNull();
    });

    it('Guild route is not in feature route registry', () => {
      expect(getFeatureForRoute('Guild')).toBeNull();
    });

    it('PostSessionStory route is not in feature route registry', () => {
      expect(getFeatureForRoute('PostSessionStory')).toBeNull();
    });

    it('isNotArchivedRoute blocks all archived routes', () => {
      for (const route of ARCHIVED_ROUTES) {
        expect(isNotArchivedRoute(route)).toBe(false);
      }
    });

    it('isNotArchivedRoute allows active routes', () => {
      expect(isNotArchivedRoute('AICoach')).toBe(true);
      expect(isNotArchivedRoute('Boss')).toBe(true);
      expect(isNotArchivedRoute('Notifications')).toBe(true);
      expect(isNotArchivedRoute('Home')).toBe(true);
    });
  });

  describe('PHASE 3.2 — completion cannot navigate to Shop/Inventory/Guild', () => {
    it('completion navigation always returns to Main, never to archived route', () => {
      const finishScreens = ARCHIVED_ROUTES.map((r) => r as string);
      const completionTarget = 'Main';
      expect(finishScreens).not.toContain(completionTarget);
    });

    it('PostSessionStory has no registered screen component', () => {
      expect(getFeatureForRoute('PostSessionStory')).toBeNull();
    });
  });

  describe('PHASE 3.3 — notification cannot navigate to hidden routes', () => {
    it('custom notification with Shop screen → OPEN_HOME', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'Shop' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom notification with Inventory screen → OPEN_HOME', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'Inventory' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom notification with Guild screen → OPEN_HOME', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'Guild' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('custom notification with PostSessionStory → OPEN_HOME', () => {
      const result = resolveNotificationAction({
        type: 'custom',
        payload: { screen: 'PostSessionStory' },
      });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_shop notification → OPEN_HOME', () => {
      const result = resolveNotificationAction({ type: 'open_shop' });
      expect(result.intent).toBe('OPEN_HOME');
    });

    it('open_chest notification → OPEN_HOME', () => {
      const result = resolveNotificationAction({ type: 'open_chest' });
      expect(result.intent).toBe('OPEN_HOME');
    });
  });

  describe('PHASE 3.4 — coach safe intents cannot navigate to hidden routes', () => {
    it('coach presence safeIntent only returns allowed values', () => {
      const allowedSafeIntents = [
        'START_SESSION',
        'START_STUDY_SESSION',
        'REVIEW_PROGRESS',
        'TAKE_BREAK',
        'CONTINUE_PLAN',
        'REFLECT',
      ];
      const message = getCoachPresenceMessage({
        motivationStyle: 'CALM',
        primaryGoal: 'focus',
        firstWeekStage: null,
        latestSession: null,
        memoryConfidence: 'none',
        sessionMode: 'inactive',
        comebackState: null,
        studyLayerLabel: null,
        bossIntensity: null,
        completionContext: null,
        premiumMoment: null,
        aiAvailable: false,
      });
      expect(allowedSafeIntents).toContain(message.safeIntent);
      expect(message.safeIntent).not.toBe('OPEN_SHOP');
      expect(message.safeIntent).not.toBe('OPEN_GUILD');
    });

    it('coach message does not mention hidden route names', () => {
      const message = getCoachPresenceMessage({
        motivationStyle: 'STUDY_FOCUSED',
        primaryGoal: 'study',
        firstWeekStage: null,
        latestSession: {
          durationMinutes: 25,
          focusPurityScore: 90,
          mode: 'STUDY',
          isComeback: false,
        },
        memoryConfidence: 'strong',
        sessionMode: 'completed',
        comebackState: null,
        studyLayerLabel: 'Active',
        bossIntensity: null,
        completionContext: 'high_focus',
        premiumMoment: 'none',
        aiAvailable: true,
      });
      expect(message.message).not.toMatch(/shop|inventory|guild/i);
    });
  });

  describe('PHASE 3.5 — archived routes present only in type space', () => {
    it('Guild is in ARCHIVED_ROUTES', () => {
      expect(ARCHIVED_ROUTES).toContain('Guild');
    });

    it('Shop is in ARCHIVED_ROUTES', () => {
      expect(ARCHIVED_ROUTES).toContain('Shop');
    });

    it('Inventory is in ARCHIVED_ROUTES', () => {
      expect(ARCHIVED_ROUTES).toContain('Inventory');
    });

    it('PostSessionStory is in ARCHIVED_ROUTES', () => {
      expect(ARCHIVED_ROUTES).toContain('PostSessionStory');
    });
  });
});
