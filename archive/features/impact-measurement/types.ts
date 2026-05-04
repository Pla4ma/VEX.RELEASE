/**
 * Impact Measurement - Domain Types
 */

export interface ImpactMeasurement {
  id: string;
  name: string;
  description: string;
  category: ImpactCategory;
  type: ImpactType;
  scope: ImpactScope;
  methodology: Methodology;
  metrics: ImpactMetric[];
  baselines: ImpactBaseline[];
  targets: ImpactTarget[];
  measurements: ImpactMeasurement[];
  reporting: ImpactReporting;
  verification: ImpactVerification;
  stakeholders: Stakeholder[];
  timeline: ImpactTimeline;
  status: ImpactStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type ImpactCategory = 
  | 'environmental'
  | 'social'
  | 'economic'
  | 'governance'
  | 'health'
  | 'education'
  | 'community'
  | 'cultural'
  | 'technological'
  | 'ethical'
  | 'custom';

export type ImpactType = 
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'mixed'
  | 'unknown';

export type ImpactScope = 
  | 'individual'
  | 'community'
  | 'regional'
  | 'national'
  | 'global'
  | 'organizational'
  | 'industry'
  | 'sector'
  | 'custom';

export interface Methodology {
  framework: ImpactFramework;
  approach: MeasurementApproach;
  data_collection: DataCollectionMethod[];
  analysis_techniques: AnalysisTechnique[];
  validation_methods: ValidationMethod[];
  standards: ComplianceStandard[];
  tools: MeasurementTool[];
}

export type ImpactFramework = 
  | 'theory_of_change'
  | 'logic_model'
  | 'results_based_management'
  | 'social_return_on_investment'
  | 'environmental_impact_assessment'
  | 'life_cycle_assessment'
  | 'triple_bottom_line'
  | 'sustainable_development_goals'
  | 'custom';

export interface MeasurementApproach {
  type: 'quantitative' | 'qualitative' | 'mixed_methods';
  design: 'experimental' | 'quasi_experimental' | 'observational' | 'case_study' | 'survey' | 'custom';
  sampling: SamplingMethod;
  frequency: MeasurementFrequency;
  scale: MeasurementScale;
}

export interface SamplingMethod {
  method: 'random' | 'stratified' | 'cluster' | 'convenience' | 'purposive' | 'snowball' | 'custom';
  size: number;
  criteria: SamplingCriteria[];
  margin_of_error?: number; // percentage
  confidence_level?: number; // percentage
}

export interface SamplingCriteria {
  type: 'demographic' | 'geographic' | 'behavioral' | 'technical' | 'custom';
  description: string;
  values: string[];
}

export interface MeasurementFrequency {
  type: 'continuous' | 'periodic' | 'event_based' | 'on_demand';
  interval?: string; // cron expression for periodic
  events?: string[]; // trigger events for event-based
}

export interface MeasurementScale {
  level: 'individual' | 'household' | 'organization' | 'community' | 'regional' | 'national' | 'global';
  granularity: 'fine' | 'medium' | 'coarse';
  geographic_scope: GeographicScope;
}

export interface GeographicScope {
  type: 'point' | 'polygon' | 'buffer' | 'custom';
  coordinates: GeographicCoordinate[];
  radius?: number; // meters
  precision: number; // decimal places
}

export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number; // meters
}

export interface DataCollectionMethod {
  name: string;
  type: DataCollectionType;
  description: string;
  instruments: DataInstrument[];
  procedures: CollectionProcedure[];
  quality_assurance: QualityAssurance;
  ethical_considerations: EthicalConsideration[];
}

export type DataCollectionType = 
  | 'survey'
  | 'interview'
  | 'observation'
  | 'measurement'
  | 'experiment'
  | 'secondary_data'
  | 'sensor_data'
  | 'administrative_data'
  | 'social_media'
  | 'remote_sensing'
  | 'custom';

export interface DataInstrument {
  name: string;
  type: InstrumentType;
  specification: InstrumentSpecification;
  calibration: CalibrationRecord[];
  validation: ValidationRecord[];
  reliability: ReliabilityMetrics;
}

export type InstrumentType = 
  | 'questionnaire'
  | 'interview_protocol'
  | 'observation_form'
  | 'sensor'
  | 'measurement_device'
  | 'software'
  | 'database'
  | 'api'
  | 'custom';

export interface InstrumentSpecification {
  purpose: string;
  design: string;
  parameters: InstrumentParameter[];
  accuracy: number; // 0-100
  precision: number; // decimal places
  range: { min: number; max: number };
  units: string;
}

export interface InstrumentParameter {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'boolean' | 'date' | 'custom';
  format: string;
  validation: ValidationRule[];
}

export interface ValidationRule {
  type: 'range' | 'pattern' | 'required' | 'custom';
  rule: string;
  error_message: string;
}

export interface CalibrationRecord {
  date: Date;
  method: string;
  results: CalibrationResult[];
  performed_by: string;
  notes: string;
}

export interface CalibrationResult {
  parameter: string;
  measured_value: number;
  expected_value: number;
  tolerance: number;
  passed: boolean;
}

export interface ValidationRecord {
  date: Date;
  method: string;
  results: ValidationResult[];
  performed_by: string;
  notes: string;
}

export interface ValidationResult {
  metric: string;
  value: number;
  benchmark: number;
  passed: boolean;
  confidence: number; // 0-100
}

export interface ReliabilityMetrics {
  test_retest: number; // 0-1
  inter_rater: number; // 0-1
  internal_consistency: number; // 0-1
  construct_validity: number; // 0-1
  content_validity: number; // 0-1
}

