/**
 * Screen Error Boundary Tests
 *
 * Tests for screen-level error handling with retry and fallback UI
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ScreenErrorBoundary, withScreenErrorBoundary } from '../ScreenErrorBoundary';
import { Text } from '../../../../components/primitives';

// Test component that throws errors
const ThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Normal content</Text>;
};

describe('ScreenErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error', () => {
    render(
      <ScreenErrorBoundary screenName="TestScreen">
        <Text>Normal content</Text>
      </ScreenErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeTruthy();
  });

  it('should show error fallback when error occurs', () => {
    render(
      <ScreenErrorBoundary screenName="TestScreen">
        <ThrowingComponent shouldThrow={true} />
      </ScreenErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/couldn't load TestScreen/)).toBeTruthy();
  });

  it('should show retry button', () => {
    render(
      <ScreenErrorBoundary screenName="TestScreen">
        <ThrowingComponent shouldThrow={true} />
      </ScreenErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('should call onError when error occurs', () => {
    const onError = jest.fn();

    render(
      <ScreenErrorBoundary screenName="TestScreen" onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ScreenErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should show offline state for network errors', () => {
    const NetworkErrorComponent: React.FC = () => {
      throw new Error('Network request failed - offline');
    };

    render(
      <ScreenErrorBoundary screenName="TestScreen" allowOffline={true}>
        <NetworkErrorComponent />
      </ScreenErrorBoundary>
    );

    expect(screen.getByText(/offline/i)).toBeTruthy();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = <Text>Custom error message</Text>;

    render(
      <ScreenErrorBoundary screenName="TestScreen" fallback={CustomFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ScreenErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeTruthy();
  });

  describe('withScreenErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const WrappedComponent = withScreenErrorBoundary(ThrowingComponent, 'WrappedScreen');

      render(<WrappedComponent shouldThrow={true} />);

      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText(/couldn't load WrappedScreen/)).toBeTruthy();
    });

    it('should render normally when no error', () => {
      const WrappedComponent = withScreenErrorBoundary(ThrowingComponent, 'WrappedScreen');

      render(<WrappedComponent shouldThrow={false} />);

      expect(screen.getByText('Normal content')).toBeTruthy();
    });
  });

  describe('Retry functionality', () => {
    it('should reset error state on retry', () => {
      const { rerender } = render(
        <ScreenErrorBoundary screenName="TestScreen">
          <ThrowingComponent shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      // Should show error
      expect(screen.getByText('Something went wrong')).toBeTruthy();

      // Click retry
      fireEvent.press(screen.getByText('Try Again'));

      // Re-render with no error
      rerender(
        <ScreenErrorBoundary screenName="TestScreen">
          <ThrowingComponent shouldThrow={false} />
        </ScreenErrorBoundary>
      );

      // Should show normal content
      expect(screen.getByText('Normal content')).toBeTruthy();
    });
  });

  describe('Error message detection', () => {
    it('should show network error message for network errors', () => {
      const NetworkError: React.FC = () => {
        throw new Error('Network connection lost');
      };

      render(
        <ScreenErrorBoundary screenName="TestScreen">
          <NetworkError />
        </ScreenErrorBoundary>
      );

      expect(screen.getByText(/Connection lost/)).toBeTruthy();
    });

    it('should show auth error message for auth errors', () => {
      const AuthError: React.FC = () => {
        throw new Error('Unauthorized - auth token expired');
      };

      render(
        <ScreenErrorBoundary screenName="TestScreen">
          <AuthError />
        </ScreenErrorBoundary>
      );

      expect(screen.getByText(/session expired/i)).toBeTruthy();
    });
  });
});
