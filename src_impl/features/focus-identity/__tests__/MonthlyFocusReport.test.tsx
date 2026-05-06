/**
 * Monthly Focus Report Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { MonthlyFocusReport } from '../components/MonthlyFocusReport';
import * as hooks from '../hooks';
import * as events from '../events';

// Mock hooks and events
jest.mock('../hooks');
jest.mock('../events', () => ({
  publishMonthlyReportViewed: jest.fn(),
  publishMonthlyReportShared: jest.fn(),
  publishMonthlyReportDismissed: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'shared' })),
}));

const mockReport = {
  month: '2025-01',
  startingScore: 650,
  endingScore: 720,
  change: 70,
  sessionsCompleted: 24,
  grade: 'A',
  highlight: 'Outstanding consistency this month!',
};

describe('MonthlyFocusReport', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when loading', () => {
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: null,
      loadingState: 'loading',
      error: null,
      refresh: jest.fn(),
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    // Skeleton should be visible (loading state)
    expect(screen.getByText('Monthly Focus Report')).toBeTruthy();
  });

  it('renders error state with retry button', () => {
    const mockRefresh = jest.fn();
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: null,
      loadingState: 'error',
      error: new Error('Network error'),
      refresh: mockRefresh,
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    expect(screen.getByText('⚠️ Report Unavailable')).toBeTruthy();
    expect(screen.getByText('Network error')).toBeTruthy();

    const retryButton = screen.getByText('Try Again');
    fireEvent.press(retryButton);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders empty state when no report available', () => {
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: null,
      loadingState: 'success',
      error: null,
      refresh: jest.fn(),
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    expect(screen.getByText('No Report Available')).toBeTruthy();
    expect(screen.getByText('Complete sessions this month to generate your first focus report.')).toBeTruthy();
  });

  it('renders report with correct data', () => {
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: mockReport,
      loadingState: 'success',
      error: null,
      refresh: jest.fn(),
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    expect(screen.getByText('Monthly Focus Report')).toBeTruthy();
    expect(screen.getByText('24')).toBeTruthy(); // sessions completed
    expect(screen.getByText('Grade A')).toBeTruthy();
    expect(screen.getByText('+70')).toBeTruthy(); // score change
  });

  it('publishes view event when report loads', async () => {
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: mockReport,
      loadingState: 'success',
      error: null,
      refresh: jest.fn(),
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    await waitFor(() => {
      expect(events.publishMonthlyReportViewed).toHaveBeenCalledWith(
        'user-123',
        '2025-01',
        'A',
        70
      );
    });
  });

  it('publishes dismiss event when closed', () => {
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: mockReport,
      loadingState: 'success',
      error: null,
      refresh: jest.fn(),
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.press(closeButton);

    expect(events.publishMonthlyReportDismissed).toHaveBeenCalledWith(
      'user-123',
      '2025-01'
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('publishes share event when shared', async () => {
    (hooks.useMonthlyReport as jest.Mock).mockReturnValue({
      report: mockReport,
      loadingState: 'success',
      error: null,
      refresh: jest.fn(),
    });

    render(
      <MonthlyFocusReport
        userId="user-123"
        onClose={mockOnClose}
        visible={true}
      />
    );

    const shareButton = screen.getByText('Share Monthly Report');
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(events.publishMonthlyReportShared).toHaveBeenCalledWith(
        'user-123',
        '2025-01',
        'A',
        undefined
      );
    });
  });
});