export interface CollectionProcedure {
  step: number;
  description: string;
  instructions: string[];
  duration: number; // minutes
  training_required: boolean;
  safety_considerations: string[];
  quality_checks: QualityCheck[];
}

export interface QualityCheck {
  type: 'data_integrity' | 'completeness' | 'accuracy' | 'consistency' | 'custom';
  description: string;
  method: string;
  threshold: number; // 0-100
  action_on_failure: string;
}

export interface QualityAssurance {
  protocols: QualityProtocol[];
  monitoring: QualityMonitoring;
  audits: QualityAudit[];
  improvement: QualityImprovement[];
}

export interface QualityProtocol {
  name: string;
  description: string;
  procedures: string[];
  frequency: string;
  responsible_party: string;
  documentation: string;
}

export interface QualityMonitoring {
  real_time: boolean;
  automated_checks: string[];
  manual_reviews: string[];
  alert_thresholds: AlertThreshold[];
  reporting: QualityReport[];
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  severity: 'info' | 'warning' | 'error' | 'critical';
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'notification' | 'escalation' | 'pause' | 'stop' | 'custom';
  target: string;
  message: string;
}

export interface QualityReport {
  name: string;
  frequency: string;
  metrics: string[];
  recipients: string[];
  format: 'email' | 'dashboard' | 'api' | 'custom';
}

export interface QualityAudit {
  id: string;
  date: Date;
  type: 'internal' | 'external' | 'regulatory';
  scope: string;
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  status: 'planned' | 'in_progress' | 'completed' | 'follow_up_required';
}

export interface AuditFinding {
  category: 'compliance' | 'quality' | 'process' | 'technical' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  impact: string;
}

export interface AuditRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  action_items: ActionItem[];
  timeline: string;
  responsible_party: string;
}

export interface ActionItem {
  description: string;
  deadline: Date;
  assignee: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dependencies: string[];
}

export interface QualityImprovement {
  initiative: string;
  description: string;
  goals: ImprovementGoal[];
  timeline: ImprovementTimeline;
  resources: ImprovementResource[];
  metrics: ImprovementMetric[];
  results: ImprovementResult[];
}

export interface ImprovementGoal {
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: Date;
}

export interface ImprovementTimeline {
  phases: ImprovementPhase[];
  milestones: ImprovementMilestone[];
  dependencies: string[];
}

export interface ImprovementPhase {
  name: string;
  start_date: Date;
  end_date: Date;
  objectives: string[];
  deliverables: string[];
}

export interface ImprovementMilestone {
  name: string;
  date: Date;
  description: string;
  success_criteria: string[];
}

export interface ImprovementResource {
  type: 'personnel' | 'equipment' | 'software' | 'training' | 'custom';
  name: string;
  quantity: number;
  cost: number;
  availability: string;
}

export interface ImprovementMetric {
  name: string;
  type: 'leading' | 'lagging';
  calculation: string;
  target: number;
  current: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ImprovementResult {
  metric: string;
  before_value: number;
  after_value: number;
  change: number; // percentage
  significance: boolean;
  confidence: number; // 0-100
}

export interface EthicalConsideration {
  type: 'privacy' | 'consent' | 'confidentiality' | 'bias' | 'harm' | 'custom';
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string[];
  legal_requirements: string[];
  ethical_approval: EthicalApproval;
}

export interface EthicalApproval {
  required: boolean;
  obtained: boolean;
  authority: string;
  approval_number?: string;
  expiry_date?: Date;
  conditions: string[];
}

export interface AnalysisTechnique {
  name: string;
  type: AnalysisType;
  description: string;
  methodology: string;
  assumptions: string[];
  limitations: string[];
  software: AnalysisSoftware[];
  expertise_required: ExpertiseLevel;
}

export type AnalysisType = 
  | 'statistical'
  | 'econometric'
  | 'qualitative'
  | 'machine_learning'
  | 'network_analysis'
  | 'spatial_analysis'
  | 'time_series'
  | 'cost_benefit'
  | 'multi_criteria'
  | 'custom';

export interface AnalysisSoftware {
  name: string;
  version: string;
  license: string;
  capabilities: string[];
  training_required: boolean;
  cost: number;
}

export interface ExpertiseLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  training_hours: number;
  experience_years: number;
  certifications: string[];
}

export interface ValidationMethod {
  name: string;
  type: ValidationType;
  description: string;
  procedure: string;
  criteria: ValidationCriteria[];
  results: ValidationResult[];
}

export type ValidationType = 
  | 'cross_validation'
  | 'peer_review'
  | 'expert_validation'
  | 'stakeholder_validation'
  | 'triangulation'
  | 'sensitivity_analysis'
  | 'robustness_check'
  | 'external_validation'
  | 'custom';

export interface ValidationCriteria {
  metric: string;
  threshold: number;
  weight: number; // 0-1
  description: string;
}

export interface ComplianceStandard {
  name: string;
  organization: string;
  version: string;
  scope: string;
  requirements: ComplianceRequirement[];
  audit_frequency: string;
  certification: Certification;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  category: string;
  mandatory: boolean;
  evidence_required: string[];
  verification_method: string;
}

export interface Certification {
  required: boolean;
  obtained: boolean;
  certificate_number?: string;
  issue_date?: Date;
  expiry_date?: Date;
  issuing_body: string;
}

export interface MeasurementTool {
  name: string;
  type: ToolType;
  description: string;
  features: ToolFeature[];
  integration: ToolIntegration[];
  pricing: PricingModel;
  support: SupportPlan;
  documentation: ToolDocumentation;
}

export type ToolType = 
  | 'survey_platform'
  | 'data_collection'
  | 'analysis'
  | 'visualization'
  | 'reporting'
  | 'project_management'
  | 'collaboration'
  | 'monitoring'
  | 'custom';

