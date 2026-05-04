/**
 * Quantum Algorithms - Domain Types
 */

export interface QuantumAlgorithm {
  id: string;
  name: string;
  description: string;
  category: AlgorithmCategory;
  type: AlgorithmType;
  complexity: ComplexityLevel;
  implementation: QuantumImplementation;
  performance: AlgorithmPerformance;
  applications: AlgorithmApplication[];
  resources: AlgorithmResource[];
  documentation: AlgorithmDocumentation;
  testing: AlgorithmTesting;
  version: string;
  status: AlgorithmStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type AlgorithmCategory =
  | 'optimization'
  | 'search'
  | 'cryptography'
  | 'simulation'
  | 'machine_learning'
  | 'error_correction'
  | 'chemistry'
  | 'physics'
  | 'finance'
  | 'logistics'
  | 'data_analysis'
  | 'custom';

export type AlgorithmType =
  | 'variational_quantum_eigensolver'
  | 'quantum_approximate_optimization_algorithm'
  | 'quantum_fourier_transform'
  | 'shors_algorithm'
  | 'grovers_algorithm'
  | 'quantum_phase_estimation'
  | 'quantum_amplitude_estimation'
  | 'quantum_circuit_learning'
  | 'quantum_support_vector_machine'
  | 'quantum_neural_network'
  | 'quantum_boltzmann_machine'
  | 'quantum_walk'
  | 'quantum_metropolis'
  | 'quantum_monte_carlo'
  | 'quantum_dynamics_simulation'
  | 'quantum_chemistry'
  | 'quantum_error_correction'
  | 'surface_code'
  | 'stabilizer_code'
  | 'custom';

export interface ComplexityLevel {
  quantum_complexity: string; // e.g., O(√N), O(log N)
  classical_complexity: string; // e.g., O(N), O(N^2)
  quantum_advantage: 'exponential' | 'polynomial' | 'quadratic' | 'none';
  resource_requirements: ResourceRequirements;
  scalability: ScalabilityMetrics;
}

export interface ResourceRequirements {
  qubits: number;
  depth: number; // circuit depth
  gate_count: number;
  coherence_time: number; // seconds
  error_rate: number; // 0-1
  memory: number; // bytes
  classical_computation: ClassicalComputation;
}

export interface ClassicalComputation {
  pre_processing: number; // FLOPs
  post_processing: number; // FLOPs
  optimization: number; // FLOPs
  memory: number; // bytes
}

export interface ScalabilityMetrics {
  qubit_scaling: 'linear' | 'logarithmic' | 'polynomial' | 'exponential';
  depth_scaling: 'linear' | 'logarithmic' | 'polynomial' | 'exponential';
  error_tolerance: number; // 0-1
  parallelization: boolean;
  distributed: boolean;
}

export interface QuantumImplementation {
  circuit: QuantumCircuit;
  gates: QuantumGate[];
  measurements: QuantumMeasurement[];
  error_mitigation: ErrorMitigationStrategy[];
  optimization: CircuitOptimization;
  hardware_requirements: HardwareRequirements;
}

export interface QuantumCircuit {
  id: string;
  name: string;
  description: string;
  qubits: number;
  depth: number;
  gates: GateInstance[];
  measurements: MeasurementInstance[];
  parameters: CircuitParameters;
  visualization: CircuitVisualization;
}

export interface GateInstance {
  id: string;
  gate_type: string;
  qubits: number[];
  parameters: GateParameters;
  position: { layer: number; position: number };
  error_rate?: number;
  duration?: number; // nanoseconds
}

export interface GateParameters {
  rotation_angle?: number; // radians
  phase?: number; // radians
  amplitude?: number; // 0-1
  frequency?: number; // Hz
  duration?: number; // nanoseconds
  custom_params?: Record<string, any>;
}

export interface MeasurementInstance {
  id: string;
  qubits: number[];
  basis: MeasurementBasis;
  outcome?: MeasurementOutcome;
  timestamp?: Date;
  error_rate?: number;
}

export interface MeasurementBasis {
  type: 'computational' | 'hadamard' | 'x' | 'y' | 'z' | 'bell' | 'ghz' | 'custom';
  parameters?: Record<string, any>;
}

export interface MeasurementOutcome {
  result: string; // bit string
  probability: number; // 0-1
  confidence: number; // 0-1
  error_margin?: number;
}

export interface CircuitParameters {
  optimization_level: number; // 0-3
  error_correction: boolean;
  noise_model: NoiseModel;
  simulation_method: SimulationMethod;
  precision: number; // bits
}

export interface NoiseModel {
  type: 'depolarizing' | 'amplitude_damping' | 'phase_damping' | 'bit_flip' | 'phase_flip' | 'custom';
  parameters: NoiseParameters;
  correlation: NoiseCorrelation;
}

export interface NoiseParameters {
  error_rate: number; // 0-1
  coherence_time: number; // seconds
  gate_error: number; // 0-1
  readout_error: number; // 0-1
  custom_params?: Record<string, any>;
}

export interface NoiseCorrelation {
  spatial_correlation: boolean;
  temporal_correlation: boolean;
  correlation_length?: number; // qubits
  correlation_time?: number; // seconds
}

export interface SimulationMethod {
  type: 'state_vector' | 'density_matrix' | 'tensor_network' | 'stabilizer' | 'custom';
  precision: 'single' | 'double' | 'arbitrary';
  parallel: boolean;
  distributed: boolean;
}

export interface CircuitVisualization {
  layout: 'linear' | 'circular' | 'grid' | 'custom';
  style: VisualizationStyle;
  annotations: CircuitAnnotation[];
  export_formats: ExportFormat[];
}

export interface VisualizationStyle {
  color_scheme: string;
  gate_style: 'minimal' | 'detailed' | 'artistic';
  measurement_style: 'standard' | 'detailed';
  wire_style: 'straight' | 'curved' | 'orthogonal';
}

export interface CircuitAnnotation {
  type: 'label' | 'comment' | 'highlight' | 'group';
  content: string;
  position: { x: number; y: number };
  style: AnnotationStyle;
}

export interface AnnotationStyle {
  color: string;
  font_size: number;
  font_family: string;
  background_color?: string;
  border_color?: string;
}

export interface ExportFormat {
  format: 'svg' | 'png' | 'pdf' | 'qasm' | 'quil' | 'braket' | 'custom';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  options: Record<string, any>;
}

export interface QuantumGate {
  name: string;
  type: GateType;
  description: string;
  matrix: ComplexMatrix;
  parameters: GateParameterDefinition[];
  decomposition: GateDecomposition[];
  hardware_implementation: HardwareImplementation;
  error_model: GateErrorModel;
}

export type GateType =
  | 'single_qubit'
  | 'two_qubit'
  | 'multi_qubit'
  | 'measurement'
  | 'reset'
  | 'barrier'
  | 'custom';

export interface ComplexMatrix {
  rows: number;
  columns: number;
  elements: ComplexNumber[][];
}

export interface ComplexNumber {
  real: number;
  imaginary: number;
}

export interface GateParameterDefinition {
  name: string;
  type: 'angle' | 'amplitude' | 'phase' | 'frequency' | 'duration' | 'custom';
  range: { min: number; max: number };
  default_value: number;
  unit: string;
  description: string;
}

export interface GateDecomposition {
  target_gate: string;
  decomposition_gate: string[];
  parameters: DecompositionParameters;
  accuracy: number; // 0-1
  overhead: number; // factor
}

export interface DecompositionParameters {
  mapping: Record<string, number>;
  approximations: string[];
  constraints: string[];
}

export interface HardwareImplementation {
  supported_platforms: string[];
  native_gates: string[];
  implementation_time: number; // nanoseconds
  fidelity: number; // 0-1
  calibration_requirements: CalibrationRequirement[];
}

export interface CalibrationRequirement {
  parameter: string;
  target_value: number;
  tolerance: number;
  calibration_frequency: number; // hours
  method: string;
}

export interface GateErrorModel {
  type: 'coherent' | 'incoherent' | 'mixed';
  error_matrix: ComplexMatrix;
  error_rates: Record<string, number>;
  correlation_length: number; // qubits
}

export interface QuantumMeasurement {
  name: string;
  type: MeasurementType;
  description: string;
  basis: MeasurementBasis;
  outcomes: MeasurementOutcome[];
  fidelity: number; // 0-1
  error_model: MeasurementErrorModel;
}

export type MeasurementType =
  | 'projective'
  | 'weak'
  | 'quantum_non_demolition'
  | 'bell_measurement'
  | 'parity_measurement'
  | 'continuous'
  | 'custom';

export interface MeasurementErrorModel {
  readout_error: number; // 0-1
  assignment_error: number; // 0-1
  crosstalk: number; // 0-1
  dark_count_rate: number; // Hz
}

export interface ErrorMitigationStrategy {
  name: string;
  type: ErrorMitigationType;
  description: string;
  implementation: ErrorMitigationImplementation;
  effectiveness: number; // 0-1
  overhead: number; // factor
  applicability: string[];
}

export type ErrorMitigationType =
  | 'zero_noise_extrapolation'
  | 'probabilistic_error_cancellation'
  | 'subspace_expansion'
  | 'symmetry_verification'
  | 'error_mitigation_layer'
  | 'dynamical_decoupling'
  | 'custom';

export interface ErrorMitigationImplementation {
  parameters: ErrorMitigationParameters;
  circuit_modifications: CircuitModification[];
  classical_post_processing: ClassicalPostProcessing;
}

export interface ErrorMitigationParameters {
  noise_scale_factors: number[];
  extrapolation_method: 'linear' | 'polynomial' | 'richardson' | 'custom';
  subspace_basis: string[];
  symmetry_operators: string[];
}

export interface CircuitModification {
  type: 'gate_insertion' | 'gate_replacement' | 'circuit_padding' | 'custom';
  description: string;
  gates: GateInstance[];
  impact: number; // 0-1
}

export interface ClassicalPostProcessing {
  algorithm: string;
  complexity: string;
  memory_requirement: number; // bytes
  accuracy: number; // 0-1
}

export interface CircuitOptimization {
  level: number; // 0-3
  techniques: OptimizationTechnique[];
  results: OptimizationResult[];
  tradeoffs: OptimizationTradeoff[];
}

export interface OptimizationTechnique {
  name: string;
  type: OptimizationType;
  description: string;
  applicable_gates: string[];
  effectiveness: number; // 0-1
}

export type OptimizationType =
  | 'gate_cancellation'
  | 'gate_fusion'
  | 'gate_reordering'
  | 'gate_approximation'
  | 'circuit_cutting'
  | 'qubit_mapping'
  | 'routing'
  | 'custom';

export interface OptimizationResult {
  technique: string;
  original_metrics: CircuitMetrics;
  optimized_metrics: CircuitMetrics;
  improvement: number; // percentage
  side_effects: string[];
}

export interface CircuitMetrics {
  gate_count: number;
  depth: number;
  two_qubit_gate_count: number;
  fidelity: number; // 0-1
  execution_time: number; // nanoseconds
}

export interface OptimizationTradeoff {
  metric1: string;
  metric2: string;
  tradeoff_curve: TradeoffPoint[];
  pareto_optimal: boolean;
}

export interface TradeoffPoint {
  metric1_value: number;
  metric2_value: number;
  technique: string;
  feasibility: boolean;
}

export interface HardwareRequirements {
  qubit_topology: QubitTopology;
  gate_set: string[];
  coherence_times: CoherenceTimes;
  gate_times: GateTimes;
  connectivity: ConnectivityMatrix;
  error_rates: ErrorRates;
  control_system: ControlSystemRequirements;
}

export interface QubitTopology {
  type: 'linear' | 'ring' | 'grid' | 'all_to_all' | 'custom';
  dimensions: number;
  connectivity: number; // average connections per qubit
  layout: QubitLayout[];
}

export interface QubitLayout {
  qubit_id: number;
  position: { x: number; y: number; z?: number };
  neighbors: number[];
  quality: number; // 0-1
}

export interface ConnectivityMatrix {
  matrix: number[][];
  max_distance: number;
  average_distance: number;
  diameter: number;
}

export interface CoherenceTimes {
  t1: number; // seconds
  t2: number; // seconds
  t2_star: number; // seconds
  variation: number; // percentage
}

export interface GateTimes {
  single_qubit: number; // nanoseconds
  two_qubit: number; // nanoseconds
  measurement: number; // nanoseconds
  reset: number; // nanoseconds
  variation: number; // percentage
}

export interface ErrorRates {
  single_qubit: number; // 0-1
  two_qubit: number; // 0-1
  measurement: number; // 0-1
  readout: number; // 0-1
  leakage: number; // 0-1
  crosstalk: number; // 0-1
}

export interface ControlSystemRequirements {
  latency: number; // nanoseconds
  bandwidth: number; // Hz
  precision: number; // bits
  synchronization: number; // nanoseconds
  calibration_overhead: number; // percentage
}

export interface AlgorithmPerformance {
  theoretical: TheoreticalPerformance;
  experimental: ExperimentalPerformance;
  benchmarks: BenchmarkResult[];
  comparisons: PerformanceComparison[];
  scalability: ScalabilityAnalysis;
}

export interface TheoreticalPerformance {
  time_complexity: string;
  space_complexity: string;
  quantum_advantage: number; // factor
  success_probability: number; // 0-1
  accuracy: number; // 0-1
  assumptions: string[];
}

export interface ExperimentalPerformance {
  success_rate: number; // 0-1
  fidelity: number; // 0-1
  execution_time: number; // seconds
  resource_usage: ResourceUsage;
  error_rates: ExperimentalErrorRates;
  reproducibility: number; // 0-1
}

export interface ResourceUsage {
  qubits_used: number;
  gate_operations: number;
  measurement_operations: number;
  classical_computation: number; // FLOPs
  memory_usage: number; // bytes
  energy_consumption: number; // Joules
}

export interface ExperimentalErrorRates {
  gate_error: number; // 0-1
  readout_error: number; // 0-1
  decoherence_error: number; // 0-1
  crosstalk_error: number; // 0-1
  total_error: number; // 0-1
}

export interface BenchmarkResult {
  name: string;
  problem_size: number;
  quantum_result: BenchmarkMetric;
  classical_result: BenchmarkMetric;
  speedup: number; // factor
  accuracy: number; // 0-1
  confidence: number; // 0-1
  date: Date;
}

export interface BenchmarkMetric {
  execution_time: number; // seconds
  memory_usage: number; // bytes
  accuracy: number; // 0-1
  energy_usage: number; // Joules
}

export interface PerformanceComparison {
  algorithm: string;
  metrics: ComparisonMetric[];
  winner: string;
  significance: number; // p-value
  conditions: ComparisonConditions;
}

export interface ComparisonMetric {
  name: string;
  quantum_value: number;
  classical_value: number;
  improvement: number; // percentage
  statistical_significance: boolean;
}

export interface ComparisonConditions {
  problem_size: number;
  hardware: string;
  noise_level: number;
  optimization_level: number;
}

export interface ScalabilityAnalysis {
  scaling_law: ScalingLaw;
  practical_limits: PracticalLimit[];
  bottlenecks: Bottleneck[];
  future_projections: FutureProjection[];
}

export interface ScalingLaw {
  type: 'polynomial' | 'exponential' | 'logarithmic' | 'custom';
  formula: string;
  parameters: ScalingParameter[];
  validity_range: { min: number; max: number };
  confidence: number; // 0-1
}

export interface ScalingParameter {
  name: string;
  value: number;
  error: number;
  unit: string;
}

export interface PracticalLimit {
  resource: string;
  limit: number;
  unit: string;
  reason: string;
  mitigation: string[];
}

export interface Bottleneck {
  type: 'hardware' | 'algorithm' | 'noise' | 'classical' | 'custom';
  description: string;
  impact: number; // 0-1
  solutions: string[];
}

export interface FutureProjection {
  year: number;
  expected_performance: number;
  assumptions: string[];
  confidence: number; // 0-1
}

export interface AlgorithmApplication {
  id: string;
  domain: ApplicationDomain;
  problem: ProblemDefinition;
  implementation: ApplicationImplementation;
  results: ApplicationResult[];
  case_studies: CaseStudy[];
}

export type ApplicationDomain =
  | 'chemistry'
  | 'materials_science'
  | 'finance'
  | 'logistics'
  | 'machine_learning'
  | 'cryptography'
  | 'drug_discovery'
  | 'climate_modeling'
  | 'supply_chain'
  | 'telecommunications'
  | 'custom';

export interface ProblemDefinition {
  name: string;
  description: string;
  complexity: 'P' | 'NP' | 'NP-hard' | 'NP-complete' | 'PSPACE' | 'BQP' | 'custom';
  size: ProblemSize;
  constraints: ProblemConstraint[];
  objectives: ProblemObjective[];
}

export interface ProblemSize {
  input_size: number;
  parameter_count: number;
  degrees_of_freedom: number;
  memory_requirement: number; // bytes
}

export interface ProblemConstraint {
  type: 'hard' | 'soft';
  description: string;
  mathematical_formulation: string;
  tolerance: number;
}

export interface ProblemObjective {
  name: string;
  type: 'minimize' | 'maximize' | 'achieve';
  target_value?: number;
  tolerance?: number;
  priority: number;
}

export interface ApplicationImplementation {
  algorithm_mapping: AlgorithmMapping;
  data_encoding: DataEncoding;
  classical_interface: ClassicalInterface;
  integration: IntegrationDetails;
}

export interface AlgorithmMapping {
  problem_to_algorithm: string;
  parameter_mapping: ParameterMapping[];
  approximation_methods: ApproximationMethod[];
}

export interface ParameterMapping {
  problem_parameter: string;
  algorithm_parameter: string;
  transformation: string;
  accuracy: number; // 0-1
}

export interface ApproximationMethod {
  name: string;
  type: 'trotter' | 'variational' | 'sampling' | 'custom';
  accuracy: number; // 0-1
  overhead: number; // factor
}

export interface DataEncoding {
  scheme: EncodingScheme;
  qubit_requirement: number;
  encoding_circuit: QuantumCircuit;
  fidelity: number; // 0-1
}

export type EncodingScheme =
  | 'binary'
  | 'amplitude'
  | 'phase'
  | 'basis'
  | 'dense'
  | 'sparse'
  | 'custom';

export interface ClassicalInterface {
  pre_processing: ClassicalProcessing;
  post_processing: ClassicalProcessing;
  data_format: DataFormat;
  api: ClassicalAPI;
}

export interface ClassicalProcessing {
  algorithm: string;
  complexity: string;
  memory: number; // bytes
  parallelizable: boolean;
}

export interface DataFormat {
  input_format: string;
  output_format: string;
  conversion_overhead: number; // factor
  validation: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  error_message: string;
}

export interface ClassicalAPI {
  endpoint: string;
  authentication: AuthenticationMethod;
  rate_limit: RateLimit;
  data_schema: DataSchema;
}

export interface AuthenticationMethod {
  type: 'api_key' | 'oauth' | 'jwt' | 'custom';
  parameters: Record<string, any>;
}

export interface RateLimit {
  requests_per_second: number;
  burst_limit: number;
  cooldown: number; // seconds
}

export interface DataSchema {
  version: string;
  fields: SchemaField[];
  validation: ValidationRule[];
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface IntegrationDetails {
  deployment: DeploymentDetails;
  monitoring: MonitoringDetails;
  maintenance: MaintenanceDetails;
}

export interface DeploymentDetails {
  platform: string;
  requirements: DeploymentRequirement[];
  configuration: DeploymentConfiguration;
}

export interface DeploymentRequirement {
  type: 'hardware' | 'software' | 'network' | 'custom';
  description: string;
  specifications: Record<string, any>;
}

export interface DeploymentConfiguration {
  environment_variables: Record<string, string>;
  resource_limits: ResourceLimits;
  scaling_policy: ScalingPolicy;
}

export interface ResourceLimits {
  cpu: number; // cores
  memory: number; // GB
  storage: number; // GB
  network: number; // Mbps
}

export interface ScalingPolicy {
  min_instances: number;
  max_instances: number;
  target_cpu: number; // percentage
  target_memory: number; // percentage
}

export interface MonitoringDetails {
  metrics: MonitoringMetric[];
  alerts: MonitoringAlert[];
  dashboards: MonitoringDashboard[];
}

export interface MonitoringMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'custom';
  description: string;
  unit: string;
  thresholds: MetricThreshold[];
}

export interface MetricThreshold {
  type: 'warning' | 'critical';
  value: number;
  operator: 'greater_than' | 'less_than' | 'equals';
}

export interface MonitoringAlert {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'custom';
  configuration: Record<string, any>;
}

export interface MonitoringDashboard {
  name: string;
  description: string;
  charts: DashboardChart[];
  refresh_interval: number; // seconds
}

export interface DashboardChart {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'custom';
  metrics: string[];
  time_range: string;
}

export interface MaintenanceDetails {
  schedule: MaintenanceSchedule;
  procedures: MaintenanceProcedure[];
  backup: BackupPolicy;
}

export interface TimeRange {
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface MaintenanceSchedule {
  frequency: string;
  duration: number; // hours
  window: TimeRange;
  notifications: MaintenanceNotification[];
}

export interface MaintenanceNotification {
  type: 'email' | 'sms' | 'slack' | 'custom';
  recipients: string[];
  message_template: string;
  timing: 'before' | 'during' | 'after';
}

export interface MaintenanceProcedure {
  name: string;
  description: string;
  steps: ProcedureStep[];
  estimated_duration: number; // minutes
  risk_level: 'low' | 'medium' | 'high';
}

export interface ProcedureStep {
  step: number;
  description: string;
  commands: string[];
  verification: VerificationStep[];
  rollback: RollbackStep[];
}

export interface VerificationStep {
  description: string;
  command: string;
  expected_result: string;
  timeout: number; // seconds
}

export interface RollbackStep {
  description: string;
  command: string;
  conditions: string[];
}

export interface BackupPolicy {
  frequency: string;
  retention: number; // days
  storage: BackupStorage;
  encryption: boolean;
}

export interface BackupStorage {
  type: 'local' | 'cloud' | 'hybrid';
  location: string;
  capacity: number; // GB
  redundancy: number; // copies
}

export interface ApplicationResult {
  id: string;
  problem_instance: string;
  quantum_solution: SolutionResult;
  classical_solution: SolutionResult;
  comparison: SolutionComparison;
  metadata: ResultMetadata;
  timestamp: Date;
}

export interface SolutionResult {
  value: any;
  accuracy: number; // 0-1
  confidence: number; // 0-1
  execution_time: number; // seconds
  resource_usage: ResourceUsage;
  quality_metrics: QualityMetric[];
}

export interface QualityMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  tolerance: number;
}

export interface SolutionComparison {
  quantum_advantage: number; // factor
  accuracy_difference: number; // percentage
  speedup: number; // factor
  efficiency: number; // 0-1
  statistical_significance: number; // p-value
}

export interface ResultMetadata {
  algorithm_version: string;
  hardware_platform: string;
  noise_model: string;
  optimization_level: number;
  random_seed: number;
  repeatability: number; // 0-1
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  domain: ApplicationDomain;
  problem: ProblemDefinition;
  implementation: ApplicationImplementation;
  results: ApplicationResult[];
  lessons_learned: Lesson[];
  references: Reference[];
  date: Date;
}

export interface Lesson {
  category: 'success' | 'failure' | 'challenge' | 'insight';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  applicability: string[];
}

export interface Reference {
  type: 'paper' | 'book' | 'website' | 'code' | 'custom';
  title: string;
  authors: string[];
  venue: string;
  year: number;
  url?: string;
  doi?: string;
}

export interface AlgorithmResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  content: ResourceContent;
  metadata: ResourceMetadata;
  access: ResourceAccess;
}

