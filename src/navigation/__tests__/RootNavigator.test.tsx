import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { RootNavigator } from '../RootNavigator';
import { useOnboardingStore } from '../../onboarding';
import { useAuthStore } from '../../store';

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('../../store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../onboarding', () => ({
  useOnboardingStore: jest.fn(),
}));

jest.mock('../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: '#ffffff', secondary: '#f5f5f5' },
        primary: { 500: '#2563eb' },
        text: { primary: '#111111' },
        border: { DEFAULT: '#d4d4d4' },
        error: { DEFAULT: '#dc2626' },
      },
    },
    isDark: false,
  }),
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
      _ref: React.Ref<unknown>
    ) => {
      React.useEffect(() => {
        onReady?.();
      }, [onReady]);

      return React.createElement(View, null, children);
    }
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
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
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

const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockedUseOnboardingStore = useOnboardingStore as jest.MockedFunction<typeof useOnboardingStore>;

describe('RootNavigator', () => {
  beforeEach(() => {
    mockedUseOnboardingStore.mockImplementation((selector: any) =>
      selector({
        isHydrated: true,
        profiles: {},
      })
    );
  });

  it('routes unauthenticated users into auth flow', async () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: jest.fn().mockResolvedValue(undefined),
      user: null,
    } as any);

    render(<RootNavigator />);

    expect(await screen.findByText('Auth Flow')).toBeTruthy();
  });

  it('routes authenticated users without onboarding into onboarding flow', async () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: jest.fn().mockResolvedValue(undefined),
      user: { id: 'user-1' },
    } as any);

    mockedUseOnboardingStore.mockImplementation((selector: any) =>
      selector({
        isHydrated: true,
        profiles: {},
      })
    );

    render(<RootNavigator />);

    expect(await screen.findByText('Onboarding Flow')).toBeTruthy();
  });

  it('routes authenticated onboarded users into the main app', async () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: jest.fn().mockResolvedValue(undefined),
      user: { id: 'user-1' },
    } as any);

    mockedUseOnboardingStore.mockImplementation((selector: any) =>
      selector({
        isHydrated: true,
        profiles: {
          'user-1': {
            goal: 'build_consistency',
            personaId: 'mentor',
            starterPresetId: 'pomodoro',
            squadId: null,
            completedAt: Date.now(),
          },
        },
      })
    );

    render(<RootNavigator />);

    expect(await screen.findByText('Main App')).toBeTruthy();
  });
});
