import { validateRouteParams } from '../route-param-schemas';

describe('route param schemas', () => {
  it('accepts recovery mode session setup params', () => {
    expect(() =>
      validateRouteParams('SessionSetup', {
        presetDuration: 600,
        presetMode: 'RECOVERY',
      }),
    ).not.toThrow();
  });
});
