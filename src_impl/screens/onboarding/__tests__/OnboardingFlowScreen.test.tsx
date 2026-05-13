import React from 'react';
import { Pressable, Text } from 'react-native';
import renderer, { act, type ReactTestInstance } from 'react-test-renderer';

import { OnboardingFlowScreen } from '../OnboardingFlowScreen';
import { useDisclosureAnalytics } from '../../../features/liveops-config';
import { useSessionHistory } from '../../../session/hooks/useSession';
import { useOnboardingStore } from '../../../onboarding';
import { useAuthStore } from '../../../store';

const mockCompleteOnboarding = jest.fn();
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockSaveDraft = jest.fn();
const mockSetParams = jest.fn();
const mockShowHomeHighlight = jest.fn();
const mockTrackFirstSessionStarted = jest.fn();
const mockTrackGoalSet = jest.fn();
const mockTrackOnboardingCompleted = jest.fn();
const mockTrackOnboardingStarted = jest.fn();

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
jest.mock('../../../session/hooks/useSession', () => ({ useSessionHistory: jest.fn() }));
jest.mock('../../../features/liveops-config', () => ({ useDisclosureAnalytics: jest.fn() }));
jest.mock('../../../store/session-state', () => ({
  useSessionUIStore: jest.fn((selector: (state: { showHomeHighlight: typeof mockShowHomeHighlight }) => unknown) =>
    selector({ showHomeHighlight: mockShowHomeHighlight })),
}));
jest.mock('../../../utils/haptics', () => ({ triggerHaptic: jest.fn(() => Promise.resolve()) }));
jest.mock('../../home/HomeScreenVisuals', () => ({ getHeroGradientColors: () => ['theme.colors.primary[500]', 'theme.colors.primary[500]'] }));
jest.mock('expo-linear-gradient', () => {
  const ReactRuntime = require('react');
  const { View: MockView } = require('react-native');
  return { LinearGradient: ({ children }: React.PropsWithChildren) => ReactRuntime.createElement(MockView, null, children) };
});
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace, setParams: mockSetParams }),
  useRoute: () => ({ params: {} }),
}));
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      borderRadius: { '3xl': 24 },
      colors: {
        background: { primary: 'theme.colors.background.primary', secondary: 'theme.colors.primary[500]' },
        border: { DEFAULT: 'theme.colors.primary[500]' },
        error: { DEFAULT: 'theme.colors.primary[500]' },
        primary: { 500: 'theme.colors.primary[500]' },
        text: { inverse: 'theme.colors.background.primary', primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]' },
      },
      spacing: { 4: 16, 5: 20, 6: 24, 8: 32 },
    },
  }),
}));
jest.mock('../../../components/premium', () => ({ PremiumSurface: () => null }));
jest.mock('../../../components/primitives/Button', () => ({
  Button: ({ children, isDisabled, isLoading, onPress }: React.PropsWithChildren<{ isDisabled?: boolean; isLoading?: boolean; onPress?: () => void }>) => {
    const ReactRuntime = require('react');
    const { Pressable: MockPressable, Text: MockText } = require('react-native');
    return ReactRuntime.createElement(MockPressable, { accessibilityRole: 'button', disabled: isDisabled || isLoading, onPress }, ReactRuntime.createElement(MockText, null, children));
  },
}));
jest.mock('../../../components/primitives/Text', () => ({
  Text: ({ children, ...props }: React.PropsWithChildren<object>) => {
    const ReactRuntime = require('react');
    const { Text: MockText } = require('react-native');
    return ReactRuntime.createElement(MockText, props, children);
  },
}));

const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockedUseDisclosureAnalytics = useDisclosureAnalytics as jest.MockedFunction<typeof useDisclosureAnalytics>;
const mockedUseOnboardingStore = useOnboardingStore as jest.MockedFunction<typeof useOnboardingStore>;
const mockedUseSessionHistory = useSessionHistory as jest.MockedFunction<typeof useSessionHistory>;

function textFromChildren(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(textFromChildren).join('');
  }

  return '';
}

function pressByText(root: ReactTestInstance, label: string): void {
  const target = root.findAllByType(Pressable).find((pressable) =>
    pressable.findAllByType(Text).some((textNode) => textFromChildren(textNode.props.children) === label),
  );

  if (!target || typeof target.props.onPress !== 'function') {
    throw new Error(`Missing pressable text: ${label}`);
  }

  act(() => {
    target.props.onPress();
  });
}

describe('OnboardingFlowScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockReturnValue({ user: { id: 'user-1' } } as ReturnType<typeof useAuthStore>);
    mockedUseSessionHistory.mockReturnValue({ history: [] } as ReturnType<typeof useSessionHistory>);
    mockedUseDisclosureAnalytics.mockReturnValue({
      trackFirstSessionStarted: mockTrackFirstSessionStarted,
      trackOnboardingCompleted: mockTrackOnboardingCompleted,
      trackOnboardingFirstSessionCompleted: jest.fn(),
      trackOnboardingGoalSet: mockTrackGoalSet,
      trackOnboardingStarted: mockTrackOnboardingStarted,
    } as ReturnType<typeof useDisclosureAnalytics>);
    mockedUseOnboardingStore.mockImplementation((selector) =>
      selector({
        completeOnboarding: mockCompleteOnboarding,
        getDraft: () => undefined,
        saveDraft: mockSaveDraft,
      } as Parameters<typeof selector>[0]));
  });

  it('sends a new user to a first session quickly', () => {
    const tree = renderer.create(<OnboardingFlowScreen />);

    pressByText(tree.root, 'Build consistency');
    pressByText(tree.root, 'Continue');
    pressByText(tree.root, 'Continue');
    pressByText(tree.root, 'Start 15 min Session');

    expect(mockTrackGoalSet).toHaveBeenCalledWith('user-1', 'build_consistency');
    expect(mockTrackFirstSessionStarted).toHaveBeenCalledWith('user-1', 'onboarding');
    expect(mockNavigate).toHaveBeenCalledWith('SessionStack', {
      screen: 'SessionSetup',
      params: {
        goal: 'Build consistency',
        presetId: 'quick',
        source: 'onboarding_first_session',
      },
    });
  });

  it('can skip the first session while safely persisting defaults', () => {
    const tree = renderer.create(<OnboardingFlowScreen />);

    pressByText(tree.root, 'Build consistency');
    pressByText(tree.root, 'Continue');
    pressByText(tree.root, 'Continue');
    pressByText(tree.root, 'Skip first session for now');

    expect(mockCompleteOnboarding).toHaveBeenCalledWith('user-1', {
      element: 'LUMINA',
      goal: 'build_consistency',
      personaId: 'mentor',
      squadId: null,
      starterPresetId: 'quick',
    });
    expect(mockReplace).toHaveBeenCalledWith('Main', expect.objectContaining({ screen: 'Home' }));
  });
});
