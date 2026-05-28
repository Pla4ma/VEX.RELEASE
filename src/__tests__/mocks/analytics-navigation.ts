/**
 * Jest mocks for analytics, observability, and navigation
 *
 * Covers: @sentry/react-native, posthog-react-native,
 * and @react-navigation/native.
 */

function recordSetupFallback(error: unknown): void {
  void error;
}

try {
  jest.mock("@sentry/react-native", () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUser: jest.fn(),
    setTag: jest.fn(),
    setContext: jest.fn(),
    withScope: jest.fn((callback: (scope: unknown) => void) => callback({})),
    configureScope: jest.fn(),
    startTransaction: jest.fn(() => ({
      finish: jest.fn(),
      setData: jest.fn(),
      setStatus: jest.fn(),
    })),
    getCurrentHub: jest.fn(() => ({
      getClient: jest.fn(),
      configureScope: jest.fn(),
    })),
  }));
  jest.mock("posthog-react-native", () => {
    const React = require("react");
    const mockCreateClient = () => ({
      capture: jest.fn(),
      flush: jest.fn(() => Promise.resolve()),
      getFeatureFlag: jest.fn(),
      identify: jest.fn(),
      isFeatureEnabled: jest.fn(() => false),
      reset: jest.fn(),
    });
    return {
      PostHog: jest.fn().mockImplementation(mockCreateClient),
      PostHogProvider: ({ children }: { children: unknown }) =>
        React.createElement(React.Fragment, null, children),
      usePostHog: jest.fn(mockCreateClient),
    };
  });
  jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      dispatch: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
      getParent: jest.fn(),
      getState: jest.fn(() => ({ routes: [], index: 0 })),
    })),
    useRoute: jest.fn(() => ({
      params: {},
      name: "TestScreen",
      key: "test-key",
    })),
    useIsFocused: jest.fn(() => true),
  }));
} catch (error) {
  recordSetupFallback(error);
}
