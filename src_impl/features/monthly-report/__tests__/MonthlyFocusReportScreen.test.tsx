import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MonthlyFocusReportScreen } from '../components/MonthlyFocusReportScreen';

jest.mock('../hooks', () => ({
  useMonthlyReport: jest.fn(),
}));

jest.mock('../../../shared/monetization/use-revenuecat', () => ({
  usePremiumStatus: jest.fn(),
}));

jest.mock('../../../store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../network', () => ({
  useNetInfo: jest.fn(),
}));

jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 500: 'theme.colors.primary[500]' },
        background: { primary: 'theme.colors.primary[500]' },
        text: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', muted: 'theme.colors.primary[500]', inverse: 'theme.colors.background.primary' },
        surface: { card: 'theme.colors.background.primary' },
        success: { DEFAULT: 'theme.colors.primary[500]' },
        error: { DEFAULT: 'theme.colors.primary[500]' },
        warning: { DEFAULT: 'theme.colors.primary[500]' },
        accent: { purple: 'theme.colors.primary[500]', blue: 'theme.colors.primary[500]' },
      },
      spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
      borderRadius: { md: 8, lg: 12, xl: 16, full: 9999 },
    },
    isDark: false,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('../../../shared/ui/components/ScreenErrorBoundary', () => ({
  withScreenErrorBoundary: (C: React.ComponentType, _name: string) => C,
}));

const { useMonthlyReport } = jest.requireMock('../hooks') as {
  useMonthlyReport: jest.Mock;
};
const { usePremiumStatus } = jest.requireMock('../../../shared/monetization/use-revenuecat') as {
  usePremiumStatus: jest.Mock;
};
const { useAuthStore } = jest.requireMock('../../../store') as {
  useAuthStore: jest.Mock;
};
const { useNetInfo } = jest.requireMock('../../../network') as {
  useNetInfo: jest.Mock;
};

const mockReport = {
  monthStartScore: 600,
  monthEndScore: 650,
  scoreDelta: 50,
  bestFocusWindow: 'Morning (9:00 AM)',
  strongestPattern: 'Consistency',
  weakestPattern: 'Recency',
  sessionCount: 12,
  totalFocusedTime: 28800,
  bestGrade: 'A',
  nextMonthTarget: 675,
};

function setupMocks(overrides: Partial<{
  report: typeof mockReport | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isPremium: boolean;
  isOffline: boolean;
}> = {}) {
  const defaults = {
    report: mockReport,
    isPending: false,
    isError: false,
    error: null,
    isPremium: true,
    isOffline: false,
  };
  const opts = { ...defaults, ...overrides };

  useAuthStore.mockReturnValue({ user: { id: 'user-123' } });
  useNetInfo.mockReturnValue({ isOffline: opts.isOffline });
  usePremiumStatus.mockReturnValue({ isPremium: opts.isPremium });
  useMonthlyReport.mockReturnValue({
    report: opts.report,
    isPending: opts.isPending,
    isError: opts.isError,
    error: opts.error,
    refetch: jest.fn(),
  });
}

describe('MonthlyFocusReportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when pending', () => {
    setupMocks({ isPending: true });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByTestId('report-skeleton')).toBeTruthy();
  });

  it('renders error state with retry button', () => {
    setupMocks({ isError: true, error: new Error('Network error') });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText('Report Unavailable')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('renders empty state when no report', () => {
    setupMocks({ report: null });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText('No Sessions Yet')).toBeTruthy();
    expect(screen.getByText('Start a Session')).toBeTruthy();
  });

  it('renders offline banner when offline', () => {
    setupMocks({ isOffline: true });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText(/offline/i)).toBeTruthy();
  });

  it('renders success state with report data', () => {
    setupMocks({});
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText('Monthly Focus Report')).toBeTruthy();
    expect(screen.getByText('650')).toBeTruthy();
    expect(screen.getByText('+50 from month start')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('shows premium content for premium users', () => {
    setupMocks({ isPremium: true });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText('Best Focus Window')).toBeTruthy();
    expect(screen.getByText('Morning (9:00 AM)')).toBeTruthy();
    expect(screen.getByText('Consistency')).toBeTruthy();
    expect(screen.getByText('Recency')).toBeTruthy();
  });

  it('shows premium lock for free users', () => {
    setupMocks({ isPremium: false });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText('Premium insight available')).toBeTruthy();
    expect(screen.getByText('Unlock with Premium')).toBeTruthy();
  });

  it('free users see blurred premium sections', () => {
    setupMocks({ isPremium: false });
    render(<MonthlyFocusReportScreen />);
    expect(screen.getByText('Unlock to see your optimal focus time')).toBeTruthy();
    expect(screen.getByText('Unlock to see your strongest and weakest patterns')).toBeTruthy();
  });
});
