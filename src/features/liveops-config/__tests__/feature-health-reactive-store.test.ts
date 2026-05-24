import { buildFeatureAccess, getFeatureAvailability, type FeatureKey } from '../feature-access';
import {
  getDegradedFeatures,
  setDegradedFeatures,
  subscribeToDegradedFeatures,
} from '../feature-access-store';

describe('feature health reactive store', () => {
  afterEach(() => {
    setDegradedFeatures(new Set<FeatureKey>());
  });

  it('writes degraded features to the shared health source', () => {
    const degraded = new Set<FeatureKey>(['content_study']);

    setDegradedFeatures(degraded);

    expect(getDegradedFeatures()).toBe(degraded);
  });

  it('notifies all subscribers when degraded features change', () => {
    const first = jest.fn();
    const second = jest.fn();
    const unsubscribeFirst = subscribeToDegradedFeatures(first);
    const unsubscribeSecond = subscribeToDegradedFeatures(second);

    setDegradedFeatures(new Set<FeatureKey>(['boss_tab']));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    unsubscribeFirst();
    unsubscribeSecond();
  });

  it('content_study degraded produces degraded availability', () => {
    const access = buildFeatureAccess({
      totalCompletedSessions: 20,
      degradedFeatures: new Set<FeatureKey>(['content_study']),
    });

    expect(getFeatureAvailability(access.features.content_study).state).toBe('degraded');
  });

  it('boss_tab degraded blocks queries, navigation, and subscriptions', () => {
    const access = buildFeatureAccess({
      totalCompletedSessions: 20,
      degradedFeatures: new Set<FeatureKey>(['boss_tab']),
    });
    const availability = getFeatureAvailability(access.features.boss_tab);

    expect(availability.state).toBe('degraded');
    expect(availability.canQuery).toBe(false);
    expect(availability.canNavigate).toBe(false);
    expect(availability.canSubscribeToEvents).toBe(false);
  });

  it('premium_paywall degraded cannot become an active premium surface', () => {
    const access = buildFeatureAccess({
      totalCompletedSessions: 40,
      degradedFeatures: new Set<FeatureKey>(['premium_paywall']),
    });
    const availability = getFeatureAvailability(access.features.premium_paywall);

    expect(availability.state).toBe('disabled');
    expect(availability.canRenderEntryPoint).toBe(false);
    expect(availability.canNavigate).toBe(false);
  });
});
