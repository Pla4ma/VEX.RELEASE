/**
 * Enterprise Analytics - Domain Types
 */

export interface EnterpriseAnalyticsDashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'executive' | 'operational' | 'departmental' | 'project' | 'custom';
  layout: DashboardLayout;
  widgets: AnalyticsWidget[];
  filters: DashboardFilter[];
  permissions: DashboardPermissions;
  refreshSettings: RefreshSettings;
  createdAt: Date;
  updatedAt: Date;
  lastViewed?: Date;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  spacing: number;
  widgetPositions: WidgetPosition[];
  responsive: {
    mobile: ResponsiveLayout;
    tablet: ResponsiveLayout;
    desktop: ResponsiveLayout;
  };
}

export interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface ResponsiveLayout {
  columns: number;
  rows: number;
  widgetPositions: WidgetPosition[];
}

export interface AnalyticsWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  dataSource: DataSource;
  configuration: WidgetConfiguration;
  visualization: VisualizationConfig;
  refreshInterval?: number; // seconds
  permissions: WidgetPermissions;
  status: 'active' | 'inactive' | 'error' | 'loading';
  lastUpdated?: Date;
  error?: string;
}

export type WidgetType =
  | 'metric_card'
  | 'chart'
  | 'table'
  | 'gauge'
  | 'progress_bar'
  | 'funnel'
  | 'heatmap'
  | 'map'
  | 'sankey'
  | 'timeline'
  | 'scorecard'
  | 'kpi'
  | 'alert'
  | 'text'
  | 'image'
  | 'custom';

export interface DataSource {
  id: string;
  type: 'database' | 'api' | 'file' | 'stream' | 'cache' | 'external';
  connection: DataSourceConnection;
  query?: string;
  parameters?: Record<string, any>;
  credentials?: DataSourceCredentials;
  cache?: CacheConfig;
  refreshPolicy: RefreshPolicy;
}

export interface DataSourceConnection {
  host: string;
  port?: number;
  database?: string;
  schema?: string;
  protocol: string;
  ssl?: boolean;
  timeout: number;
}

export interface DataSourceCredentials {
  type: 'basic' | 'oauth' | 'api_key' | 'certificate' | 'custom';
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  certificate?: string;
  customFields?: Record<string, string>;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  maxSize: number; // MB
  strategy: 'lru' | 'fifo' | 'custom';
}

export interface RefreshPolicy {
  type: 'manual' | 'scheduled' | 'realtime' | 'event_driven';
  interval?: number; // seconds
  schedule?: string; // cron expression
  events?: string[];
}

export interface WidgetConfiguration {
  metrics: MetricConfig[];
  dimensions: DimensionConfig[];
  filters: FilterConfig[];
  aggregations: AggregationConfig[];
  calculations?: CalculationConfig[];
  thresholds?: ThresholdConfig[];
}

export interface MetricConfig {
  name: string;
  field: string;
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max' | 'median' | 'distinct' | 'custom';
  format?: FormatConfig;
  alias?: string;
}

export interface DimensionConfig {
  name: string;
  field: string;
  type: 'categorical' | 'temporal' | 'geographical' | 'numerical';
  format?: FormatConfig;
  alias?: string;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'contains' | 'not_contains';
  value: any;
  type: 'static' | 'dynamic' | 'user_input';
}

