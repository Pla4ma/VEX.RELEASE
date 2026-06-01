export type DashboardState =
  | 'idle'
  | 'loading'
  | 'error'
  | 'empty'
  | 'partial'
  | 'ready';

export type DashboardTimeRange =
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month';

export interface DashboardError {
  title: string;
  message: string;
  code?: string;
  recoverable: boolean;
  action?: () => void;
}

export interface AnalyticsDashboardProps {
  userId: string;
  initialMetrics?: string[];
  initialTimeRange?: DashboardTimeRange;
  onInsightPress?: (insightId: string) => void;
  onExportPress?: () => void;
  onSettingsPress?: () => void;
}
