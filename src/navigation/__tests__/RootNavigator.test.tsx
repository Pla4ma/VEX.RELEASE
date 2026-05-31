import React from 'react';
import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { RootNavigator } from '../RootNavigator';
import { useOnboardingStore } from '../../onboarding';
import { useAuthStore } from '../../store';
jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));
jest.mock('../../store', () => ({ useAuthStore: jest.fn() }));
jest.mock('../../onboarding', () => ({ useOnboardingStore: jest.fn() }));
jest.mock('../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: '#ffffff', secondary: '#f5f5f5' },
        primary: { 500: '#2563eb' },
        text: { primary: '#111111', secondary: '#404040' },
        border: { DEFAULT: '#d4d4d4' },
        error: { DEFAULT: '#dc2626' },
        semantic: {
          background: '#ffffff',
          border: '#d4d4d4',
          primary: '#2563eb',
          surface: '#ffffff',
          surfaceElevated: '#ffffff',
          textPrimary: '#111111',
          textSecondary: '#404040',
        },
      },
      spacing: [0, 4, 8, 12, 16, 20],
    },
    isDark: false,
  }),
}));
jest.mock('../components/RootLoadingShell', () => ({
  RootLoadingShell: () => null,
}));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const NavigationContainer = React.forwardRef(
    (
      {
        children,
        onReady,
      }: { children: React.ReactNode; onReady?: () => void },
      _ref: React.Ref<unknown>,
    ) => {
      React.useEffect(() => {
        onReady?.();
      }, [onReady]);
      return React.createElement(View, null, children);
    },
  );
  NavigationContainer.displayName = 'NavigationContainerMock';
  return {
    NavigationContainer,
    useNavigationContainerRef: () => ({
      isReady: () => true,
      getCurrentRoute: () => undefined,
      navigate: jest.fn(),
    }),
  };
});
jest.mock('../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const React = require('react');
    const flattenChildren = (children: React.ReactNode): React.ReactNode[] =>
      React.Children.toArray(children).flatMap((child) => {
        if (React.isValidElement(child) && child.type === React.Fragment) {
          return flattenChildren(child.props.children);
        }
        return [child];
      });
    return {
      Navigator: ({ children }: { children: React.ReactNode }) => {
        const childArray = flattenChildren(children);
        return childArray[0] ?? null;
      },
      Screen: ({
        component: Component,
        getComponent,
      }: {
        component?: React.ComponentType;
        getComponent?: () => React.ComponentType;
      }) => {
        const ScreenComponent = Component ?? getComponent?.();
        return ScreenComponent ? React.createElement(ScreenComponent) : null;
      },
    };
  },
}));
jest.mock('../../streaks/StreakService', () => ({
  getStreakService: jest.fn(() => ({
    getState: () => ({}),
    markFuneralShown: jest.fn(),
  })),
}));
jest.mock('../../screens/streaks/StreakFuneralScreen', () => ({
  StreakFuneralScreen: () => null,
}));
jest.mock('../MainNavigator', () => ({
  MainNavigator: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Main App');
  },
}));
jest.mock('../OnboardingNavigator', () => ({
  OnboardingNavigator: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Onboarding Flow');
  },
}));
jest.mock('../AuthNavigator', () => ({
  AuthNavigator: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Auth Flow');
  },
}));
const mockedUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockedUseOnboardingStore = useOnboardingStore as jest.MockedFunction<
  typeof useOnboardingStore
>;
async function renderRootNavigator(): Promise<ReactTestRenderer> {
  let renderer: ReactTestRenderer | null = null;
  await act(async () => {
    renderer = TestRenderer.create(<RootNavigator />);
    await Promise.resolve();
  });
  if (!renderer) {
    throw new Error('RootNavigator did not render');
  }
  return renderer;
}
function expectRenderedText(renderer: ReactTestRenderer, text: string): void {
  expect(
    renderer.root.findAllByProps({ children: text }).length,
  ).toBeGreaterThan(0);
}
describe('RootNavigator', () => {
  beforeEach(() => {
    mockedUseOnboardingStore.mockImplementation((selector: unknown) =>
      selector({ completedAt: null, isOnboarded: false }),
    );
  });
  it('routes unauthenticated users into auth flow', async () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: jest.fn().mockResolvedValue(undefined),
      user: null,
    } as any);
    const renderer = await renderRootNavigator();
    expectRenderedText(renderer, 'Auth Flow');
  });
  it('routes authenticated users without onboarding into onboarding flow', async () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: jest.fn().mockResolvedValue(undefined),
      user: { id: 'user-1', createdAt: new Date().toISOString() },
    } as any);
    mockedUseOnboardingStore.mockImplementation((selector: unknown) =>
      selector({ completedAt: null, isOnboarded: false }),
    );
    const renderer = await renderRootNavigator();
    expectRenderedText(renderer, 'Onboarding Flow');
  });
  it('routes authenticated onboarded users into the main app', async () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: jest.fn().mockResolvedValue(undefined),
      user: { id: 'user-1', createdAt: new Date(0).toISOString() },
    } as any);
    const completedAt = Date.now();
    mockedUseOnboardingStore.mockImplementation((selector: unknown) =>
      selector({ completedAt, isOnboarded: true }),
    );
    const renderer = await renderRootNavigator();
    expectRenderedText(renderer, 'Main App');
  });
});
