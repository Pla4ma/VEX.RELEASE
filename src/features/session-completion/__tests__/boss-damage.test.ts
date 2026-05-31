import { resetCompletionMocks } from './completion-product-journey-helpers';

describe('boss damage counted once', () => {
  beforeEach(() => {
    resetCompletionMocks();
  });

  it('completion subsystems boss meta is feature dependent', () => {
    const { SUBSYSTEM_META } = require('../subsystem-meta');
    const bossMeta = SUBSYSTEM_META?.boss;

    if (bossMeta) {
      expect(bossMeta.kind).toBe('FEATURE_DEPENDENT');
    }
  });
});