export interface AggregationConfig {
  level: string;
  dimensions: string[];
  metrics: string[];
  timeGrain?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface CalculationConfig {
  name: string;
  formula: string;
  dependencies: string[];
  type: 'simple' | 'complex' | 'custom';
}

export interface ThresholdConfig {
  type: 'absolute' | 'percentage' | 'statistical';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | number[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  color?: string;
  action?: ThresholdAction;
}

export interface ThresholdAction {
  type: 'alert' | 'notification' | 'automation' | 'custom';
  target: string;
  message?: string;
  parameters?: Record<string, any>;
}

export interface FormatConfig {
  type: 'number' | 'currency' | 'percentage' | 'date' | 'time' | 'duration' | 'custom';
  pattern?: string;
  locale?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
}

export interface VisualizationConfig {
  type: VisualizationType;
  chartType?: ChartType;
  colors: ColorConfig;
  axes: AxisConfig;
  legend: LegendConfig;
  tooltip: TooltipConfig;
  animation: AnimationConfig;
  interactivity: InteractivityConfig;
}

export type VisualizationType = 'chart' | 'table' | 'map' | 'gauge' | 'text' | 'custom';

export type ChartType =
  | 'line'
  | 'bar'
  | 'column'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'area'
  | 'heatmap'
  | 'treemap'
  | 'funnel'
  | 'gauge'
  | 'radar'
  | 'polar'
  | 'sankey'
  | 'timeline'
  | 'candlestick'
  | 'ohlc'
  | 'histogram'
  | 'box_plot'
  | 'violin'
  | 'waterfall';

export interface ColorConfig {
  scheme: string;
  colors: string[];
  gradient?: GradientConfig;
  conditional?: ConditionalColorConfig;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: { offset: number; color: string }[];
  direction?: string;
}

export interface ConditionalColorConfig {
  rules: ConditionalColorRule[];
  defaultColor: string;
}

export interface ConditionalColorRule {
  condition: string;
  color: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between';
}

export interface AxisConfig {
  x: Axis;
  y: Axis;
  z?: Axis;
}

export interface Axis {
  title?: string;
  type: 'linear' | 'logarithmic' | 'time' | 'categorical';
  min?: number;
  max?: number;
  ticks?: TickConfig;
  grid?: GridConfig;
  labels?: LabelConfig;
}

export interface TickConfig {
  count?: number;
  interval?: number;
  format?: string;
  rotation?: number;
}

export interface GridConfig {
  enabled: boolean;
  color?: string;
  dash?: string;
  opacity?: number;
}

export interface LabelConfig {
  enabled: boolean;
  format?: string;
  rotation?: number;
  font?: FontConfig;
}

export interface FontConfig {
  family?: string;
  size?: number;
  weight?: string;
  color?: string;
}

export interface LegendConfig {
  enabled: boolean;
  position: 'top' | 'bottom' | 'left' | 'right' | 'none';
  orientation: 'horizontal' | 'vertical';
  font?: FontConfig;
}

export interface TooltipConfig {
  enabled: boolean;
  format?: string;
  shared?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  font?: FontConfig;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number; // milliseconds
  easing: string;
  delay?: number; // milliseconds
}

export interface InteractivityConfig {
  zoom: boolean;
  pan: boolean;
  drilldown: boolean;
  crossfilter: boolean;
  selection: boolean;
  hover: boolean;
  click: boolean;
}

export interface WidgetPermissions {
  canView: string[];
  canEdit: string[];
  canConfigure: string[];
  canShare: string[];
  canDelete: string[];
}

export interface DashboardFilter {
  id: string;
  name: string;
  field: string;
  type: 'select' | 'multiselect' | 'daterange' | 'number' | 'text' | 'boolean';
  options?: FilterOption[];
  defaultValue?: any;
  required: boolean;
  visible: boolean;
  order: number;
}

export interface FilterOption {
  label: string;
  value: any;
  icon?: string;
}

export interface DashboardPermissions {
  owner: string;
  viewers: string[];
  editors: string[];
  administrators: string[];
  public: boolean;
  sharing: {
    link: boolean;
    embed: boolean;
    export: boolean;
    api: boolean;
  };
}

export interface RefreshSettings {
  autoRefresh: boolean;
  interval: number; // seconds
  manualRefresh: boolean;
  realTimeUpdates: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  type: 'scheduled' | 'on_demand' | 'automated';
  template?: ReportTemplate;
  configuration: ReportConfiguration;
  schedule?: ReportSchedule;
  distribution: ReportDistribution;
  permissions: ReportPermissions;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  layout: ReportLayout;
  widgets: ReportWidget[];
  parameters: ReportParameter[];
  createdBy: string;
  createdAt: Date;
  popularity: number;
}

export interface ReportLayout {
  sections: ReportSection[];
  header: ReportHeader;
  footer: ReportFooter;
  styling: ReportStyling;
}

export interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'image' | 'custom';
  order: number;
  condition?: string;
  widgets: ReportWidget[];
}

export interface ReportHeader {
  title: string;
  subtitle?: string;
  logo?: string;
  dateRange?: string;
  metadata?: Record<string, string>;
}

export interface ReportFooter {
  text?: string;
  signature?: string;
  contact?: string;
  disclaimer?: string;
}

export interface ReportStyling {
  theme: string;
  colors: ColorConfig;
  fonts: FontConfig;
  margins: MarginConfig;
  pageBreaks: boolean;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ReportWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  dataSource: DataSource;
  configuration: WidgetConfiguration;
  visualization: VisualizationConfig;
  conditional?: ConditionalConfig;
}

export interface ConditionalConfig {
  condition: string;
  showWhen: boolean;
}

export interface ReportParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: ParameterOption[];
  validation?: ParameterValidation;
  description?: string;
}

export interface ParameterOption {
  label: string;
  value: any;
}

export interface ParameterValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ReportConfiguration {
  templateId?: string;
  parameters: Record<string, any>;
  dateRange: DateRangeConfig;
  filters: FilterConfig[];
  format: ReportFormat;
  delivery: DeliveryConfig;
}

