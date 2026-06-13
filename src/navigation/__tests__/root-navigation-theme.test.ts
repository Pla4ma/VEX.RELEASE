import { createRootNavigationTheme } from '../root-navigation-theme';

describe('createRootNavigationTheme', () => {
  function makeTheme(overrides = {}) {
    return {
      colors: {
        primary: { 500: '#6366f1' },
        semantic: {
          background: '#ffffff',
          surface: '#f8fafc',
          border: '#e2e8f0',
        },
        text: { primary: '#1e293b' },
        error: { DEFAULT: '#ef4444' },
      },
      ...overrides,
    } as never;
  }

  it('creates dark theme', () => {
    const theme = makeTheme();
    const result = createRootNavigationTheme(theme, true);
    expect(result.dark).toBe(true);
  });

  it('creates light theme', () => {
    const theme = makeTheme();
    const result = createRootNavigationTheme(theme, false);
    expect(result.dark).toBe(false);
  });

  it('maps theme colors to navigation colors', () => {
    const theme = makeTheme();
    const result = createRootNavigationTheme(theme, false);
    expect(result.colors.primary).toBe('#6366f1');
    expect(result.colors.background).toBe('#ffffff');
    expect(result.colors.card).toBe('#f8fafc');
    expect(result.colors.text).toBe('#1e293b');
    expect(result.colors.border).toBe('#e2e8f0');
    expect(result.colors.notification).toBe('#ef4444');
  });

  it('uses different themes for dark mode', () => {
    const darkTheme = makeTheme({
      colors: {
        primary: { 500: '#818cf8' },
        semantic: {
          background: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        },
        text: { primary: '#f1f5f9' },
        error: { DEFAULT: '#f87171' },
      },
    });
    const result = createRootNavigationTheme(darkTheme, true);
    expect(result.colors.background).toBe('#0f172a');
    expect(result.colors.primary).toBe('#818cf8');
  });
});
