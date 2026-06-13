import {
  isNavigationReady,
  isCurrentRoute,
  getCurrentRouteName,
} from '../navigation-safety';

describe('isNavigationReady', () => {
  it('returns true for valid navigation object', () => {
    const nav = { navigate: jest.fn() };
    expect(isNavigationReady(nav)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNavigationReady(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNavigationReady(undefined)).toBe(false);
  });

  it('returns false for object without navigate', () => {
    expect(isNavigationReady({} as never)).toBe(false);
  });

  it('returns false when navigate is not a function', () => {
    expect(isNavigationReady({ navigate: 'not-a-function' } as never)).toBe(false);
  });
});

describe('isCurrentRoute', () => {
  it('returns true when route matches', () => {
    expect(isCurrentRoute('Home', 'Home')).toBe(true);
  });

  it('returns false when route does not match', () => {
    expect(isCurrentRoute('Home', 'Settings')).toBe(false);
  });

  it('returns false when routeName is undefined', () => {
    expect(isCurrentRoute(undefined, 'Home')).toBe(false);
  });
});

describe('getCurrentRouteName', () => {
  it('returns current route name from state', () => {
    const state = {
      routes: [{ name: 'Home' }, { name: 'Settings' }],
      index: 1,
    };
    expect(getCurrentRouteName(state)).toBe('Settings');
  });

  it('returns first route when index is 0', () => {
    const state = {
      routes: [{ name: 'Home' }, { name: 'Settings' }],
      index: 0,
    };
    expect(getCurrentRouteName(state)).toBe('Home');
  });

  it('returns undefined for undefined state', () => {
    expect(getCurrentRouteName(undefined)).toBeUndefined();
  });

  it('handles single route', () => {
    const state = { routes: [{ name: 'Home' }], index: 0 };
    expect(getCurrentRouteName(state)).toBe('Home');
  });
});
