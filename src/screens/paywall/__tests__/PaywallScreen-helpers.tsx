import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { PaywallScreen } from "../PaywallScreen";
import { capture } from "../../../shared/analytics";
import { usePaywall, usePremiumStatus } from "../../../shared/monetization";
import type {
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
} from "../../../shared/monetization";
import {
  mockGoBack,
  mockRetry,
  mockPurchase,
  mockRestore,
  mockRefresh,
} from "./PaywallScreen-mocks";

export { mockGoBack, mockRetry, mockPurchase, mockRestore, mockRefresh };

export const mockedUsePaywall = jest.mocked(usePaywall);
export const mockedUsePremiumStatus = jest.mocked(usePremiumStatus);
export const mockedCapture = jest.mocked(capture);

export function revenueCatError(
  code: RevenueCatError["code"],
  message: string,
): RevenueCatError {
  const error = new Error(message) as RevenueCatError;
  error.name = "RevenueCatError";
  error.code = code;
  return error;
}

export function packageInfo(
  identifier: string,
  packageType: string,
  priceString: string,
): PurchasesPackageDisplayInfo {
  return {
    identifier,
    packageType,
    product: {
      identifier: `product.${identifier}`,
      description: `${packageType} plan`,
      title: packageType,
      price: 1,
      priceString,
      currencyCode: "USD",
      introPrice: null,
      discounts: [],
    },
  };
}

export function mockPaywallState(
  overrides: Partial<ReturnType<typeof usePaywall>> = {},
): void {
  const packages = [
    packageInfo("$rc_annual", "ANNUAL", "$49.99 / year"),
    packageInfo("$rc_monthly", "MONTHLY", "$6.99 / month"),
  ];
  mockedUsePaywall.mockReturnValue({
    offerings: {
      identifier: "default-offering",
      serverDescription: "Default",
      metadata: {},
      packages,
    } satisfies PurchasesOfferingDisplayInfo,
    packages,
    isLoading: false,
    error: null,
    purchase: mockPurchase,
    restore: mockRestore,
    retry: mockRetry,
    ...overrides,
  });
}

export function renderPaywall(): ReactTestRenderer {
  let output: ReactTestRenderer | null = null;
  act(() => {
    output = TestRenderer.create(<PaywallScreen />);
  });
  if (!output) {
    throw new Error("Paywall did not render");
  }
  return output;
}

export function containsText(output: ReactTestRenderer, text: string): boolean {
  return JSON.stringify(output.toJSON()).includes(text);
}

export async function pressByLabel(
  output: ReactTestRenderer,
  label: string,
): Promise<void> {
  const button = output.root.findAllByProps({ accessibilityLabel: label })[0];
  if (!button) {
    throw new Error(`${label} missing`);
  }
  await act(async () => {
    await button.props.onPress();
  });
}
