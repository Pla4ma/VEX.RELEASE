import React from "react";
import { View, Text } from "react-native";
import { render } from "@testing-library/react-native";

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    getCustomerInfo: jest.fn(() =>
      Promise.resolve({ entitlements: { all: {}, active: {} } }),
    ),
    getOfferings: jest.fn(() => Promise.resolve({ current: null, all: {} })),
    purchasePackage: jest.fn(() =>
      Promise.resolve({
        customerInfo: { entitlements: { all: {}, active: {} } },
      }),
    ),
    restorePurchases: jest.fn(() =>
      Promise.resolve({
        customerInfo: { entitlements: { all: {}, active: {} } },
      }),
    ),
    logIn: jest.fn(() =>
      Promise.resolve({
        customerInfo: { entitlements: { all: {}, active: {} } },
      }),
    ),
    logOut: jest.fn(() =>
      Promise.resolve({
        customerInfo: { entitlements: { all: {}, active: {} } },
      }),
    ),
    syncPurchases: jest.fn(() => Promise.resolve()),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
  },
  LOG_LEVEL: { DEBUG: 0, ERROR: 4 },
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 2 },
}));

describe("Test environment smoke", () => {
  it("renders View with Text", () => {
    const { getByText } = render(
      <View testID="smoke-view">
        <Text>Smoke Test</Text>
      </View>,
    );
    expect(getByText("Smoke Test")).toBeTruthy();
  });

  it("renders VEX primitive component (Badge)", () => {
    const { Badge } = require("@/components/Badge");
    const { getByText } = render(<Badge variant="primary">VEX Smoke</Badge>);
    expect(getByText("VEX Smoke")).toBeTruthy();
  });

  it("renders NavigationContainer with one screen", () => {
    const { NavigationContainer } = require("@react-navigation/native");
    const {
      createNativeStackNavigator,
    } = require("@react-navigation/native-stack");
    const Stack = createNativeStackNavigator();
    const TestScreen = () => (
      <View testID="test-screen">
        <Text>Navigation works</Text>
      </View>
    );
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
    expect(getByText("Navigation works")).toBeTruthy();
  });

  it("imports Reanimated mock safely", () => {
    const reanimated = require("react-native-reanimated");
    expect(reanimated.useSharedValue).toBeDefined();
    expect(reanimated.withTiming).toBeDefined();
  });

  it("imports Gesture Handler mock safely", () => {
    const gh = require("react-native-gesture-handler");
    expect(gh.Gesture).toBeDefined();
  });

  it("imports Sentry mock safely", () => {
    const Sentry = require("@sentry/react-native");
    expect(Sentry.captureException).toBeDefined();
    expect(Sentry.addBreadcrumb).toBeDefined();
    expect(Sentry.init).toBeDefined();
  });

  it("imports RevenueCat / react-native-purchases mock safely", () => {
    const Purchases = require("react-native-purchases");
    expect(Purchases.default.configure).toBeDefined();
    expect(Purchases.default.getCustomerInfo).toBeDefined();
  });

  it("has ImageLoader turbo module mock", () => {
    expect(global.__turboModuleProxy).toBeDefined();
    const loader = (global as any).__turboModuleProxy("ImageLoader");
    expect(loader).toBeDefined();
    expect(loader.getConstants).toBeDefined();
  });

  it("has NativeAnimatedHelper mock", () => {
    expect(() =>
      require("react-native/Libraries/Animated/NativeAnimatedHelper"),
    ).not.toThrow();
  });

  it("has Safe Area Context mock", () => {
    const sac = require("react-native-safe-area-context");
    expect(sac.SafeAreaProvider).toBeDefined();
  });
});
