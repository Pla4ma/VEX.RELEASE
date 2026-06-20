import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FocusScoreHomeWidget } from '../components/focus-score-home-widget';
import { ThemeProvider } from '../../../theme';
import {
  model,
  sampleFocusScore,
  sampleFocusHistory,
} from './focus-score-home-widget-test-fixtures';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider
      theme={{
        colors: {
          background: { primary: '#fff', secondary: '#f3f4f6' },
          border: { light: '#e5e7eb' },
          text: {
            primary: '#111827',
            secondary: '#6b7280',
            tertiary: '#9ca3af',
            disabled: '#9ca3af',
          },
          primary: { 500: '#3b82f6' },
          success: { DEFAULT: '#22c55e', dark: '#16a34a' },
          error: { DEFAULT: '#ef4444', dark: '#dc2626' },
          warning: { DEFAULT: '#f59e0b', dark: '#d97706' },
          info: { DEFAULT: '#3b82f6', dark: '#2563eb' },
        },
        spacing: { 2: 8, 3: 12, 4: 16 },
        borderRadius: { lg: 8 },
      }}
    >
      {component}
    </ThemeProvider>,
  );
};

describe('FocusScoreHomeWidget', () => {
  it('renders loading state', () => {
    const screen = renderWithTheme(
      <FocusScoreHomeWidget
        model={model({ isPending: true })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByTestId('focus-score-home-widget-skeleton')).toBeTruthy();
  });

  it('renders error state', () => {
    const screen = renderWithTheme(
      <FocusScoreHomeWidget
        model={model({ isError: true, error: new Error('err') })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByText('Focus Score is unavailable')).toBeTruthy();
  });

  it('renders honest empty copy for new users', () => {
    const screen = renderWithTheme(
      <FocusScoreHomeWidget
        model={model()}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('3 sessions needed')).toBeTruthy();
    expect(
      screen.getByText(
        'Finish three sessions and VEX will start reading your focus rhythm.',
      ),
    ).toBeTruthy();
  });

  it('renders success and supports tap navigation', () => {
    const onPress = jest.fn();
    const screen = renderWithTheme(
      <FocusScoreHomeWidget
        model={model({
          current: sampleFocusScore,
          history: sampleFocusHistory,
        })}
        onPress={onPress}
        onRetry={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByLabelText('Open focus score dashboard'));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText('720 · Building')).toBeTruthy();
  });

  it('keeps the dashboard tap target at least 44 points tall', () => {
    const screen = renderWithTheme(
      <FocusScoreHomeWidget
        model={model({
          current: sampleFocusScore,
        })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText('Open focus score dashboard').props.style,
    ).toEqual(expect.objectContaining({ minHeight: 44, minWidth: 44 }));
  });

  it('renders offline state', () => {
    const screen = renderWithTheme(
      <FocusScoreHomeWidget
        model={model({
          isOffline: true,
          current: sampleFocusScore,
        })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByText('Offline focus mode')).toBeTruthy();
    expect(
      screen.getByText('Cached score shown while VEX waits to sync.'),
    ).toBeTruthy();
  });
});