export interface ToolFeature {
  name: string;
  description: string;
  capability: string;
  limitations: string[];
}

export interface ToolIntegration {
  type: 'api' | 'file_import' | 'file_export' | 'database' | 'webhook' | 'custom';
  format: string;
  authentication: AuthenticationMethod;
  frequency: string;
}

export interface AuthenticationMethod {
  type: 'api_key' | 'oauth' | 'basic' | 'jwt' | 'custom';
  credentials: Record<string, string>;
}

export interface PricingModel {
  type: 'free' | 'freemium' | 'subscription' | 'usage_based' | 'perpetual' | 'custom';
  currency: string;
  price: number;
  billing_period?: string;
  usage_tiers?: UsageTier[];
}

export interface UsageTier {
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
  features: string[];
}

export interface SupportPlan {
  type: 'community' | 'basic' | 'premium' | 'enterprise' | 'custom';
  response_time: string;
  channels: string[];
  languages: string[];
  cost: number;
}

export interface ToolDocumentation {
  user_guide: string;
  api_documentation: string;
  tutorials: Tutorial[];
  faq: FAQ[];
  community: CommunityResource[];
}

export interface Tutorial {
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  format: 'video' | 'text' | 'interactive' | 'custom';
  url: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
  last_updated: Date;
}

export interface CommunityResource {
  type: 'forum' | 'blog' | 'webinar' | 'meetup' | 'custom';
  name: string;
  url: string;
  activity_level: 'low' | 'medium' | 'high';
}

export interface ImpactMetric {
  id: string;
  name: string;
  description: string;
  category: MetricCategory;
  type: MetricType;
  unit: string;
  scale: MetricScale;
  calculation: MetricCalculation;
  data_source: DataSource;
  collection_method: string;
  frequency: MeasurementFrequency;
  target: MetricTarget;
  baseline: MetricBaseline;
  thresholds: MetricThreshold[];
  validation: MetricValidation;
}

export type MetricCategory = 
  | 'input'
  | 'output'
  | 'outcome'
  | 'impact'
  | 'process'
  | 'context'
  | 'custom';

export type MetricType = 
  | 'quantitative'
  | 'qualitative'
  | 'binary'
  | 'ordinal'
  | 'ratio'
  | 'custom';

export interface MetricScale {
  type: 'nominal' | 'ordinal' | 'interval' | 'ratio';
  range: { min: number; max: number };
  increments: number;
  precision: number; // decimal places
}

export interface MetricCalculation {
  formula: string;
  variables: CalculationVariable[];
  methodology: string;
  assumptions: string[];
  examples: CalculationExample[];
}

export interface CalculationVariable {
  name: string;
  type: string;
  source: string;
  unit: string;
  description: string;
}

export interface CalculationExample {
  scenario: string;
  inputs: Record<string, number>;
  expected_output: number;
  explanation: string;
}

export interface DataSource {
  type: DataSourceType;
  name: string;
  description: string;
  provider: string;
  format: string;
  accessibility: DataAccessibility;
  quality: DataQuality;
  cost: DataCost;
  reliability: DataReliability;
}

export type DataSourceType = 
  | 'primary'
  | 'secondary'
  | 'administrative'
  | 'sensor'
  | 'survey'
  | 'social_media'
  | 'satellite'
  | 'financial'
  | 'custom';

export interface DataAccessibility {
  availability: 'public' | 'restricted' | 'private';
  access_method: string;
  permissions: string[];
  cost: number;
  update_frequency: string;
}

export interface DataQuality {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  timeliness: number; // 0-100
  relevance: number; // 0-100
}

export interface DataCost {
  acquisition_cost: number;
  processing_cost: number;
  storage_cost: number;
  maintenance_cost: number;
  currency: string;
}

export interface DataReliability {
  source_credibility: number; // 0-100
  verification_status: 'verified' | 'unverified' | 'disputed';
  last_verified: Date;
  issues: DataIssue[];
}

export interface DataIssue {
  type: 'missing' | 'inaccurate' | 'inconsistent' | 'outdated' | 'custom';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
}

export interface MetricTarget {
  value: number;
  unit: string;
  timeframe: string;
  rationale: string;
  confidence: number; // 0-100
  achievability: 'high' | 'medium' | 'low';
}

export interface MetricBaseline {
  value: number;
  unit: string;
  date: Date;
  source: string;
  methodology: string;
  confidence: number; // 0-100
}

export interface MetricThreshold {
  type: 'warning' | 'critical' | 'success' | 'custom';
  value: number;
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  action: string;
  notification: boolean;
}

export interface MetricValidation {
  method: string;
  frequency: string;
  criteria: ValidationCriteria[];
  results: ValidationResult[];
  last_validated: Date;
}

export interface ImpactBaseline {
  id: string;
  name: string;
  description: string;
  date: Date;
  methodology: string;
  data_sources: string[];
  metrics: BaselineMetric[];
  quality: BaselineQuality;
  comparators: BaselineComparator[];
}

export interface BaselineMetric {
  metric_id: string;
  value: number;
  unit: string;
  confidence: number; // 0-100
  methodology: string;
  notes: string;
}

export interface BaselineQuality {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  reliability: number; // 0-100
  relevance: number; // 0-100
  issues: string[];
}

export interface BaselineComparator {
  name: string;
  type: 'industry' | 'regional' | 'national' | 'international' | 'competitor' | 'custom';
  values: ComparatorValue[];
  source: string;
  date: Date;
}

export interface ComparatorValue {
  metric: string;
  value: number;
  unit: string;
  percentile: number;
  confidence: number; // 0-100
}

