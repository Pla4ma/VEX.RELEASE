/**
 * StreakNarrativeCard Component Tests
 * UI and integration tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StreakNarrativeCard } from '../StreakNarrativeCard';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('StreakNarrativeCard', () => {
  const mockOnStartSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
        isLoading={true}
      />
    );

    expect(getByText('Summoning your nemesis...')).toBeTruthy();
  });

  it('renders narrative content after loading', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      expect(getByText('CHAPTER 8')).toBeTruthy();
    });
  });

  it('displays correct boss information', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      expect(getByText('Distraction Kraken')).toBeTruthy();
      expect(getByText('The Attention Thief')).toBeTruthy();
    });
  });

  it('displays streak number', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      expect(getByText('7')).toBeTruthy();
    });
  });

  it('displays boss taunt in quotes', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={0}
        maxStreak={0}
        totalSessions={0}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      // Should find text with quotes
      const tauntElement = getByText(/".*"/);
      expect(tauntElement).toBeTruthy();
    });
  });

  it('calls onStartSession when battle button pressed', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      const button = getByText('⚔️ Battle Today');
      fireEvent.press(button);
    });

    expect(mockOnStartSession).toHaveBeenCalled();
  });

  it('triggers haptic feedback on button press', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      const button = getByText('⚔️ Battle Today');
      fireEvent.press(button);
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    );
  });

  it('renders error state when error prop provided', () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
        error={new Error('Failed to load')}
      />
    );

    expect(getByText('Story Unavailable')).toBeTruthy();
  });

  it('calls onRetry when retry button pressed', () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
        error={new Error('Failed to load')}
        onRetry={mockOnRetry}
      />
    );

    const retryButton = getByText('Try Again');
    fireEvent.press(retryButton);

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('does not show retry button if onRetry not provided', () => {
    const { queryByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
        error={new Error('Failed to load')}
      />
    );

    expect(queryByText('Try Again')).toBeNull();
  });

  it('renders empty state for null narrative', async () => {
    // This shouldn't normally happen, but test the fallback
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={-1}
        maxStreak={0}
        totalSessions={0}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      expect(getByText('Begin your journey today')).toBeTruthy();
    });
  });

  it('displays next milestone teaser', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      expect(getByText('NEXT MILESTONE')).toBeTruthy();
    });
  });

  it('displays personal story text', async () => {
    const { getByText } = render(
      <StreakNarrativeCard
        streakDays={7}
        maxStreak={7}
        totalSessions={15}
        onStartSession={mockOnStartSession}
      />
    );

    await waitFor(() => {
      // Personal story should contain text about their streak
      const story = getByText(/personal best|defeated|stronger/i);
      expect(story).toBeTruthy();
    });
  });
});