export type ResourceType =
  | 'documentation'
  | 'tutorial'
  | 'code_example'
  | 'benchmark'
  | 'dataset'
  | 'simulation'
  | 'tool'
  | 'library'
  | 'paper'
  | 'presentation'
  | 'custom';

export interface ResourceContent {
  format: string;
  size: number; // bytes
  content: string;
  preview?: string;
  download_url?: string;
}

export interface ResourceMetadata {
  author: string;
  created_at: Date;
  updated_at: Date;
  version: string;
  tags: string[];
  language: string;
  license: string;
}

export interface ResourceAccess {
  public: boolean;
  permissions: ResourcePermission[];
  authentication: boolean;
  rate_limit?: RateLimit;
}

export interface ResourcePermission {
  user: string;
  role: 'viewer' | 'editor' | 'admin';
  granted_at: Date;
  expires_at?: Date;
}

export interface AlgorithmDocumentation {
  overview: DocumentationSection;
  theory: DocumentationSection;
  implementation: DocumentationSection;
  examples: DocumentationSection;
  references: DocumentationSection;
  api: APIDocumentation;
}

export interface DocumentationSection {
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'latex' | 'custom';
  last_updated: Date;
  contributors: string[];
}

export interface APIDocumentation {
  version: string;
  endpoints: APIEndpoint[];
  schemas: DataSchema[];
  examples: APIExample[];
}

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: APIParameter[];
  responses: APIResponse[];
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default_value?: any;
}

