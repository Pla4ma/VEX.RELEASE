import type {
  BenchmarkComparison,
  BenchmarkType,
} from './completion-benchmark-set';

export interface ShareableTemplate {
  id: string;
  name: string;
  layout: TemplateLayout;
  style: TemplateStyle;
  text: TemplateText;
  branding: TemplateBranding;
}

export type TemplateLayout =
  | 'centered'
  | 'left_aligned'
  | 'right_aligned'
  | 'split'
  | 'card'
  | 'banner'
  | 'story';

export interface TemplateStyle {
  theme: 'light' | 'dark' | 'colorful' | 'minimal' | 'bold';
  colors: ColorScheme;
  fonts: FontScheme;
  animations: AnimationScheme;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FontScheme {
  heading: string;
  body: string;
  accent: string;
}

export interface AnimationScheme {
  enabled: boolean;
  type: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
  duration: number; // in seconds
}

export interface TemplateText {
  title: string;
  subtitle?: string;
  body?: string;
  callToAction?: string;
  hashtags?: string[];
}

export interface TemplateBranding {
  logo?: string;
  watermark?: boolean;
  attribution?: boolean;
  customMessage?: string;
}

export interface ShareableCustomization {
  field: string;
  type: 'text' | 'color' | 'image' | 'layout';
  options: CustomizationOption[];
  selected?: unknown;
}

export interface CustomizationOption {
  value: unknown;
  label: string;
  preview?: string;
}

export interface CompletionAnalytics {
  userId: string;
  sessionId: string;
  completionId: string;
  metrics: CompletionMetrics;
  trends: CompletionTrends;
  insights: CompletionInsight[];
  predictions: CompletionPrediction[];
  benchmarks: CompletionBenchmark[];
}

export interface CompletionMetrics {
  completionRate: number; // 0-100
  averageScore: number;
  averageTime: number;
  satisfactionScore: number;
  engagementScore: number;
  retentionRate: number;
  churnRisk: number;
  lifetimeValue: number;
  sessionCount: number;
  totalPlaytime: number;
}

export interface CompletionTrends {
  performance: TrendData[];
  satisfaction: TrendData[];
  engagement: TrendData[];
  retention: TrendData[];
  improvement: TrendData[];
}

export interface TrendData {
  date: Date;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
  prediction?: number;
}

export interface CompletionInsight {
  type: InsightType;
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  recommendations: string[];
  evidence: EvidenceData[];
}

export type InsightType =
  | 'strength'
  | 'weakness'
  | 'opportunity'
  | 'threat'
  | 'pattern'
  | 'anomaly'
  | 'correlation'
  | 'prediction';

export interface EvidenceData {
  type: 'metric' | 'event' | 'behavior' | 'feedback';
  value: unknown;
  timestamp: Date;
  context: string;
}

export interface CompletionPrediction {
  type: PredictionType;
  prediction: unknown;
  confidence: number;
  timeframe: string;
  factors: PredictionFactor[];
  actions: PredictionAction[];
}

export type PredictionType =
  | 'next_session_score'
  | 'churn_probability'
  | 'achievement_timeline'
  | 'skill_progression'
  | 'engagement_level'
  | 'retention_probability';

export interface PredictionFactor {
  factor: string;
  impact: number; // -100 to 100
  weight: number; // 0-1
  description: string;
}

export interface PredictionAction {
  action: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  resources: string[];
}

export interface CompletionBenchmark {
  type: BenchmarkType;
  category: string;
  userScore: number;
  benchmarkScore: number;
  percentile: number;
  rank: number;
  totalParticipants: number;
  comparison: BenchmarkComparison;
}
