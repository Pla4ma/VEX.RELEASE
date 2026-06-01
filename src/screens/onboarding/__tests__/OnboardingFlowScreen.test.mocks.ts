import type React from 'react';

export const mockCompleteOnboarding = jest.fn();
export const mockNavigate = jest.fn();
export const mockReplace = jest.fn();
export const mockSaveDraft = jest.fn();
export const mockSetParams = jest.fn();
export const mockShowHomeHighlight = jest.fn();
export const mockTrackFirstSessionStarted = jest.fn();
export const mockTrackGoalSet = jest.fn();
export const mockTrackOnboardingCompleted = jest.fn();
export const mockTrackOnboardingStarted = jest.fn();

jest.mock('react-native', () => {
  const ReactRuntime = require('react');
  const createComponent =
    (name: string) =>
    ({ children, ...props }: React.PropsWithChildren<object>) =>
      ReactRuntime.createElement(name, props, children);

  return {
    Pressable: createComponent('Pressable'),
    ScrollView: createComponent('ScrollView'),
    Text: createComponent('Text'),
    View: createComponent('View'),
  };
});
jest.mock('../../../store', () => ({ useAuthStore: jest.fn() }));
jest.mock('../../../onboarding', () => {
  const actual = jest.requireActual('../../../onboarding');
  return { ...actual, useOnboardingStore: jest.fn() };
});
jest.mock('../../../session/hooks/useSession', () => ({
  useSessionHistory: jest.fn(),
}));
jest.mock('../../../features/liveops-config', () => ({
  useDisclosureAnalytics: jest.fn(),
}));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: jest.fn(
    (
      selector: (state: {
        showHomeHighlight: typeof mockShowHomeHighlight;
      }) => unknown,
    ) => selector({ showHomeHighlight: mockShowHomeHighlight }),
  ),
}));
jest.mock('../../../utils/haptics', () => ({
  triggerHaptic: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../home/HomeScreenVisuals', () => ({
  getHeroGradientColors: () => ['#111111', '#222222'],
}));
jest.mock('expo-linear-gradient', () => {
  const ReactRuntime = require('react');
  const { View: MockView } = require('react-native');
  return {
    LinearGradient: ({ children }: React.PropsWithChildren) =>
      ReactRuntime.createElement(MockView, null, children),
  };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    setParams: mockSetParams,
  }),
  useRoute: () => ({ params: {} }),
}));
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      borderRadius: { '3xl': 24 },
      colors: {
        background: { primary: '#ffffff', secondary: '#f5f5f5' },
        border: { DEFAULT: '#dddddd' },
        error: { DEFAULT: '#dc2626' },
        primary: { 500: '#2563eb' },
        text: { inverse: '#ffffff', primary: '#111111', secondary: '#666666' },
      },
      spacing: { 4: 16, 5: 20, 6: 24, 8: 32 },
    },
  }),
}));
jest.mock('../../../components/premium', () => ({
  PremiumSurface: () => null,
}));
jest.mock('../../../components/primitives/Button', () => ({
  Button: ({
    children,
    isDisabled,
    isLoading,
    onPress,
  }: React.PropsWithChildren<{
    isDisabled?: boolean;
    isLoading?: boolean;
    onPress?: () => void;
  }>) => {
    const ReactRuntime = require('react');
    const {
      Pressable: MockPressable,
      Text: MockText,
    } = require('react-native');
    return ReactRuntime.createElement(
      MockPressable,
      {
        accessibilityRole: 'button',
        disabled: isDisabled || isLoading,
        onPress,
      },
      ReactRuntime.createElement(MockText, null, children),
    );
  },
}));
jest.mock('../../../components/primitives/Text', () => ({
  Text: ({ children, ...props }: React.PropsWithChildren<object>) => {
    const ReactRuntime = require('react');
    const { Text: MockText } = require('react-native');
    return ReactRuntime.createElement(MockText, props, children);
  },
}));