export interface ImpactTarget {
  id: string;
  name: string;
  description: string;
  category: TargetCategory;
  type: TargetType;
  metrics: TargetMetric[];
  timeframe: TargetTimeframe;
  responsibility: TargetResponsibility;
  resources: TargetResource[];
  dependencies: TargetDependency[];
  status: TargetStatus;
}

export type TargetCategory = 
  | 'strategic'
  | 'operational'
  | 'regulatory'
  | 'stakeholder'
  | 'financial'
  | 'environmental'
  | 'social'
  | 'custom';

export type TargetType = 
  | 'absolute'
  | 'relative'
  | 'directional'
  | 'threshold'
  | 'custom';

export interface TargetMetric {
  metric_id: string;
  target_value: number;
  current_value: number;
  unit: string;
  progress: number; // 0-100
  weight: number; // 0-1
}

export interface TargetTimeframe {
  start_date: Date;
  end_date: Date;
  milestones: TargetMilestone[];
  review_frequency: string;
}

export interface TargetMilestone {
  name: string;
  date: Date;
  description: string;
  criteria: string[];
  status: 'pending' | 'achieved' | 'missed' | 'extended';
}

export interface TargetResponsibility {
  owner: string;
  contributors: string[];
  approver: string;
  reporting_line: string[];
}

export interface TargetResource {
  type: 'personnel' | 'financial' | 'equipment' | 'technology' | 'custom';
  name: string;
  quantity: number;
  cost: number;
  availability: string;
}

export interface TargetDependency {
  type: 'internal' | 'external' | 'regulatory' | 'technical' | 'custom';
  description: string;
  target: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'resolved' | 'blocked';
}

export interface TargetStatus {
  overall: 'on_track' | 'at_risk' | 'behind' | 'ahead' | 'achieved' | 'missed';
  confidence: number; // 0-100
  last_updated: Date;
  issues: TargetIssue[];
}

export interface TargetIssue {
  type: 'resource' | 'technical' | 'external' | 'timing' | 'custom';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  mitigation: string;
  resolution: string;
}

export interface ImpactData {
  id: string;
  metric_id: string;
  value: number;
  unit: string;
  timestamp: Date;
  location?: GeographicCoordinate;
  source: string;
  methodology: string;
  quality: DataQuality;
  metadata: DataMetadata;
  verification: DataVerification;
}

export interface DataMetadata {
  collector: string;
  collection_method: string;
  conditions: string[];
  notes: string;
  tags: string[];
  confidence: number; // 0-100
}

export interface DataVerification {
  verified: boolean;
  verified_by: string;
  verified_date: Date;
  method: string;
  issues: string[];
}

export interface ImpactReporting {
  schedule: ReportingSchedule;
  templates: ReportTemplate[];
  dashboards: Dashboard[];
  alerts: ReportingAlert[];
  distribution: DistributionList[];
  compliance: ReportingCompliance;
}

export interface ReportingSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand' | 'custom';
  recipients: string[];
  format: ReportFormat[];
  delivery_method: DeliveryMethod[];
  automation: ReportAutomation;
}

export interface ReportFormat {
  type: 'pdf' | 'html' | 'excel' | 'powerpoint' | 'json' | 'xml' | 'custom';
  template: string;
  styling: ReportStyling;
  sections: ReportSection[];
}

