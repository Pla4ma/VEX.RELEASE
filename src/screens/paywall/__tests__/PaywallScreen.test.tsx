import React, { type ReactNode } from 'react';
import TestRenderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { PaywallScreen } from '../PaywallScreen';
import { capture } from '../../../shared/analytics';
import { usePaywall, usePremiumStatus } from '../../../shared/monetization';
import type {
  PurchaseResult,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
} from '../../../shared/monetization';

const mockGoBack = jest.fn();
const mockRetry = jest.fn<Promise<void>, []>();
const mockPurchase = jest.fn<Promise<PurchaseResult>, [PurchasesPackageDisplayInfo]>();
const mockRestore = jest.fn<Promise<PurchaseResult>, []>();
const mockRefresh = jest.fn<Promise<void>, []>();
function mockNativeElement(name: string, props: Record<string, unknown>, children?: unknown) {
  return require('react').createElement(name, props, children);
}
jest.mock('react-native', () => {
  const makeComponent = (name: string) => ({ children, ...props }: { children?: unknown }) =>
    mockNativeElement(name, props, children);
  return {
    Pressable: makeComponent('Pressable'),
    ScrollView: makeComponent('ScrollView'),
    Text: makeComponent('Text'),
    View: makeComponent('View'),
  };
});
jest.mock('react-native-reanimated', () => {
  const View = ({ children, ...props }: { children?: unknown }) =>
    mockNativeElement('AnimatedView', props, children);
  const animation = { duration: () => animation, delay: () => animation };
  return { __esModule: true, default: { View }, FadeInDown: animation };
});
jest.mock('../../../shared/monetization', () => ({ usePaywall: jest.fn(), usePremiumStatus: jest.fn() }));
jest.mock('../../../shared/analytics', () => ({ capture: jest.fn() }));
jest.mock('expo-linear-gradient', () => {
  return { LinearGradient: ({ children }: { children: ReactNode }) => mockNativeElement('View', {}, children) };
});
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({ params: { source: 'home_analytics_cta', gatedFeature: 'advanced_analytics' } }),
}));
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: '#ffffff', secondary: '#f5f5f5', tertiary: '#eeeeee' },
        primary: { 500: '#2563eb' },
        success: { 500: '#16a34a', DEFAULT: '#16a34a' },
        warning: { DEFAULT: '#f59e0b' },
        error: { DEFAULT: '#dc2626' },
        text: { primary: '#111111', secondary: '#666666', tertiary: '#999999', inverse: '#ffffff' },
        border: { DEFAULT: '#d4d4d4' },
      },
    },
  }),
}));
jest.mock('../../../shared/ui/components/EnterAnimation', () => ({
  CardEnterAnimation: ({ children }: { children: ReactNode }) => mockNativeElement('View', {}, children),
  StaggeredEnter: ({ children }: { children: ReactNode }) => mockNativeElement('View', {}, children),
}));
jest.mock('../../../icons/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => mockNativeElement('Text', {}, name),
}));
jest.mock('../../../components/primitives/Text', () => ({
  Text: ({ children }: { children: ReactNode }) => mockNativeElement('Text', {}, children),
}));
jest.mock('../../../components/ui/Skeleton', () => ({
  Skeleton: () => mockNativeElement('View', {}),
  SkeletonCard: () => mockNativeElement('View', {}),
}));
jest.mock('../../../components/primitives/Button', () => ({
  Button: ({ children, onPress, accessibilityLabel }: { children: ReactNode; onPress?: () => void; accessibilityLabel?: string }) => (
    mockNativeElement('Pressable', { accessibilityLabel, accessibilityRole: 'button', onPress }, mockNativeElement('Text', {}, children))
  ),
}));
jest.mock('../../../shared/ui/components/StatusFeedback', () => ({
  StatusBanner: ({ message, description, onRetry }: { message: string; description?: string; onRetry?: () => void }) => (
    mockNativeElement('Pressable', { accessibilityRole: 'button', onPress: onRetry }, [
      mockNativeElement('Text', { key: 'message' }, message),
      description ? mockNativeElement('Text', { key: 'description' }, description) : null,
    ])
  ),
}));
const mockedUsePaywall = jest.mocked(usePaywall);
const mockedUsePremiumStatus = jest.mocked(usePremiumStatus);
const mockedCapture = jest.mocked(capture);