export interface APIResponse {
  status_code: number;
  description: string;
  schema: DataSchema;
  example?: any;
}

export interface APIExample {
  name: string;
  description: string;
  request: APIRequest;
  response: APIResponse;
}

export interface APIRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
}

export interface AlgorithmTesting {
  unit_tests: UnitTestSuite[];
  integration_tests: IntegrationTestSuite[];
  benchmark_tests: BenchmarkTestSuite[];
  validation_tests: ValidationTestSuite[];
  test_coverage: TestCoverage;
}

export interface UnitTestSuite {
  name: string;
  tests: UnitTest[];
  coverage: number; // 0-1
  last_run: Date;
  status: TestStatus;
}

export interface UnitTest {
  name: string;
  description: string;
  setup: TestSetup;
  execution: TestExecution;
  assertions: TestAssertion[];
  cleanup: TestCleanup;
}

export interface TestSetup {
  preconditions: string[];
  data: TestData[];
  environment: TestEnvironment;
}

export interface TestData {
  name: string;
  type: string;
  value: any;
}

export interface TestEnvironment {
  variables: Record<string, string>;
  configuration: Record<string, any>;
}

export interface TestExecution {
  steps: TestStep[];
  timeout: number; // seconds
  retries: number;
}

export interface TestStep {
  action: string;
  expected_result: string;
  timeout: number; // seconds
}

