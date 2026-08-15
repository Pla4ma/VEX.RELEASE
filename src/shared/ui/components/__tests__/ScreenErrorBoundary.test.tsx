import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { captureException } from '../../../../config/sentry';
import { Text } from '../../../../components/primitives';
import {
  ScreenErrorBoundary,
  withScreenErrorBoundary,
} from '../ScreenErrorBoundary';

jest.mock('../../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: { background: { primary: 'white' } },
      spacing: [0, 4, 8, 12, 16, 20, 24],
    },
  }),
}));

jest.mock('../../../../components/primitives', () => ({
  Text: ({ children }: { children: React.ReactNode }) => {
    const ReactRuntime = require('react');
    const { Text: NativeText } = require('react-native');
    return ReactRuntime.createElement(NativeText, null, children);
  },
}));

jest.mock('../../../../components', () => ({
  Button: (props: {
    children: React.ReactNode;
    onPress: () => void;
    accessibilityLabel: string;
    accessibilityRole: string;
    accessibilityHint: string;
  }) => {
    const ReactRuntime = require('react');
    const { Pressable, Text: NativeText } = require('react-native');
    return ReactRuntime.createElement(
      Pressable,
      {
        onPress: props.onPress,
        accessibilityLabel: props.accessibilityLabel,
        accessibilityRole: props.accessibilityRole,
        accessibilityHint: props.accessibilityHint,
      },
      ReactRuntime.createElement(NativeText, null, props.children),
    );
  },
}));

jest.mock('../../../../network', () => ({
  useNetInfo: () => ({ isOffline: false }),
}));

jest.mock('../../../../config/sentry', () => ({
  captureException: jest.fn(),
}));

const ThrowingComponent: React.ComponentType<{
  shouldThrow?: boolean;
  message?: string;
}> = ({ shouldThrow, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <Text>Normal content</Text>;
};

describe('ScreenErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error occurs', async () => {
    await render(
      <ScreenErrorBoundary screenName="TestScreen">
        <Text>Normal content</Text>
      </ScreenErrorBoundary>,
    );

    expect(screen.getByText('Normal content')).toBeTruthy();
  });

  it('shows fallback UI instead of crashing on render errors', async () => {
    await render(
      <ScreenErrorBoundary screenName="TestScreen">
        <ThrowingComponent shouldThrow />
      </ScreenErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/couldn't load TestScreen/)).toBeTruthy();
  });

  it('captures the configured feature tag in Sentry', async () => {
    await render(
      <ScreenErrorBoundary screenName="TestScreen" featureTag="phase-16-test">
        <ThrowingComponent shouldThrow />
      </ScreenErrorBoundary>,
    );

    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: { feature: 'phase-16-test' } }),
    );
  });

  it('calls onError when an error occurs', async () => {
    const onError = jest.fn();
    await render(
      <ScreenErrorBoundary screenName="TestScreen" onError={onError}>
        <ThrowingComponent shouldThrow />
      </ScreenErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('resets and remounts children when retry is pressed', async () => {
    let shouldThrow = true;
    const RetryComponent = (): React.ReactNode => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <Text>Normal content</Text>;
    };
    const { rerender } = await render(
      <ScreenErrorBoundary screenName="TestScreen">
        <RetryComponent />
      </ScreenErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    shouldThrow = false;
    await fireEvent.press(screen.getByText('Try Again'));
    await rerender(
      <ScreenErrorBoundary screenName="TestScreen">
        <RetryComponent />
      </ScreenErrorBoundary>,
    );

    expect(screen.getByText('Normal content')).toBeTruthy();
  });

  it('uses network and auth-specific messages', async () => {
    await render(
      <ScreenErrorBoundary screenName="TestScreen">
        <ThrowingComponent shouldThrow message="Network connection lost" />
      </ScreenErrorBoundary>,
    );
    expect(screen.getByText(/Connection lost/)).toBeTruthy();
  });

  it('supports the HOC wrapper', async () => {
    const WrappedComponent = withScreenErrorBoundary(
      ThrowingComponent,
      'WrappedScreen',
    );
    await render(<WrappedComponent shouldThrow />);

    expect(screen.getByText(/couldn't load WrappedScreen/)).toBeTruthy();
  });
});
