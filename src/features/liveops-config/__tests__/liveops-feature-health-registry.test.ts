/**
 * Liveops Config Feature — FeatureHealthRegistry Tests (part 1: registration & status)
 */

import { featureHealthRegistry } from '../feature-health';
import type { FeatureHealthCheck } from '../feature-health';

describe('FeatureHealthRegistry (singleton)', () => {
  // Use unique IDs per test to avoid cross-test pollution on the singleton
  let testCounter = 0;
  function nextId(): string {
    return `test_check_${++testCounter}`;
  }

  afterEach(() => {
    // Clean up: unregister anything we added and invalidate cache
    featureHealthRegistry.invalidateCache();
    for (const id of featureHealthRegistry.getRegisteredIds()) {
      if (id.startsWith('test_check_')) {
        featureHealthRegistry.unregister(id);
      }
    }
  });

  it('registers and retrieves health checks', () => {
    const id = nextId();
    featureHealthRegistry.register({
      id,
      feature: 'content_study',
      label: 'Test',
      dependency: 'test',
      check: () => 'healthy',
    });
    expect(featureHealthRegistry.getRegisteredIds()).toContain(id);
  });

  it('does not register duplicate IDs', () => {
    const id = nextId();
    const check: FeatureHealthCheck = {
      id,
      feature: 'content_study',
      label: 'Test',
      dependency: 'test',
      check: () => 'healthy',
    };
    featureHealthRegistry.register(check);
    featureHealthRegistry.register(check);
    expect(
      featureHealthRegistry.getRegisteredIds().filter((i) => i === id),
    ).toHaveLength(1);
  });

  it('unregisters health checks', () => {
    const id = nextId();
    featureHealthRegistry.register({
      id,
      feature: 'content_study',
      label: 'Test',
      dependency: 'test',
      check: () => 'healthy',
    });
    featureHealthRegistry.unregister(id);
    expect(featureHealthRegistry.getRegisteredIds()).not.toContain(id);
  });

  it('returns healthy for feature with no checks', async () => {
    // memory_console likely has no test checks registered
    const status = await featureHealthRegistry.getFeatureHealth('memory_console');
    expect(status).toBe('healthy');
  });

  it('returns healthy when all checks pass', async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: 'content_study', label: 'C1', dependency: 'd1',
      check: () => 'healthy',
    });
    featureHealthRegistry.register({
      id: id2, feature: 'content_study', label: 'C2', dependency: 'd2',
      check: () => 'healthy',
    });
    const status = await featureHealthRegistry.getFeatureHealth('content_study');
    expect(status).toBe('healthy');
  });

  it('returns degraded when at least one check is degraded', async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: 'content_study', label: 'C1', dependency: 'd1',
      check: () => 'healthy',
    });
    featureHealthRegistry.register({
      id: id2, feature: 'content_study', label: 'C2', dependency: 'd2',
      check: () => 'degraded',
    });
    const status = await featureHealthRegistry.getFeatureHealth('content_study');
    expect(status).toBe('degraded');
  });

  it('returns unavailable immediately when any check is unavailable', async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: 'content_study', label: 'C1', dependency: 'd1',
      check: () => 'degraded',
    });
    featureHealthRegistry.register({
      id: id2, feature: 'content_study', label: 'C2', dependency: 'd2',
      check: () => 'unavailable',
    });
    const status = await featureHealthRegistry.getFeatureHealth('content_study');
    expect(status).toBe('unavailable');
  });
});