export interface DateRangeConfig {
  type: 'fixed' | 'dynamic' | 'relative';
  startDate?: Date;
  endDate?: Date;
  relativeTo?: 'today' | 'start_of_week' | 'start_of_month' | 'start_of_quarter' | 'start_of_year';
  offset?: number;
  unit?: 'days' | 'weeks' | 'months' | 'years';
}

export interface ReportFormat {
  type: 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'email';
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'letter' | 'legal';
  includeCharts: boolean;
  includeRawData: boolean;
  compression: boolean;
  password?: string;
}

export interface DeliveryConfig {
  method: 'email' | 'ftp' | 'api' | 'webhook' | 'storage';
  recipients: string[];
  subject?: string;
  message?: string;
  attachments?: AttachmentConfig[];
  retryPolicy: RetryPolicy;
}

export interface AttachmentConfig {
  name: string;
  type: string;
  content: any;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffType: 'fixed' | 'exponential' | 'linear';
  delay: number; // seconds
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  cronExpression?: string;
  timezone: string;
  startDate: Date;
  endDate?: Date;
  nextRun?: Date;
}

export interface ReportDistribution {
  channels: DistributionChannel[];
  retention: RetentionPolicy;
  access: AccessPolicy;
}

export interface DistributionChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'api' | 'storage';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface RetentionPolicy {
  duration: number; // days
  autoDelete: boolean;
  archive: boolean;
  archiveLocation?: string;
}

export interface AccessPolicy {
  public: boolean;
  allowedUsers: string[];
  allowedRoles: string[];
  expiration?: Date;
  downloadLimit?: number;
}

export interface ReportPermissions {
  owner: string;
  viewers: string[];
  editors: string[];
  administrators: string[];
  sharing: {
    public: boolean;
    link: boolean;
    embed: boolean;
    api: boolean;
  };
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description?: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'pattern' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'suspended' | 'resolved';
  configuration: AlertConfiguration;
  conditions: AlertCondition[];
  actions: AlertAction[];
  schedule: AlertSchedule;
  history: AlertHistory[];
  metadata: AlertMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
}

export interface AlertConfiguration {
  dataSource: DataSource;
  evaluationInterval: number; // seconds
  cooldownPeriod: number; // seconds
  maxFrequency: number; // per hour
  aggregationWindow: number; // minutes
}

export interface AlertCondition {
  id: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between' | 'in' | 'not_in' | 'changes' | 'no_change';
  value: any;
  aggregation?: 'sum' | 'count' | 'average' | 'min' | 'max' | 'median';
  timeWindow?: number; // minutes
  groupBy?: string[];
}

export interface AlertAction {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams' | 'api' | 'automation' | 'custom';
  configuration: Record<string, any>;
  enabled: boolean;
  order: number;
}

export interface AlertSchedule {
  enabled: boolean;
  timezone: string;
  activeHours?: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  activeDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  holidays?: string[];
}

export interface AlertHistory {
  id: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  status: 'triggered' | 'acknowledged' | 'resolved' | 'false_positive';
  value: any;
  threshold: any;
  actions: AlertActionHistory[];
  notes?: string;
}

export interface AlertActionHistory {
  actionId: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  executedAt: Date;
  result?: any;
  error?: string;
}

export interface AlertMetadata {
  category: string;
  tags: string[];
  owner: string;
  contact?: string;
  documentation?: string;
  relatedAlerts?: string[];
  dependencies?: string[];
}

export interface EnterpriseAnalyticsUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'editor' | 'administrator' | 'owner';
  permissions: UserPermissions;
  preferences: UserPreferences;
  activity: UserActivity;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserPermissions {
  dashboards: PermissionSet;
  reports: PermissionSet;
  dataSources: PermissionSet;
  alerts: PermissionSet;
  administration: PermissionSet;
}

export interface PermissionSet {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExport: boolean;
  scopes: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultDashboard?: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  browser: boolean;
  mobile: boolean;
  types: ('alert' | 'report' | 'share' | 'comment' | 'system')[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface DashboardPreferences {
  autoRefresh: boolean;
  refreshInterval: number;
  defaultFilters: Record<string, any>;
  favoriteWidgets: string[];
  layoutDensity: 'compact' | 'normal' | 'spacious';
}

export interface UserActivity {
  lastActivity: Date;
  dashboardViews: ActivityMetric[];
  reportRuns: ActivityMetric[];
  alertInteractions: ActivityMetric[];
  dataQueries: ActivityMetric[];
  loginHistory: LoginHistory[];
}

export interface ActivityMetric {
  date: Date;
  count: number;
  details?: Record<string, any>;
}

export interface LoginHistory {
  timestamp: Date;
  ip: string;
  userAgent: string;
  location?: string;
  success: boolean;
}