export interface ReportStyling {
  theme: string;
  colors: ColorPalette;
  fonts: FontFamily[];
  logos: string[];
  branding: BrandingGuidelines;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FontFamily {
  name: string;
  weights: string[];
  fallbacks: string[];
}

export interface BrandingGuidelines {
  logo_usage: string;
  color_usage: string;
  typography: string;
  imagery: string;
}

export interface ReportSection {
  name: string;
  type: 'summary' | 'detailed' | 'chart' | 'table' | 'text' | 'custom';
  content: string;
  data_source: string;
  visualization: VisualizationConfig;
}

export interface VisualizationConfig {
  type: 'chart' | 'graph' | 'map' | 'table' | 'custom';
  chart_type: string;
  data_mapping: DataMapping;
  styling: VisualizationStyling;
  interactivity: InteractivityConfig;
}

export interface DataMapping {
  x_axis: string;
  y_axis: string;
  series: string[];
  filters: FilterConfig[];
  aggregations: AggregationConfig[];
}

export interface FilterConfig {
  field: string;
  operator: string;
  value: any;
  type: 'static' | 'dynamic';
}

export interface AggregationConfig {
  field: string;
  function: 'sum' | 'count' | 'average' | 'min' | 'max' | 'custom';
  group_by: string[];
}

export interface VisualizationStyling {
  colors: string[];
  fonts: string;
  sizes: SizeConfig;
  legends: LegendConfig;
}

export interface SizeConfig {
  width: number;
  height: number;
  margin: MarginConfig;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LegendConfig {
  position: string;
  orientation: string;
  show: boolean;
}

export interface InteractivityConfig {
  zoom: boolean;
  pan: boolean;
  hover: boolean;
  click: boolean;
  drill_down: boolean;
}

export interface DeliveryMethod {
  type: 'email' | 'ftp' | 'api' | 'webhook' | 'download' | 'custom';
  configuration: Record<string, any>;
  authentication: AuthenticationMethod;
  encryption: boolean;
}

export interface ReportAutomation {
  data_extraction: AutomationStep[];
  data_processing: AutomationStep[];
  report_generation: AutomationStep[];
  distribution: AutomationStep[];
  error_handling: ErrorHandlingConfig;
}

export interface AutomationStep {
  name: string;
  type: 'script' | 'api_call' | 'file_operation' | 'notification' | 'custom';
  command: string;
  parameters: Record<string, any>;
  dependencies: string[];
  timeout: number; // seconds
  retry_policy: RetryPolicy;
}

export interface RetryPolicy {
  max_attempts: number;
  backoff_type: 'fixed' | 'exponential' | 'linear';
  delay: number; // seconds
  max_delay: number; // seconds
}

export interface ErrorHandlingConfig {
  logging: boolean;
  notification: boolean;
  escalation: boolean;
  fallback: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  format: ReportFormat;
  sections: ReportSection[];
  variables: TemplateVariable[];
  usage: TemplateUsage;
}

export type TemplateCategory = 
  | 'executive_summary'
  | 'detailed_analysis'
  | 'stakeholder_report'
  | 'regulatory_compliance'
  | 'progress_update'
  | 'impact_assessment'
  | 'custom';

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'chart' | 'table' | 'custom';
  default_value: any;
  required: boolean;
  description: string;
}

export interface TemplateUsage {
  usage_count: number;
  last_used: Date;
  users: string[];
  projects: string[];
  feedback: TemplateFeedback[];
}

export interface TemplateFeedback {
  user: string;
  rating: number; // 1-5
  comments: string;
  date: Date;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: DashboardType;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  permissions: DashboardPermission;
  refresh: RefreshConfig;
}

export type DashboardType = 
  | 'executive'
  | 'operational'
  | 'analytical'
  | 'strategic'
  | 'stakeholder'
  | 'public'
  | 'custom';

export interface DashboardLayout {
  columns: number;
  rows: number;
  widget_positions: WidgetPosition[];
  responsive: ResponsiveLayout;
}

export interface WidgetPosition {
  widget_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index?: number;
}

export interface ResponsiveLayout {
  mobile: ResponsiveConfig;
  tablet: ResponsiveConfig;
  desktop: ResponsiveConfig;
}

export interface ResponsiveConfig {
  columns: number;
  rows: number;
  widget_positions: WidgetPosition[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  data_source: string;
  configuration: WidgetConfiguration;
  visualization: VisualizationConfig;
  refresh_interval?: number; // seconds
  permissions: WidgetPermission;
}

export type WidgetType = 
  | 'metric_card'
  | 'chart'
  | 'table'
  | 'gauge'
  | 'map'
  | 'text'
  | 'image'
  | 'custom';

export interface WidgetConfiguration {
  metrics: string[];
  filters: FilterConfig[];
  aggregations: AggregationConfig[];
  calculations: WidgetCalculation[];
}

export interface WidgetCalculation {
  name: string;
  formula: string;
  variables: string[];
}

export interface WidgetPermission {
  can_view: string[];
  can_edit: string[];
  can_share: string[];
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  options: FilterOption[];
  default_value: any;
  required: boolean;
  visible: boolean;
}

export type FilterType = 
  | 'select'
  | 'multiselect'
  | 'daterange'
  | 'number'
  | 'text'
  | 'boolean'
  | 'custom';

export interface FilterOption {
  label: string;
  value: any;
}

export interface DashboardPermission {
  owner: string;
  viewers: string[];
  editors: string[];
  administrators: string[];
  public: boolean;
  sharing: SharingConfig;
}

export interface SharingConfig {
  link_sharing: boolean;
  embed_sharing: boolean;
  export_sharing: boolean;
  api_access: boolean;
}

export interface RefreshConfig {
  auto_refresh: boolean;
  interval: number; // seconds
  manual_refresh: boolean;
  real_time_updates: boolean;
  cache_enabled: boolean;
  cache_ttl: number; // seconds
}

export interface ReportingAlert {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  conditions: AlertCondition[];
  actions: AlertAction[];
  schedule: AlertSchedule;
  status: AlertStatus;
}

export type AlertType = 
  | 'threshold'
  | 'anomaly'
  | 'trend'
  | 'missing_data'
  | 'quality'
  | 'compliance'
  | 'custom';

export interface AlertCondition {
  metric: string;
  operator: string;
  value: any;
  time_window?: string;
  aggregation?: string;
}

export interface AlertSchedule {
  enabled: boolean;
  timezone: string;
  active_hours: TimeRange[];
  active_days: string[];
}

export interface AlertStatus {
  active: boolean;
  last_triggered?: Date;
  trigger_count: number;
  error_count: number;
}

export interface DistributionList {
  id: string;
  name: string;
  description: string;
  type: DistributionType;
  recipients: Recipient[];
  filters: DistributionFilter[];
  preferences: DistributionPreferences;
}

export type DistributionType = 
  | 'static'
  | 'dynamic'
  | 'role_based'
  | 'custom';

export interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: RecipientPreferences;
}

export interface RecipientPreferences {
  format: string[];
  frequency: string;
  language: string;
  timezone: string;
}

export interface DistributionFilter {
  field: string;
  operator: string;
  value: any;
  type: 'include' | 'exclude';
}

export interface DistributionPreferences {
  default_format: string;
  default_frequency: string;
  language: string;
  timezone: string;
}

export interface ReportingCompliance {
  standards: ComplianceStandard[];
  requirements: ComplianceRequirement[];
  audit_trail: AuditTrail[];
  data_protection: DataProtection;
}

export interface AuditTrail {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ip_address: string;
}

export interface DataProtection {
  encryption: boolean;
  anonymization: boolean;
  retention_policy: RetentionPolicy;
  access_controls: AccessControl[];
  gdpr_compliance: GDPRCompliance;
}

export interface RetentionPolicy {
  data_types: DataRetentionPolicy[];
  archival_period: number; // days
  deletion_period: number; // days
  automated: boolean;
}

export interface DataRetentionPolicy {
  data_type: string;
  retention_period: number; // days
  archival: boolean;
  deletion_method: string;
}

export interface AccessControl {
  role: string;
  permissions: string[];
  resources: string[];
  conditions: AccessCondition[];
}

export interface AccessCondition {
  type: 'time' | 'location' | 'device' | 'custom';
  condition: string;
  value: any;
}

export interface GDPRCompliance {
  lawful_basis: string;
  consent_management: ConsentManagement;
  data_subject_rights: DataSubjectRight[];
  breach_procedures: BreachProcedure[];
}

export interface ConsentManagement {
  required: boolean;
  method: string;
  withdrawal_method: string;
  record_keeping: boolean;
}

export interface DataSubjectRight {
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection' | 'custom';
  description: string;
  procedure: string;
  timeframe: string; // days
}

export interface BreachProcedure {
  detection: string;
  assessment: string;
  notification: string;
  mitigation: string;
  reporting: string;
}

export interface ImpactVerification {
  methodology: VerificationMethodology;
  procedures: VerificationProcedure[];
  standards: VerificationStandard[];
  results: VerificationResult[];
  certification: VerificationCertification;
}

export interface VerificationMethodology {
  name: string;
  description: string;
  principles: string[];
  limitations: string[];
  applicability: string[];
}

export interface VerificationProcedure {
  name: string;
  type: ProcedureType;
  description: string;
  steps: VerificationStep[];
  resources: VerificationResource[];
  timeline: ProcedureTimeline;
}

export type ProcedureType = 
  | 'internal_audit'
  | 'external_audit'
  | 'peer_review'
  | 'expert_validation'
  | 'stakeholder_validation'
  | 'statistical_validation'
  | 'custom';

export interface VerificationStep {
  order: number;
  name: string;
  description: string;
  method: string;
  responsible_party: string;
  deliverables: string[];
  quality_criteria: QualityCriteria[];
}

export interface QualityCriteria {
  metric: string;
  standard: string;
  measurement_method: string;
  threshold: number;
}

export interface VerificationResource {
  type: 'personnel' | 'equipment' | 'software' | 'documentation' | 'custom';
  name: string;
  quantity: number;
  expertise: string[];
  availability: string;
}

export interface ProcedureTimeline {
  start_date: Date;
  end_date: Date;
  phases: ProcedurePhase[];
  milestones: ProcedureMilestone[];
}

export interface ProcedurePhase {
  name: string;
  start_date: Date;
  end_date: Date;
  activities: string[];
  deliverables: string[];
}

export interface ProcedureMilestone {
  name: string;
  date: Date;
  description: string;
  success_criteria: string[];
}

export interface VerificationStandard {
  name: string;
  organization: string;
  version: string;
  scope: string;
  requirements: StandardRequirement[];
  assessment_method: string;
}

export interface StandardRequirement {
  id: string;
  description: string;
  category: string;
  mandatory: boolean;
  evidence_required: string[];
  verification_method: string;
}

export interface VerificationResult {
  id: string;
  verification_id: string;
  date: Date;
  verifier: string;
  methodology: string;
  findings: VerificationFinding[];
  conclusion: VerificationConclusion;
  recommendations: VerificationRecommendation[];
  confidence: number; // 0-100
  limitations: string[];
}

export interface VerificationFinding {
  type: 'conformity' | 'non_conformity' | 'observation' | 'opportunity_for_improvement';
  description: string;
  evidence: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
}

export interface VerificationConclusion {
  overall_assessment: string;
  compliance_level: number; // 0-100
  confidence_level: number; // 0-100
  limitations: string[];
  next_steps: string[];
}

export interface VerificationRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  action_items: string[];
  timeline: string;
  responsible_party: string;
  resources: string[];
}

