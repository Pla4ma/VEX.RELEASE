/**
 * Wager Won Ceremony Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { WagerWonCeremony } from '../components/WagerWonCeremony';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

// Mock hooks
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => ({ isReducedMotion: false })),
}));

describe('WagerWonCeremony', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders wager won with correct amount', () => {
    render(
      <WagerWonCeremony
        amount={500}
        onComplete={mockOnComplete}
        autoDismiss={false}
      />
    );

    expect(screen.getByText('WAGER WON!')).toBeTruthy();
    expect(screen.getByText('+500 COINS')).toBeTruthy();
    expect(screen.getByText('Your focus paid off!')).toBeTruthy();
  });

  it('renders large amounts with comma formatting', () => {
    render(
      <WagerWonCeremony
        amount={10000}
        onComplete={mockOnComplete}
        autoDismiss={false}
      />
    );

    expect(screen.getByText('+10,000 COINS')).toBeTruthy();
  });

  it('auto-dismisses after delay', async () => {
    render(
      <WagerWonCeremony
        amount={500}
        onComplete={mockOnComplete}
        autoDismiss={true}
        dismissDelay={4000}
      />
    );

    // Should not call onComplete immediately
    expect(mockOnComplete).not.toHaveBeenCalled();

    // Fast-forward past dismiss delay
    jest.advanceTimersByTime(4100);

    // Wait for animation callbacks
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('does not auto-dismiss when autoDismiss is false', () => {
    render(
      <WagerWonCeremony
        amount={500}
        onComplete={mockOnComplete}
        autoDismiss={false}
      />
    );

    // Fast-forward a long time
    jest.advanceTimersByTime(10000);

    // Should not have called onComplete
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('renders with reduced motion preference', () => {
    (useReducedMotion as jest.Mock).mockReturnValue({ isReducedMotion: true });

    render(
      <WagerWonCeremony
        amount={500}
        onComplete={mockOnComplete}
        autoDismiss={false}
      />
    );

    // Should still render content
    expect(screen.getByText('WAGER WON!')).toBeTruthy();
  });
});
