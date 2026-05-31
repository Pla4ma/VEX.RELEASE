import {
  validateIntent,
  resolveRouteFromIntent,
  isIntentRoutable,
  INTENT_ROUTE_MAP,
  type AIActionIntent,
} from '../ai-intent-routing';

describe('AI Intent Routing', () => {
  describe('validateIntent', () => {
    it('accepts valid intents', () => {
      expect(validateIntent('START_SESSION')).toBe('START_SESSION');
      expect(validateIntent('VIEW_PROGRESS')).toBe('VIEW_PROGRESS');
      expect(validateIntent('NONE')).toBe('NONE');
    });

    it('rejects invalid/unknown intents to NONE', () => {
      expect(validateIntent('Boss')).toBe('NONE');
      expect(validateIntent('SessionSetup')).toBe('NONE');
      expect(validateIntent('')).toBe('NONE');
      expect(validateIntent(null)).toBe('NONE');
      expect(validateIntent(undefined)).toBe('NONE');
    });

    it('rejects arbitrary string route names', () => {
      expect(validateIntent('Main')).toBe('NONE');
      expect(validateIntent('Settings')).toBe('NONE');
      expect(validateIntent('Profile')).toBe('NONE');
    });

    it('rejects malformed input', () => {
      expect(validateIntent(123)).toBe('NONE');
      expect(validateIntent({})).toBe('NONE');
      expect(validateIntent([])).toBe('NONE');
    });
  });

  describe('resolveRouteFromIntent', () => {
    it('maps START_SESSION to SessionSetup for free users', () => {
      const result = resolveRouteFromIntent('START_SESSION', 'free', 1);
      expect(result.intent).toBe('START_SESSION');
      expect(result.screen).toBe('SessionSetup');
    });

    it('maps NONE to empty screen', () => {
      const result = resolveRouteFromIntent('NONE', 'free', 1);
      expect(result.screen).toBe('');
    });

    it('blocks OPEN_CONTENT_STUDY for free users', () => {
      const result = resolveRouteFromIntent('OPEN_CONTENT_STUDY', 'free', 10);
      expect(result.screen).toBe('');
    });

    it('allows OPEN_CONTENT_STUDY for paid users with sufficient level', () => {
      const result = resolveRouteFromIntent('OPEN_CONTENT_STUDY', 'paid', 10);
      expect(result.screen).toBe('ContentInput');
    });

    it('blocks OPEN_CONTENT_STUDY for paid users below min level', () => {
      const result = resolveRouteFromIntent('OPEN_CONTENT_STUDY', 'paid', 3);
      expect(result.screen).toBe('');
    });

    it('blocks VIEW_BOSS for users below level 5', () => {
      const result = resolveRouteFromIntent('VIEW_BOSS', 'paid', 4);
      expect(result.screen).toBe('');
    });

    it('allows VIEW_BOSS for users at level 5', () => {
      const result = resolveRouteFromIntent('VIEW_BOSS', 'paid', 5);
      expect(result.screen).toBe('BossTab');
    });

    it('allows internal users to access everything', () => {
      const intents: AIActionIntent[] = [
        'START_SESSION',
        'VIEW_PROGRESS',
        'VIEW_SETTINGS',
        'START_COMEBACK',
        'VIEW_BOSS',
        'VIEW_CHALLENGES',
        'OPEN_COACH',
        'OPEN_CONTENT_STUDY',
      ];
      for (const intent of intents) {
        const result = resolveRouteFromIntent(intent, 'internal', 20);
        expect(result.screen).not.toBe('');
      }
    });
  });

  describe('isIntentRoutable', () => {
    it('returns true for valid accessible intents', () => {
      expect(isIntentRoutable('START_SESSION', 'free', 1)).toBe(true);
      expect(isIntentRoutable('VIEW_PROGRESS', 'free', 1)).toBe(true);
    });

    it('returns false for NONE', () => {
      expect(isIntentRoutable('NONE', 'free', 1)).toBe(false);
    });

    it('returns false for level-gated intents below threshold', () => {
      expect(isIntentRoutable('VIEW_BOSS', 'free', 1)).toBe(false);
    });

    it('returns false for tier-gated intents', () => {
      expect(isIntentRoutable('OPEN_CONTENT_STUDY', 'free', 10)).toBe(false);
    });
  });

  describe('intent route map integrity', () => {
    it('every defined intent has a corresponding route entry', () => {
      const intents = Object.keys(INTENT_ROUTE_MAP) as AIActionIntent[];
      expect(intents.length).toBeGreaterThan(0);
      for (const intent of intents) {
        expect(INTENT_ROUTE_MAP[intent]).toBeDefined();
      }
    });

    it('no intent maps to same screen with conflicting gates', () => {
      const screens = new Map<string, { minLevel?: number }>();
      for (const [intent, route] of Object.entries(INTENT_ROUTE_MAP)) {
        if (route.screen && route.allowed) {
          screens.set(`${route.screen}_${intent}`, {
            minLevel: route.minLevel,
          });
        }
      }
      expect(screens.size).toBeGreaterThan(0);
    });
  });
});