export interface VerificationCertification {
  required: boolean;
  obtained: boolean;
  certificate_number?: string;
  issue_date?: Date;
  expiry_date?: Date;
  issuing_body: string;
  scope: string;
  conditions: string[];
}

export interface Stakeholder {
  id: string;
  name: string;
  type: StakeholderType;
  category: StakeholderCategory;
  role: string;
  influence: InfluenceLevel;
  interest: InterestLevel;
  engagement: EngagementLevel;
  contact: StakeholderContact;
  expectations: StakeholderExpectation[];
  contributions: StakeholderContribution[];
  communication: CommunicationPreference;
}

export type StakeholderType = 
  | 'individual'
  | 'organization'
  | 'community'
  | 'government'
  | 'investor'
  | 'partner'
  | 'supplier'
  | 'customer'
  | 'employee'
  | 'custom';

export type StakeholderCategory = 
  | 'primary'
  | 'secondary'
  | 'key'
  | 'external'
  | 'internal'
  | 'direct'
  | 'indirect'
  | 'custom';

export interface InfluenceLevel {
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  score: number; // 0-100
  factors: string[];
}

export interface InterestLevel {
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  score: number; // 0-100
  areas: string[];
}

export interface EngagementLevel {
  current: 'not_engaged' | 'passive' | 'active' | 'leading' | 'custom';
  target: string;
  strategy: string;
  frequency: string;
}

