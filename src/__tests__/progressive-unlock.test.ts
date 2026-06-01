import {
  accessFor,
  assertFullyHidden,
  HIDDEN_FEATURE_KEYS,
} from './debloat-test-helpers';
import { getFeatureAvailability } from '../features/liveops-config/feature-access';

describe('Group 5 — Progressive Unlock Runtime', () => {
  it('5a: locked features do not query', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canQuery).toBe(false);
    });

    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(999)[key]);
      expect(a.canQuery).toBe(false);
    });
  });

  it('5b: locked features do not subscribe', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canSubscribeToEvents).toBe(false);
    });
  });

  it('5c: locked features do not notify', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canShowNotification).toBe(false);
    });
  });

  it('5d: hidden features do not route (navigation disabled)', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(5)[key]);
      expect(a.canNavigate).toBe(false);
      expect(a.canRegisterRoute).toBe(false);
    });
  });

  it('5e: hidden features do not render entry points', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canRenderEntryPoint).toBe(false);
    });
  });
});
