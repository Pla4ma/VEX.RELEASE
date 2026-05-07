/**
 * Screen Error Boundary Tests
 * 
 * Tests for screen-specific error boundary with recovery options
 * and screen error wrapper utilities.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  ScreenErrorBoundary,
  type ScreenErrorConfig,
} from '../ScreenErrorBoundary';
import {
  ScreenErrorWrapper,
  withScreenErrorBoundary,
  useScreenError,
  screenErrorRecovery,
  type ScreenType,
} from '../ScreenErrorWrapper';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: () => true,
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../components/primitives', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

jest.mock('../components', () => ({
  Button: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>{children}</button>
  ),
}));

jest.mock('react-native', () => ({
  ActivityIndicator: () => <div>Loading...</div>,
}));

describe('ScreenErrorBoundary', () => {
  let mockConfig: ScreenErrorConfig;
  let ErrorThrowingComponent: React.ComponentType;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      screenName: 'Test Screen',
      isCritical: true,
      recoveryTarget: 'Home',
      preserveState: true,
    };

    ErrorThrowingComponent = () => {
      throw new Error('Test error');
    };
  });

  it('should render children when no error', () => {
    const TestComponent = () => React.createElement('div', null, 'Test Content');

    render(
      React.createElement(ScreenErrorBoundary, { config: mockConfig },
        React.createElement(TestComponent)
      )
    );

    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('should catch and display screen error', () => {
    render(
      React.createElement(ScreenErrorBoundary, { config: mockConfig },
        React.createElement(ErrorThrowingComponent)
      )
    );

    expect(screen.getByText('Critical Error')).toBeTruthy();
    expect(screen.getByText('Test Screen')).toBeTruthy();
    expect(screen.getByText('Something went wrong with Test Screen.')).toBeTruthy();
  });

  it('should use custom error messages', () => {
    const configWithMessages = {
      ...mockConfig,
      errorMessages: {
        network: 'Custom network error message',
      },
    };

    const NetworkErrorComponent = () => {
      throw new Error('Network connection failed');
    };

    render(
      <ScreenErrorBoundary config={configWithMessages}>
        <NetworkErrorComponent />
      </ScreenErrorBoundary>
    );

    expect(screen.getByText('Custom network error message')).toBeTruthy();
  });

  it('should handle retry functionality', async () => {
    let renderCount = 0;
    const RetryComponent = () => {
      renderCount++;
      if (renderCount === 1) {
        throw new Error('Retry test error');
      }
      return <div>Success after retry</div>;
    };

    render(
      <ScreenErrorBoundary config={mockConfig}>
        <RetryComponent />
      </ScreenErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByText('Critical Error')).toBeTruthy();

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.press(retryButton);

    // Should show success after retry
    expect(screen.getByText('Success after retry')).toBeTruthy();
  });

  it('should show degraded mode option', () => {
    const configWithDegraded = {
      ...mockConfig,
      preserveState: true,
    };

    render(
      <ScreenErrorBoundary config={configWithDegraded}>
        <ErrorThrowingComponent />
      </ScreenErrorBoundary>
    );

    expect(screen.getByText('Continue Anyway')).toBeTruthy();
  });

  it('should call error handler', () => {
    const onError = jest.fn();

    render(
      <ScreenErrorBoundary config={mockConfig} onError={onError}>
        <ErrorThrowingComponent />
      </ScreenErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    const [error, errorInfo, category] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(errorInfo).toBeDefined();
    expect(category).toBeDefined();
  });
});

describe('ScreenErrorWrapper', () => {
  it('should wrap children with appropriate error boundary', () => {
    const TestComponent = () => <div>Test Content</div>;

    render(
      <ScreenErrorWrapper screenType="session">
        <TestComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('should use screen-specific configuration', () => {
    const ErrorComponent = () => {
      throw new Error('Session error');
    };

    render(
      <ScreenErrorWrapper screenType="session">
        <ErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Focus Session')).toBeTruthy();
    expect(screen.getByText('Something went wrong with Focus Session.')).toBeTruthy();
  });

  it('should merge custom configuration', () => {
    const ErrorComponent = () => {
      throw new Error('Custom error');
    };

    const customConfig = {
      errorMessages: {
        network: 'Custom network message',
      },
    };

    render(
      <ScreenErrorWrapper screenType="session" customConfig={customConfig}>
        <ErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Custom network message')).toBeTruthy();
  });

  it('should handle different screen types', () => {
    const testCases: Array<{ type: ScreenType; expectedName: string }> = [
      { type: 'session', expectedName: 'Focus Session' },
      { type: 'session-complete', expectedName: 'Session Complete' },
      { type: 'home', expectedName: 'Home' },
      { type: 'rewards', expectedName: 'Rewards' },
      { type: 'streaks', expectedName: 'Streaks' },
      { type: 'progression', expectedName: 'Progression' },
      { type: 'profile', expectedName: 'Profile' },
      { type: 'settings', expectedName: 'Settings' },
      { type: 'boss', expectedName: 'Boss Battles' },
      { type: 'challenges', expectedName: 'Challenges' },
      { type: 'squads', expectedName: 'Squads' },
    ];

    testCases.forEach(({ type, expectedName }) => {
      const ErrorComponent = () => {
        throw new Error(`${type} error`);
      };

      const { unmount } = render(
        <ScreenErrorWrapper screenType={type}>
          <ErrorComponent />
        </ScreenErrorWrapper>
      );

      expect(screen.getByText(expectedName)).toBeTruthy();
      unmount();
    });
  });
});

describe('useScreenError', () => {
  it('should return screen configuration', () => {
    const TestComponent = () => {
      const screenConfig = useScreenError('session');
      return <div>{screenConfig.screenName}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText('Focus Session')).toBeTruthy();
  });

  it('should return criticality status', () => {
    const TestComponent = () => {
      const { isCritical } = useScreenError('session');
      return <div>{isCritical ? 'Critical' : 'Non-critical'}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText('Critical')).toBeTruthy();
  });
});

describe('withScreenErrorBoundary', () => {
  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test Content</div>;
    const WrappedComponent = withScreenErrorBoundary(TestComponent, 'session');

    render(<WrappedComponent />);

    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('should pass props through correctly', () => {
    interface TestProps {
      message: string;
    }

    const TestComponent = ({ message }: TestProps) => <div>{message}</div>;
    const WrappedComponent = withScreenErrorBoundary(TestComponent, 'session');

    render(<WrappedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('should handle errors in wrapped component', () => {
    interface TestProps {
      shouldError: boolean;
    }

    const TestComponent = ({ shouldError }: TestProps) => {
      if (shouldError) {
        throw new Error('Wrapped component error');
      }
      return <div>Success</div>;
    };

    const WrappedComponent = withScreenErrorBoundary(TestComponent, 'session');

    render(<WrappedComponent shouldError={true} />);

    expect(screen.getByText('Focus Session')).toBeTruthy();
    expect(screen.getByText('Something went wrong with Focus Session.')).toBeTruthy();
  });
});

describe('screenErrorRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    screenErrorRecovery.clearAllRecoveryAttempts();
  });

  it('should attempt recovery for retryable errors', async () => {
    const error = new Error('Network error');
    const result = await screenErrorRecovery.attemptRecovery('session', error);

    expect(result).toBe(true);
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(1);
  });

  it('should not attempt recovery for client errors', async () => {
    const error = new Error('Reference error');
    const result = await screenErrorRecovery.attemptRecovery('session', error);

    expect(result).toBe(false);
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(0);
  });

  it('should limit recovery attempts', async () => {
    const error = new Error('Network error');

    // Attempt recovery 3 times
    for (let i = 0; i < 3; i++) {
      await screenErrorRecovery.attemptRecovery('session', error);
    }

    // 4th attempt should fail
    const result = await screenErrorRecovery.attemptRecovery('session', error);
    expect(result).toBe(false);
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(3);
  });

  it('should call custom recovery handler', async () => {
    const error = new Error('Network error');
    const onRecovery = jest.fn();

    await screenErrorRecovery.attemptRecovery('session', error, {
      onRecovery,
    });

    expect(onRecovery).toHaveBeenCalledWith('session', error);
  });

  it('should reset recovery attempts', () => {
    screenErrorRecovery.attemptRecovery('session', new Error('Test error'));
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(1);

    screenErrorRecovery.resetRecoveryAttempts('session');
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(0);
  });

  it('should clear all recovery attempts', () => {
    screenErrorRecovery.attemptRecovery('session', new Error('Test error'));
    screenErrorRecovery.attemptRecovery('home', new Error('Test error'));
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(1);
    expect(screenErrorRecovery.getRecoveryAttempts('home')).toBe(1);

    screenErrorRecovery.clearAllRecoveryAttempts();
    expect(screenErrorRecovery.getRecoveryAttempts('session')).toBe(0);
    expect(screenErrorRecovery.getRecoveryAttempts('home')).toBe(0);
  });
});

describe('Screen Error Integration', () => {
  it('should handle network errors with appropriate messages', () => {
    const NetworkErrorComponent = () => {
      throw new Error('Network connection failed');
    };

    render(
      <ScreenErrorWrapper screenType="session">
        <NetworkErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Can\'t start session without internet. Please check your connection.')).toBeTruthy();
  });

  it('should handle auth errors with appropriate messages', () => {
    const AuthErrorComponent = () => {
      throw new Error('Authentication failed');
    };

    render(
      <ScreenErrorWrapper screenType="profile">
        <AuthErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Profile requires authentication. Please sign in again.')).toBeTruthy();
  });

  it('should handle server errors with appropriate messages', () => {
    const ServerErrorComponent = () => {
      throw new Error('Server error 500');
    };

    render(
      <ScreenErrorWrapper screenType="rewards">
        <ServerErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Rewards service is temporarily unavailable. Please try again later.')).toBeTruthy();
  });

  it('should handle validation errors with appropriate messages', () => {
    const ValidationErrorComponent = () => {
      throw new Error('Invalid input data');
    };

    render(
      <ScreenErrorWrapper screenType="settings">
        <ValidationErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.getByText('Invalid settings configuration.')).toBeTruthy();
  });

  it('should provide recovery options for non-critical screens', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <ScreenErrorWrapper screenType="rewards">
        <ErrorComponent />
      </ScreenErrorWrapper>
    );

    expect(screen.queryByText('Critical Error')).toBeFalsy();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Go Back')).toBeTruthy();
  });
});