export interface StakeholderContact {
  primary_contact: ContactInfo;
  alternate_contacts: ContactInfo[];
  preferred_method: ContactMethod;
  availability: ContactAvailability;
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: Address;
  website?: string;
  social_media: SocialMedia[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  coordinates?: GeographicCoordinate;
}

export interface SocialMedia {
  platform: string;
  handle: string;
  url: string;
}

export interface ContactMethod {
  type: 'email' | 'phone' | 'video' | 'in_person' | 'mail' | 'custom';
  preference: 'primary' | 'secondary' | 'tertiary';
}

export interface ContactAvailability {
  timezone: string;
  business_hours: TimeRange[];
  preferred_days: string[];
  response_time: string;
}

export interface StakeholderExpectation {
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  measurable: boolean;
  target?: string;
  timeline?: string;
}

export interface StakeholderContribution {
  type: ContributionType;
  description: string;
  value: string;
  frequency: string;
  conditions: string[];
}

export type ContributionType = 
  | 'financial'
  | 'in_kind'
  | 'expertise'
  | 'labor'
  | 'resources'
  | 'network'
  | 'endorsement'
  | 'custom';

export interface CommunicationPreference {
  frequency: string;
  format: CommunicationFormat[];
  language: string;
  tone: 'formal' | 'informal' | 'technical' | 'plain_language';
  channels: CommunicationChannel[];
  content: ContentType[];
}

export interface CommunicationFormat {
  type: 'email' | 'newsletter' | 'report' | 'dashboard' | 'presentation' | 'meeting' | 'custom';
  preference: 'preferred' | 'acceptable' | 'avoid';
}

export interface CommunicationChannel {
  channel: 'email' | 'phone' | 'video' | 'social_media' | 'website' | 'mail' | 'in_person' | 'custom';
  preference: 'preferred' | 'acceptable' | 'avoid';
  details: Record<string, string>;
}

export interface ContentType {
  type: 'summary' | 'detailed' | 'technical' | 'financial' | 'progress' | 'impact' | 'custom';
  preference: 'preferred' | 'acceptable' | 'avoid';
}

export interface ImpactTimeline {
  phases: ImpactPhase[];
  milestones: ImpactMilestone[];
  critical_path: CriticalPath[];
  dependencies: TimelineDependency[];
  risks: TimelineRisk[];
}

export interface ImpactPhase {
  id: string;
  name: string;
  description: string;
  type: PhaseType;
  start_date: Date;
  end_date: Date;
  duration: number; // days
  objectives: string[];
  deliverables: string[];
  activities: PhaseActivity[];
  resources: PhaseResource[];
  success_criteria: SuccessCriteria[];
}

export type PhaseType = 
  | 'planning'
  | 'implementation'
  | 'monitoring'
  | 'evaluation'
  | 'reporting'
  | 'scaling'
  | 'sustainment'
  | 'custom';

export interface PhaseActivity {
  name: string;
  description: string;
  type: 'task' | 'milestone' | 'deliverable' | 'custom';
  dependencies: string[];
  duration: number; // days
  resources: string[];
  responsible_party: string;
  status: ActivityStatus;
}

export type ActivityStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'blocked'
  | 'cancelled';

export interface PhaseResource {
  type: 'personnel' | 'financial' | 'equipment' | 'technology' | 'custom';
  name: string;
  quantity: number;
  cost: number;
  allocation: ResourceAllocation;
}

export interface ResourceAllocation {
  percentage: number; // 0-100
  start_date: Date;
  end_date: Date;
  flexibility: 'fixed' | 'flexible' | 'negotiable';
}

export interface SuccessCriteria {
  name: string;
  description: string;
  measurement: string;
  target: string;
  verification: string;
}

export interface ImpactMilestone {
  id: string;
  name: string;
  description: string;
  date: Date;
  type: MilestoneType;
  importance: ImportanceLevel;
  deliverables: string[];
  dependencies: string[];
  status: MilestoneStatus;
  celebration: CelebrationPlan;
}

export type MilestoneType = 
  | 'launch'
  | 'completion'
  | 'review'
  | 'decision'
  | 'report'
  | 'payment'
  | 'regulatory'
  | 'custom';

export type ImportanceLevel = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface MilestoneStatus {
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'extended' | 'cancelled';
  completion_date?: Date;
  variance?: number; // days
  notes: string;
}

export interface CelebrationPlan {
  planned: boolean;
  type: 'internal' | 'external' | 'public' | 'custom';
  activities: string[];
  budget: number;
  communication: string;
}

export interface CriticalPath {
  activities: string[];
  duration: number; // days
  flexibility: number; // 0-100
  risks: string[];
  mitigation: string[];
}

export interface TimelineDependency {
  type: DependencyType;
  from: string;
  to: string;
  description: string;
  lag: number; // days
  flexibility: DependencyFlexibility;
}

export type DependencyType = 
  | 'finish_to_start'
  | 'start_to_start'
  | 'finish_to_finish'
  | 'start_to_finish'
  | 'custom';

export interface DependencyFlexibility {
  can_overlap: boolean;
  max_overlap: number; // days
  can_shift: boolean;
  max_shift: number; // days
}

export interface TimelineRisk {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  probability: ProbabilityLevel;
  impact: ImpactLevel;
  risk_score: number; // 0-100
  mitigation: MitigationStrategy[];
  contingency: ContingencyPlan;
  owner: string;
  status: RiskStatus;
}

export type RiskCategory = 
  | 'technical'
  | 'financial'
  | 'operational'
  | 'regulatory'
  | 'reputational'
  | 'environmental'
  | 'social'
  | 'custom';

export type ProbabilityLevel = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export type ImpactLevel = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export interface MitigationStrategy {
  strategy: string;
  description: string;
  effectiveness: number; // 0-100
  cost: number;
  timeline: string;
  responsible_party: string;
  status: StrategyStatus;
}

export type StrategyStatus = 
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ContingencyPlan {
  trigger: string;
  actions: ContingencyAction[];
  resources: ContingencyResource[];
  timeline: string;
  budget: number;
}

export interface ContingencyAction {
  action: string;
  responsible_party: string;
  deadline: Date;
  dependencies: string[];
}

export interface ContingencyResource {
  type: string;
  name: string;
  quantity: number;
  cost: number;
  availability: string;
}

export type RiskStatus = 
  | 'identified'
  | 'assessed'
  | 'mitigated'
  | 'accepted'
  | 'transferred'
  | 'realized'
  | 'closed';

export type ImpactStatus = 
  | 'planned'
  | 'in_progress'
  | 'monitoring'
  | 'completed'
  | 'scaled'
  | 'sustained'
  | 'cancelled'
  | 'failed';

export interface ImpactAnalytics {
  metrics: ImpactMetricAnalytics[];
  trends: ImpactTrend[];
  comparisons: ImpactComparison[];
  predictions: ImpactPrediction[];
  insights: ImpactInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface ImpactMetricAnalytics {
  metric_id: string;
  current_value: number;
  target_value: number;
  baseline_value: number;
  progress: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  variance: number; // percentage
  confidence: number; // 0-100
  last_updated: Date;
}

export interface ImpactTrend {
  metric: string;
  period: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number; // percentage
  significance: number; // 0-100
  factors: TrendFactor[];
}

export interface TrendFactor {
  factor: string;
  influence: number; // 0-100
  description: string;
  evidence: string[];
}

export interface ImpactComparison {
  comparison_type: ComparisonType;
  baseline: ComparisonBaseline;
  targets: ComparisonTarget[];
  results: ComparisonResult[];
  insights: ComparisonInsight[];
}

export type ComparisonType = 
  | 'before_after'
  | 'control_treatment'
  | 'benchmark'
  | 'peer_comparison'
  | 'industry_standard'
  | 'custom';

export interface ComparisonBaseline {
  name: string;
  description: string;
  date: Date;
  methodology: string;
  metrics: BaselineMetric[];
}

export interface ComparisonTarget {
  name: string;
  description: string;
  metrics: TargetMetric[];
  date: Date;
}

export interface ComparisonResult {
  metric: string;
  baseline_value: number;
  target_value: number;
  actual_value: number;
  difference: number; // percentage
  significance: boolean;
  confidence: number; // 0-100
}

export interface ComparisonInsight {
  category: 'positive' | 'negative' | 'neutral';
  description: string;
  impact: string;
  actionability: 'high' | 'medium' | 'low';
}

export interface ImpactPrediction {
  model: PredictionModel;
  timeframe: string;
  predictions: Prediction[];
  confidence: number; // 0-100
  assumptions: string[];
  limitations: string[];
}

export interface PredictionModel {
  name: string;
  type: ModelType;
  algorithm: string;
  accuracy: number; // 0-100
  training_data: TrainingData;
  validation: ModelValidation;
}

export type ModelType = 
  | 'regression'
  | 'classification'
  | 'time_series'
  | 'neural_network'
  | 'ensemble'
  | 'custom';

export interface TrainingData {
  source: string;
  size: number;
  period: string;
  features: string[];
  quality: number; // 0-100
}

export interface ModelValidation {
  method: string;
  results: ValidationResult[];
  cross_validation: boolean;
  test_set_performance: number; // 0-100
}

export interface Prediction {
  metric: string;
  predicted_value: number;
  confidence_interval: { lower: number; upper: number };
  probability: number; // 0-100
  date: Date;
}

export interface ImpactInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: InsightPriority;
  evidence: InsightEvidence[];
  recommendations: InsightRecommendation[];
  impact: InsightImpact;
  actionability: ActionabilityLevel;
  created_at: Date;
}

export type InsightCategory = 
  | 'performance'
  | 'efficiency'
  | 'risk'
  | 'opportunity'
  | 'trend'
  | 'anomaly'
  | 'correlation'
  | 'custom';

export type InsightPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface InsightEvidence {
  type: 'data' | 'analysis' | 'expert' | 'stakeholder' | 'custom';
  source: string;
  description: string;
  strength: number; // 0-100
  date: Date;
}

export interface InsightRecommendation {
  action: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeline: string;
  responsible_party: string;
  resources: string[];
  expected_outcome: string;
  success_metrics: string[];
}

export interface InsightImpact {
  potential_impact: number; // 0-100
  confidence: number; // 0-100
  time_to_realize: string;
  cost_benefit: number; // ratio
}

export type ActionabilityLevel = 
  | 'immediate'
  | 'short_term'
  | 'medium_term'
  | 'long_term'
  | 'strategic';

export interface AnalyticsRecommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  rationale: string;
  benefits: RecommendationBenefit[];
  costs: RecommendationCost[];
  implementation: ImplementationPlan;
  success_metrics: SuccessMetric[];
  risks: RecommendationRisk[];
}