export interface TestAssertion {
  type: 'equality' | 'inequality' | 'truthy' | 'falsy' | 'custom';
  actual: string;
  expected: string;
  tolerance?: number;
}

export interface TestCleanup {
  actions: string[];
  verification: string[];
}

export interface IntegrationTestSuite {
  name: string;
  tests: IntegrationTest[];
  dependencies: TestDependency[];
  last_run: Date;
  status: TestStatus;
}

export interface IntegrationTest {
  name: string;
  description: string;
  components: TestComponent[];
  scenarios: TestScenario[];
  expected_outcomes: ExpectedOutcome[];
}

export interface TestDependency {
  component: string;
  version: string;
  type: 'hardware' | 'software' | 'service' | 'custom';
}

export interface TestComponent {
  name: string;
  type: 'quantum' | 'classical' | 'hybrid';
  configuration: Record<string, any>;
}

export interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
  data: TestData[];
}

export interface ExpectedOutcome {
  metric: string;
  value: any;
  tolerance: number;
}

export interface BenchmarkTestSuite {
  name: string;
  benchmarks: BenchmarkTest[];
  reference_data: ReferenceData[];
  last_run: Date;
  status: TestStatus;
}

export interface BenchmarkTest {
  name: string;
  algorithm: string;
  problem_sizes: number[];
  reference_implementations: ReferenceImplementation[];
  metrics: BenchmarkMetric[];
}

