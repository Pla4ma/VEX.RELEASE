import { type ReactNode } from 'react';
import type {
  PurchaseResult,
  PurchasesPackageDisplayInfo,
} from '../../../shared/monetization';

export const mockGoBack = jest.fn();
export const mockRetry = jest.fn<Promise<void>, []>();
export const mockPurchase = jest.fn<
  Promise<PurchaseResult>,
  [PurchasesPackageDisplayInfo]
>();
export const mockRestore = jest.fn<Promise<PurchaseResult>, []>();
export const mockRefresh = jest.fn<Promise<void>, []>();

function mockNativeElement(
  name: string,
  props: Record<string, unknown>,
  children?: unknown,
) {
  return require('react').createElement(name, props, children);
}

jest.mock('react-native', () => {
  const makeComponent =
    (name: string) =>
    ({ children, ...props }: { children?: unknown }) =>
      mockNativeElement(name, props, children);
  return {
    KeyboardAvoidingView: makeComponent('KeyboardAvoidingView'),
    Platform: {
      OS: 'ios',
      select: (options: Record<string, unknown>) =>
        options.ios ?? options.default,
    },
    Pressable: makeComponent('Pressable'),
    ScrollView: makeComponent('ScrollView'),
    StyleSheet: { absoluteFill: {} },
    Text: makeComponent('Text'),
    View: makeComponent('View'),
  };
});

jest.mock('react-native-reanimated', () => {
  const View = ({ children, ...props }: { children?: unknown }) =>
    mockNativeElement('AnimatedView', props, children);
  const animation = { duration: () => animation, delay: () => animation };
  const createAnimatedComponent = (component: unknown) => component;
  return {
    __esModule: true,
    default: { View, createAnimatedComponent },
    FadeInDown: animation,
    createAnimatedComponent,
  };
});

jest.mock('../../../shared/monetization', () => ({
  usePaywall: jest.fn(),
  usePremiumStatus: jest.fn(),
}));
jest.mock('../../../shared/analytics', () => ({ capture: jest.fn() }));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: ReactNode }) =>
    mockNativeElement('View', {}, children),
}));
jest.mock('expo-status-bar', () => ({
  StatusBar: () => mockNativeElement('StatusBar', {}),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      contextBody:
        'You just proved this routine matters. Streak Shield can protect one missed day when life interrupts.',
      contextCta: 'Protect My Streak',
      contextHeadline: 'Your streak is worth protecting.',
      source: 'post_session_streak_shield',
      gatedFeature: 'streak_freeze',
    },
  }),
}));
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: {
          primary: '#ffffff',
          secondary: '#f5f5f5',
          tertiary: '#eeeeee',
        },
        primary: { 500: '#2563eb' },
        success: { 500: '#16a34a', DEFAULT: '#16a34a' },
        warning: { DEFAULT: '#f59e0b' },
        error: { DEFAULT: '#dc2626' },
        text: {
          primary: '#111111',
          secondary: '#666666',
          tertiary: '#999999',
          inverse: '#ffffff',
        },
        border: { DEFAULT: '#d4d4d4' },
      },
    },
  }),
}));
jest.mock('../../../shared/ui/components/EnterAnimation', () => ({
  CardEnterAnimation: ({ children }: { children: ReactNode }) =>
    mockNativeElement('View', {}, children),
  StaggeredEnter: ({ children }: { children: ReactNode }) =>
    mockNativeElement('View', {}, children),
}));
jest.mock('../../../icons/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => mockNativeElement('Text', {}, name),
}));
jest.mock('../../../components/primitives/Text', () => ({
  Text: ({ children }: { children: ReactNode }) =>
    mockNativeElement('Text', {}, children),
}));
jest.mock('../../../components/ui/Skeleton', () => ({
  Skeleton: () => mockNativeElement('View', {}),
  SkeletonCard: () => mockNativeElement('View', {}),
}));
jest.mock('../../../components/primitives/Button', () => ({
  Button: ({
    children,
    onPress,
    accessibilityLabel,
  }: {
    children: ReactNode;
    onPress?: () => void;
    accessibilityLabel?: string;
  }) =>
    mockNativeElement(
      'Pressable',
      { accessibilityLabel, accessibilityRole: 'button', onPress },
      mockNativeElement('Text', {}, children),
    ),
}));
jest.mock('../../../shared/ui/components/StatusFeedback', () => ({
  StatusBanner: ({
    message,
    description,
    onRetry,
  }: {
    message: string;
    description?: string;
    onRetry?: () => void;
  }) =>
    mockNativeElement(
      'Pressable',
      { accessibilityRole: 'button', onPress: onRetry },
      [
        mockNativeElement('Text', { key: 'message' }, message),
        description
          ? mockNativeElement('Text', { key: 'description' }, description)
          : null,
      ],
    ),
}));