export type RecommendationCategory = 
  | 'strategic'
  | 'operational'
  | 'tactical'
  | 'technical'
  | 'financial'
  | 'process'
  | 'custom';

export type RecommendationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface RecommendationBenefit {
  type: 'financial' | 'operational' | 'strategic' | 'social' | 'environmental' | 'custom';
  description: string;
  quantification: string;
  timeframe: string;
  confidence: number; // 0-100
}

export interface RecommendationCost {
  type: 'financial' | 'resource' | 'time' | 'opportunity' | 'custom';
  description: string;
  amount: number;
  currency: string;
  timeframe: string;
  certainty: number; // 0-100
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: string;
  resources: ImplementationResource[];
  dependencies: string[];
  milestones: ImplementationMilestone[];
}

export interface ImplementationPhase {
  name: string;
  description: string;
  duration: string;
  activities: string[];
  deliverables: string[];
  responsible_party: string;
  success_criteria: string[];
}

export interface ImplementationResource {
  type: 'personnel' | 'financial' | 'equipment' | 'technology' | 'custom';
  name: string;
  quantity: number;
  cost: number;
  availability: string;
}

export interface ImplementationMilestone {
  name: string;
  date: Date;
  description: string;
  deliverables: string[];
  verification: string;
}

export interface RecommendationRisk {
  type: 'implementation' | 'operational' | 'financial' | 'reputational' | 'custom';
  description: string;
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
}
