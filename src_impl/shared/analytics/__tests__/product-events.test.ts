import { ProductAnalyticsEvents } from '../product-events';

describe('ProductAnalyticsEvents', () => {
  it('uses stable snake_case event names', () => {
    expect(Object.values(ProductAnalyticsEvents)).toEqual([
      'app_opened',
      'error_occurred',
      'core_flow_abandoned',
      'settings_changed',
    ]);
  });
});