function revenueCatError(code: RevenueCatError['code'], message: string): RevenueCatError {
  const error = new Error(message);
  error.name = 'RevenueCatError';
  return Object.assign(error, { code });
}
function packageInfo(identifier: string, packageType: string, priceString: string): PurchasesPackageDisplayInfo {
  return {
    identifier,
    packageType,
    product: {
      identifier: `product.${identifier}`,
      description: `${packageType} plan`,
      title: packageType,
      price: 1,
      priceString,
      currencyCode: 'USD',
      introPrice: null,
      discounts: [],
    },
  };
}

function mockPaywallState(overrides: Partial<ReturnType<typeof usePaywall>> = {}): void {
  const packages = [
    packageInfo('$rc_annual', 'ANNUAL', '$49.99 / year'),
    packageInfo('$rc_monthly', 'MONTHLY', '$6.99 / month'),
  ];
  mockedUsePaywall.mockReturnValue({
    offerings: { identifier: 'default-offering', serverDescription: 'Default', metadata: {}, packages } satisfies PurchasesOfferingDisplayInfo,
    packages,
    isLoading: false,
    error: null,
    purchase: mockPurchase,
    restore: mockRestore,
    retry: mockRetry,
    ...overrides,
  });
}

describe('PaywallScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPurchase.mockResolvedValue({ success: true });
    mockRestore.mockResolvedValue({ success: true });
    mockRefresh.mockResolvedValue();
    mockRetry.mockResolvedValue();
    mockPaywallState();
    mockedUsePremiumStatus.mockReturnValue({ isPremium: false, isLoading: false, entitlements: [], refresh: mockRefresh });
  });

  function renderPaywall(): ReactTestRenderer {
    let output: ReactTestRenderer | null = null;
    act(() => {
      output = TestRenderer.create(<PaywallScreen />);
    });
    if (!output) {
      throw new Error('Paywall did not render');
    }
    return output;
  }

  function containsText(output: ReactTestRenderer, text: string): boolean {
    return JSON.stringify(output.toJSON()).includes(text);
  }

  it('shows free boundaries and live plans to free users', () => {
    const output = renderPaywall();

    expect(containsText(output, 'Core sessions, basic progress, streak building, and earned rewards stay free.')).toBe(true);
    expect(containsText(output, 'Best Insight')).toBe(true);
    expect(containsText(output, 'Annual')).toBe(true);
    expect(mockedCapture).toHaveBeenCalled();
  });

  it('shows active premium state for premium users', () => {
    mockedUsePremiumStatus.mockReturnValue({ isPremium: true, isLoading: false, entitlements: [], refresh: mockRefresh });
    const output = renderPaywall();

    expect(containsText(output, 'Premium is active')).toBe(true);
    expect(containsText(output, 'Already Premium')).toBe(true);
  });

  it('does not show fake fallback pricing when offerings are missing', () => {
    mockPaywallState({ offerings: null, packages: [], error: null });
    const output = renderPaywall();

    expect(containsText(output, 'Live plans are not available yet')).toBe(true);
    expect(containsText(output, 'Live pricing unavailable')).toBe(false);
  });

  it('handles offering load failures with retry', () => {
    const error = revenueCatError('NETWORK_ERROR', 'Network down');
    mockPaywallState({ offerings: null, packages: [], error });

    const output = renderPaywall();
    const retryButton = output.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find((node) => node.props.onPress === mockRetry);
    if (!retryButton) {
      throw new Error('Retry button missing');
    }
    retryButton.props.onPress();

    expect(containsText(output, 'Pricing is temporarily unavailable. Your progress is safe.')).toBe(true);
    expect(mockRetry).toHaveBeenCalled();
  });
});