export interface ReferenceImplementation {
  name: string;
  type: 'quantum' | 'classical';
  implementation: string;
  version: string;
}

export interface ReferenceData {
  problem_size: number;
  results: BenchmarkResult[];
  source: string;
  date: Date;
}

export interface ValidationTestSuite {
  name: string;
  tests: ValidationTest[];
  criteria: ValidationCriteria[];
  last_run: Date;
  status: TestStatus;
}

export interface ValidationTest {
  name: string;
  description: string;
  validation_type: ValidationType;
  test_cases: ValidationTestCase[];
}

export type ValidationType =
  | 'correctness'
  | 'accuracy'
  | 'performance'
  | 'scalability'
  | 'robustness'
  | 'security'
  | 'custom';

export interface ValidationCriteria {
  name: string;
  type: ValidationType;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  description: string;
}

export interface ValidationTestCase {
  name: string;
  input: any;
  expected_output: any;
  tolerance: number;
  description: string;
}

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'running' | 'pending';

export interface TestCoverage {
  lines: number; // 0-1
  branches: number; // 0-1
  functions: number; // 0-1
  statements: number; // 0-1
  uncovered_areas: string[];
}

export type AlgorithmStatus =
  | 'development'
  | 'testing'
  | 'validation'
  | 'production'
  | 'deprecated'
  | 'experimental'
  | 'theoretical';
