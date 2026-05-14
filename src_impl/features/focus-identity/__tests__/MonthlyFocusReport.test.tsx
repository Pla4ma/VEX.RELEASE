import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

import { MonthlyFocusReport } from '../components/MonthlyFocusReport';

const mockUseMonthlyReport = jest.fn();
const mockPublishViewed = jest.fn();
const mockPublishShared = jest.fn();
const mockPublishDismissed = jest.fn();

jest.mock('../hooks', () => ({
  useFocusScoreColor: jest.fn(() => 'goldenrod'),
  useMonthlyReport: (...args: unknown[]) => mockUseMonthlyReport(...args),
}));

jest.mock('../events', () => ({
  publishMonthlyReportViewed: (...args: unknown[]) => mockPublishViewed(...args),
  publishMonthlyReportShared: (...args: unknown[]) => mockPublishShared(...args),
  publishMonthlyReportDismissed: (...args: unknown[]) => mockPublishDismissed(...args),
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

function mockReportState(state: {
  data: typeof mockReport | null;
  error: Error | null;
  status: 'pending' | 'error' | 'success';
  refetch?: () => void;
}): void {
  mockUseMonthlyReport.mockReturnValue({
    data: state.data,
    error: state.error,
    refetch: state.refetch ?? jest.fn(),
    status: state.status,
  });
}

describe('MonthlyFocusReport', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
  });

  it('renders loading skeleton while the report is pending', () => {
    mockReportState({ data: null, error: null, status: 'pending' });
    const { toJSON } = render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    expect(toJSON()).toBeTruthy();
    expect(screen.queryByText('No Report Available')).toBeNull();
  });

  it('renders error state with retry button', () => {
    const mockRefresh = jest.fn();
    mockReportState({ data: null, error: new Error('Network error'), status: 'error', refetch: mockRefresh });

    render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    expect(screen.getByText(/Report Unavailable/)).toBeTruthy();
    expect(screen.getByText('Network error')).toBeTruthy();
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders empty state when no report is available', () => {
    mockReportState({ data: null, error: null, status: 'success' });

    render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    expect(screen.getByText('No Report Available')).toBeTruthy();
    expect(screen.getByText('Complete sessions this month to generate your first focus report.')).toBeTruthy();
  });

  it('renders report data', () => {
    mockReportState({ data: mockReport, error: null, status: 'success' });

    render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    expect(screen.getByText('Monthly Focus Report')).toBeTruthy();
    expect(screen.getByText('720')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('Sessions completed: 24')).toBeTruthy();
    expect(screen.getByText('Outstanding consistency this month!')).toBeTruthy();
  });

  it('publishes view event when report loads', async () => {
    mockReportState({ data: mockReport, error: null, status: 'success' });

    render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    await waitFor(() => {
      expect(mockPublishViewed).toHaveBeenCalledWith('user-123', '2025-01', 'A', 70);
    });
  });

  it('publishes dismiss event when closed', () => {
    mockReportState({ data: mockReport, error: null, status: 'success' });

    render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    fireEvent.press(screen.getByText('Close'));
    expect(mockPublishDismissed).toHaveBeenCalledWith('user-123', '2025-01');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('publishes share event when shared', async () => {
    mockReportState({ data: mockReport, error: null, status: 'success' });

    render(<MonthlyFocusReport userId="user-123" onClose={mockOnClose} visible />);

    fireEvent.press(screen.getByText('Share Monthly Report'));
    await waitFor(() => {
      expect(mockPublishShared).toHaveBeenCalledWith('user-123', '2025-01', 'A');
    });
  });
});
