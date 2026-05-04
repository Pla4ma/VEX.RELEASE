/**
 * Biometric Optimization - Domain Types
 */

export interface BiometricProfile {
  id: string;
  userId: string;
  name: string;
  biometrics: BiometricData;
  health_metrics: HealthMetrics;
  performance_metrics: PerformanceMetrics;
  optimization_goals: OptimizationGoal[];
  baselines: BiometricBaseline[];
  alerts: BiometricAlert[];
  recommendations: BiometricRecommendation[];
  privacy: PrivacySettings;
  devices: ConnectedDevice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BiometricData {
  heart_rate: HeartRateData;
  heart_rate_variability: HRVData;
  blood_pressure: BloodPressureData;
  oxygen_saturation: OxygenSaturationData;
  body_temperature: TemperatureData;
  galvanic_skin_response: GSRData;
  eeg: EEGData;
  emg: EMGData;
  eye_tracking: EyeTrackingData;
  facial_expressions: FacialExpressionData;
  voice_biomarkers: VoiceBiomarkerData;
  sleep_patterns: SleepPatternData;
  activity_levels: ActivityLevelData;
  stress_indicators: StressIndicatorData;
}

export interface HeartRateData {
  current: number; // bpm
  resting: number; // bpm
  maximum: number; // bpm
  target_zones: HeartRateZone[];
  variability: number; // ms
  rhythm: 'regular' | 'irregular' | 'arrhythmia';
  readings: HeartRateReading[];
  last_updated: Date;
}

export interface HeartRateZone {
  name: string;
  min_percentage: number; // % of max HR
  max_percentage: number; // % of max HR
  purpose: string;
  color: string;
}

export interface HeartRateReading {
  timestamp: Date;
  value: number; // bpm
  quality: number; // 0-100 signal quality
  context: ReadingContext;
  anomalies: string[];
}

export interface ReadingContext {
  activity: string;
  position: 'standing' | 'sitting' | 'lying' | 'walking' | 'running';
  environment: string;
  stress_level: number; // 0-100
  caffeine_intake?: number; // mg
  medication?: string[];
}

export interface HRVData {
  rmssd: number; // ms
  sdnn: number; // ms
  pnn50: number; // percentage
  stress_index: number; // 0-100
  recovery_time: number; // minutes
  circadian_pattern: CircadianPattern;
  readings: HRVReading[];
  last_updated: Date;
}

export interface HRVReading {
  timestamp: Date;
  rmssd: number; // ms
  sdnn: number; // ms
  pnn50: number; // percentage
  quality: number; // 0-100
  context: ReadingContext;
}

export interface CircadianPattern {
  peak_times: TimeRange[];
  low_times: TimeRange[];
  trend: 'increasing' | 'stable' | 'decreasing';
  consistency: number; // 0-100
}

export interface TimeRange {
  start: string; // HH:MM
  end: string; // HH:MM
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

export interface BloodPressureData {
  systolic: number; // mmHg
  diastolic: number; // mmHg
  mean_arterial: number; // mmHg
  pulse_pressure: number; // mmHg
  classification: 'normal' | 'elevated' | 'hypertension_stage_1' | 'hypertension_stage_2' | 'hypertensive_crisis';
  readings: BloodPressureReading[];
  last_updated: Date;
}

export interface BloodPressureReading {
  timestamp: Date;
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heart_rate: number; // bpm
  position: 'sitting' | 'standing' | 'lying';
  arm: 'left' | 'right';
  device: string;
  quality: number; // 0-100
}

export interface OxygenSaturationData {
  current: number; // % SpO2
  baseline: number; // % SpO2
  trend: 'stable' | 'improving' | 'declining';
  readings: OxygenSaturationReading[];
  alerts: OxygenAlert[];
  last_updated: Date;
}

export interface OxygenSaturationReading {
  timestamp: Date;
  value: number; // % SpO2
  pulse_rate: number; // bpm
  perfusion_index: number; // 0-100
  quality: number; // 0-100
  context: ReadingContext;
}

export interface OxygenAlert {
  threshold: number; // % SpO2
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // seconds
  triggered_at: Date;
  resolved_at?: Date;
}

export interface TemperatureData {
  current: number; // Celsius
  baseline: number; // Celsius
  trend: 'stable' | 'rising' | 'falling';
  readings: TemperatureReading[];
  last_updated: Date;
}

export interface TemperatureReading {
  timestamp: Date;
  value: number; // Celsius
  method: 'oral' | 'tympanic' | 'temporal' | 'axillary' | 'skin';
  location: string;
  quality: number; // 0-100
}

export interface GSRData {
  current: number; // microsiemens
  baseline: number; // microsiemens
  peaks: GSREvent[];
  trend: 'stable' | 'increasing' | 'decreasing';
  readings: GSRReading[];
  last_updated: Date;
}

export interface GSREvent {
  timestamp: Date;
  amplitude: number; // microsiemens
  duration: number; // seconds
  trigger: 'stress' | 'excitement' | 'startle' | 'emotion' | 'unknown';
  context: ReadingContext;
}

export interface GSRReading {
  timestamp: Date;
  value: number; // microsiemens
  quality: number; // 0-100
  context: ReadingContext;
}

export interface EEGData {
  brainwaves: BrainwaveData;
  patterns: BrainPattern[];
  focus_level: number; // 0-100
  relaxation_level: number; // 0-100
  cognitive_load: number; // 0-100
  readings: EEGReading[];
  last_updated: Date;
}

export interface BrainwaveData {
  delta: number; // 0.5-4 Hz
  theta: number; // 4-8 Hz
  alpha: number; // 8-12 Hz
  beta: number; // 12-30 Hz
  gamma: number; // 30-100 Hz
  coherence: number; // 0-100
  asymmetry: BrainwaveAsymmetry;
}

export interface BrainwaveAsymmetry {
  frontal: number; // -100 to 100
  temporal: number; // -100 to 100
  parietal: number; // -100 to 100
  occipital: number; // -100 to 100
}

export interface BrainPattern {
  id: string;
  name: string;
  type: 'focus' | 'relaxation' | 'creativity' | 'meditation' | 'stress' | 'sleep';
  detection: PatternDetection;
  characteristics: PatternCharacteristics;
  recommendations: string[];
}

export interface PatternDetection {
  confidence: number; // 0-100
  start_time: Date;
  duration: number; // seconds
  intensity: number; // 0-100
  triggers: string[];
}

export interface PatternCharacteristics {
  dominant_frequencies: FrequencyBand[];
  coherence_pattern: string;
  spatial_distribution: string;
  temporal_stability: number; // 0-100
}

export interface FrequencyBand {
  frequency: number; // Hz
  power: number; // relative power
  phase: number; // degrees
}

export interface EEGReading {
  timestamp: Date;
  channels: EEGChannel[];
  quality: number; // 0-100
  artifacts: Artifact[];
}

export interface EEGChannel {
  name: string;
  location: string;
  frequencies: BrainwaveData;
  signal_quality: number; // 0-100
}

export interface Artifact {
  type: 'eye_blink' | 'muscle' | 'movement' | 'electrode' | 'environmental';
  severity: 'low' | 'medium' | 'high';
  affected_channels: string[];
  duration: number; // seconds
}

export interface EMGData {
  muscle_activity: MuscleActivityData;
  fatigue_level: number; // 0-100
  tension_level: number; // 0-100
  readings: EMGReading[];
  last_updated: Date;
}

export interface MuscleActivityData {
  current: number; // microvolts
  baseline: number; // microvolts
  peak: number; // microvolts
  average: number; // microvolts
  muscles: MuscleData[];
}

export interface MuscleData {
  name: string;
  location: string;
  activity: number; // microvolts
  fatigue: number; // 0-100
  activation_pattern: ActivationPattern[];
}

export interface ActivationPattern {
  start_time: Date;
  duration: number; // seconds
  intensity: number; // 0-100
  purpose: string;
}

export interface EMGReading {
  timestamp: Date;
  muscles: MuscleReading[];
  quality: number; // 0-100
  context: ReadingContext;
}

export interface MuscleReading {
  muscle: string;
  activity: number; // microvolts
  fatigue: number; // 0-100
  quality: number; // 0-100
}

export interface EyeTrackingData {
  gaze: GazeData;
  pupil_dilation: PupilDilationData;
  blink_pattern: BlinkPatternData;
  saccades: SaccadeData;
  fixations: FixationData;
  readings: EyeTrackingReading[];
  last_updated: Date;
}

export interface GazeData {
  current_position: Point2D;
  accuracy: number; // degrees
  precision: number; // degrees
  latency: number; // ms
  tracking_quality: number; // 0-100
  heatmap: GazeHeatmap;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface GazeHeatmap {
  resolution: Vector2;
  data: number[][];
  intensity_scale: number;
  duration: number; // seconds
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface PupilDilationData {
  left_diameter: number; // mm
  right_diameter: number; // mm
  average_diameter: number; // mm
  baseline_diameter: number; // mm
  dilation_events: DilationEvent[];
  trend: 'stable' | 'dilating' | 'constricting';
}

export interface DilationEvent {
  timestamp: Date;
  amplitude: number; // mm
  duration: number; // ms
  trigger: 'light' | 'emotion' | 'cognitive' | 'arousal' | 'unknown';
  context: ReadingContext;
}

export interface BlinkPatternData {
  blink_rate: number; // blinks per minute
  average_duration: number; // ms
  complete_blinks: number;
  incomplete_blinks: number;
  blink_events: BlinkEvent[];
  fatigue_indicators: FatigueIndicator[];
}

export interface BlinkEvent {
  timestamp: Date;
  duration: number; // ms
  completeness: number; // 0-100
  amplitude: number; // 0-100
  context: ReadingContext;
}

export interface FatigueIndicator {
  type: 'increased_blink_duration' | 'decreased_blink_rate' | 'incomplete_blinks' | 'droopy_eyelids';
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  detected_at: Date;
}

export interface SaccadeData {
  saccade_rate: number; // per second
  average_velocity: number; // degrees/second
  average_amplitude: number; // degrees
  saccade_events: SaccadeEvent[];
  reading_patterns: ReadingPattern[];
}

export interface SaccadeEvent {
  timestamp: Date;
  start_position: Point2D;
  end_position: Point2D;
  amplitude: number; // degrees
  velocity: number; // degrees/second
  duration: number; // ms
  type: 'regular' | 'express' | 'search' | 'reading';
}

export interface ReadingPattern {
  type: 'linear' | 'scanning' | 'skimming' | 'deep_reading';
  efficiency: number; // 0-100
  comprehension_estimate: number; // 0-100
  reading_speed: number; // words per minute
}

export interface FixationData {
  fixation_rate: number; // per second
  average_duration: number; // ms
  fixation_events: FixationEvent[];
  areas_of_interest: AreaOfInterest[];
}

export interface FixationEvent {
  timestamp: Date;
  position: Point2D;
  duration: number; // ms
  dispersion: number; // degrees
  saccade_latency: number; // ms
}

export interface AreaOfInterest {
  id: string;
  name: string;
  bounds: Rectangle;
  fixation_count: number;
  total_duration: number; // ms
  average_duration: number; // ms
  importance_score: number; // 0-100
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EyeTrackingReading {
  timestamp: Date;
  gaze: GazeData;
  pupil_dilation: PupilDilationData;
  blink?: BlinkEvent;
  saccade?: SaccadeEvent;
  fixation?: FixationEvent;
  quality: number; // 0-100
  context: ReadingContext;
}

export interface FacialExpressionData {
  current_emotion: EmotionState;
  emotion_history: EmotionEvent[];
  facial_action_units: FacialActionUnit[];
  expression_intensity: number; // 0-100
  valence: number; // -100 to 100
  arousal: number; // 0-100
  readings: FacialExpressionReading[];
  last_updated: Date;
}

export interface EmotionState {
  primary: Emotion;
  secondary?: Emotion;
  confidence: number; // 0-100
  intensity: number; // 0-100
  stability: number; // 0-100
  duration: number; // seconds
}

export interface Emotion {
  name: string;
  category: 'positive' | 'negative' | 'neutral';
  valence: number; // -100 to 100
  arousal: number; // 0-100
}

export interface EmotionEvent {
  timestamp: Date;
  emotion: Emotion;
  intensity: number; // 0-100
  confidence: number; // 0-100
  duration: number; // seconds
  triggers: string[];
  context: ReadingContext;
}

export interface FacialActionUnit {
  code: string; // FACS code
  name: string;
  intensity: number; // 0-100
  presence: boolean;
  side: 'left' | 'right' | 'both';
}

export interface FacialExpressionReading {
  timestamp: Date;
  emotions: EmotionDetection[];
  action_units: FacialActionUnit[];
  valence: number; // -100 to 100
  arousal: number; // 0-100
  quality: number; // 0-100
  context: ReadingContext;
}

export interface EmotionDetection {
  emotion: Emotion;
  confidence: number; // 0-100
  method: 'facial' | 'voice' | 'physiological' | 'multimodal';
}

export interface VoiceBiomarkerData {
  vocal_characteristics: VocalCharacteristics;
  emotional_indicators: EmotionalIndicators;
  stress_markers: StressMarker[];
  health_indicators: HealthIndicator[];
  recordings: VoiceRecording[];
  last_updated: Date;
}

export interface VocalCharacteristics {
  pitch: PitchData;
  volume: VolumeData;
  tempo: TempoData;
  timbre: TimbreData;
  clarity: ClarityData;
}

export interface PitchData {
  current: number; // Hz
  baseline: number; // Hz
  range: number; // Hz
  variability: number; // Hz
  trend: 'stable' | 'rising' | 'falling' | 'variable';
}

export interface VolumeData {
  current: number; // dB
  baseline: number; // dB
  range: number; // dB
  consistency: number; // 0-100
}

export interface TempoData {
  speech_rate: number; // words per minute
  pause_frequency: number; // per minute
  pause_duration: number; // average ms
  rhythm_regularity: number; // 0-100
}

export interface TimbreData {
  brightness: number; // 0-100
  warmth: number; // 0-100
  nasality: number; // 0-100
  breathiness: number; // 0-100
}

export interface ClarityData {
  articulation: number; // 0-100
  enunciation: number; // 0-100
  pronunciation_accuracy: number; // 0-100
}

export interface EmotionalIndicators {
  current_emotion: EmotionState;
  emotion_stability: number; // 0-100
  emotional_range: number; // 0-100
  expressiveness: number; // 0-100
}

export interface StressMarker {
  type: 'vocal_tension' | 'breathing_irregularity' | 'pitch_variation' | 'tempo_changes' | 'volume_fluctuation';
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  detected_at: Date;
}

export interface HealthIndicator {
  type: 'vocal_fatigue' | 'respiratory_issues' | 'neurological_conditions' | 'psychological_state';
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  description: string;
  detected_at: Date;
}

export interface VoiceRecording {
  id: string;
  timestamp: Date;
  duration: number; // seconds
  sample_rate: number; // Hz
  bit_depth: number; // bits
  format: string;
  quality: number; // 0-100
  context: RecordingContext;
  analysis: VoiceAnalysis;
}

export interface RecordingContext {
  environment: string;
  background_noise: number; // dB
  microphone_type: string;
  distance: number; // cm
  purpose: string;
}

export interface VoiceAnalysis {
  emotions: EmotionDetection[];
  stress_level: number; // 0-100
  energy_level: number; // 0-100
  confidence_level: number; // 0-100
  biomarkers: VoiceBiomarker[];
}

export interface VoiceBiomarker {
  name: string;
  value: number;
  unit: string;
  normal_range: { min: number; max: number };
  significance: string;
}

export interface SleepPatternData {
  sleep_stages: SleepStageData;
  sleep_quality: SleepQuality;
  sleep_schedule: SleepSchedule;
  sleep_environment: SleepEnvironment;
  sleep_sessions: SleepSession[];
  last_updated: Date;
}

export interface SleepStageData {
  deep_sleep: SleepStageMetrics;
  light_sleep: SleepStageMetrics;
  rem_sleep: SleepStageMetrics;
  awake: SleepStageMetrics;
  transitions: SleepTransition[];
}

export interface SleepStageMetrics {
  duration: number; // minutes
  percentage: number; // % of total sleep
  quality: number; // 0-100
  efficiency: number; // 0-100
}

export interface SleepTransition {
  from_stage: string;
  to_stage: string;
  timestamp: Date;
  duration: number; // minutes
  frequency: number; // per night
}

export interface SleepQuality {
  overall_score: number; // 0-100
  efficiency: number; // 0-100
  latency: number; // minutes to fall asleep
  awakenings: number;
  wake_after_sleep_onset: number; // minutes
  consistency: number; // 0-100
}

export interface SleepSchedule {
  bedtime: TimePreference;
  wake_time: TimePreference;
  sleep_duration: number; // hours
  variability: number; // minutes
  adherence: number; // 0-100
}

export interface TimePreference {
  ideal: string; // HH:MM
  actual: string; // HH:MM
  variance: number; // minutes
}

export interface SleepEnvironment {
  temperature: number; // Celsius
  humidity: number; // %
  noise_level: number; // dB
  light_level: number; // lux
  comfort_score: number; // 0-100
}

export interface SleepSession {
  id: string;
  date: Date;
  bedtime: Date;
  wake_time: Date;
  duration: number; // minutes
  quality: SleepQuality;
  stages: SleepStageData;
  disturbances: SleepDisturbance[];
  environment: SleepEnvironment;
  devices: SleepDevice[];
}

export interface SleepDisturbance {
  type: 'noise' | 'light' | 'temperature' | 'movement' | 'bathroom' | 'nightmare' | 'pain' | 'other';
  timestamp: Date;
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high';
  impact: number; // 0-100
}

export interface SleepDevice {
  type: 'wearable' | 'bed_sensor' | 'phone_app' | 'smart_bed' | 'environmental';
  name: string;
  accuracy: number; // 0-100
  battery_level: number; // 0-100
  last_sync: Date;
}

export interface ActivityLevelData {
  current_activity: ActivityState;
  daily_pattern: ActivityPattern;
  weekly_trends: ActivityTrend;
  fitness_metrics: FitnessMetrics;
  sedentary_behavior: SedentaryBehavior;
  readings: ActivityReading[];
  last_updated: Date;
}

export interface ActivityState {
  activity_type: ActivityType;
  intensity: number; // 0-100
  duration: number; // minutes
  calories_burned: number;
  posture: PostureState;
  environment: string;
}

export interface ActivityType {
  name: string;
  category: 'sedentary' | 'light' | 'moderate' | 'vigorous';
  met_value: number; // METs
}

export interface PostureState {
  position: 'standing' | 'sitting' | 'lying' | 'walking' | 'running';
  quality: number; // 0-100
  issues: PostureIssue[];
}

export interface PostureIssue {
  type: 'slouching' | 'forward_head' | 'uneven_shoulders' | 'pelvic_tilt' | 'other';
  severity: 'low' | 'medium' | 'high';
  duration: number; // minutes
}

export interface ActivityPattern {
  hourly_activity: HourlyActivity[];
  peak_times: TimeRange[];
  low_times: TimeRange[];
  consistency: number; // 0-100
}

export interface HourlyActivity {
  hour: number; // 0-23
  average_intensity: number; // 0-100
  dominant_activity: string;
  calorie_burn: number;
}

export interface ActivityTrend {
  period: 'daily' | 'weekly' | 'monthly';
  trend: 'increasing' | 'stable' | 'decreasing';
  change_rate: number; // % per period
  significance: number; // 0-100
}

export interface FitnessMetrics {
  vo2_max?: number; // ml/kg/min
  resting_heart_rate: number; // bpm
  heart_rate_recovery: number; // bpm drop
  step_count: number;
  distance: number; // meters
  floors_climbed: number;
  active_minutes: number;
  exercise_frequency: number; // per week
}

export interface SedentaryBehavior {
  total_sedentary_time: number; // minutes
  sedentary_bouts: SedentaryBout[];
  break_frequency: number; // per hour
  average_bout_duration: number; // minutes
}

export interface SedentaryBout {
  start_time: Date;
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  interruptions: number;
}

export interface ActivityReading {
  timestamp: Date;
  activity: ActivityState;
  device: string;
  accuracy: number; // 0-100
  context: ReadingContext;
}

export interface StressIndicatorData {
  current_stress: StressLevel;
  stress_history: StressEvent[];
  stress_patterns: StressPattern[];
  coping_mechanisms: CopingMechanism[];
  stress_triggers: StressTrigger[];
  readings: StressReading[];
  last_updated: Date;
}

export interface StressLevel {
  overall: number; // 0-100
  physiological: number; // 0-100
  psychological: number; // 0-100
  environmental: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // minutes
}

export interface StressEvent {
  id: string;
  timestamp: Date;
  stress_level: StressLevel;
  triggers: string[];
  symptoms: StressSymptom[];
  duration: number; // minutes
  resolution?: string;
  impact: number; // 0-100
}

export interface StressSymptom {
  type: 'physical' | 'emotional' | 'cognitive' | 'behavioral';
  description: string;
  severity: 'low' | 'medium' | 'high';
  duration: number; // minutes
}

export interface StressPattern {
  type: 'time_based' | 'situational' | 'environmental' | 'physiological';
  description: string;
  frequency: number; // per week
  average_intensity: number; // 0-100
  average_duration: number; // minutes
  triggers: string[];
  predictability: number; // 0-100
}

export interface CopingMechanism {
  name: string;
  type: 'breathing' | 'meditation' | 'exercise' | 'social' | 'creative' | 'problem_solving';
  effectiveness: number; // 0-100
  usage_frequency: number; // per week
  preferred_times: TimeRange[];
}

export interface StressTrigger {
  category: 'work' | 'personal' | 'health' | 'environmental' | 'social' | 'financial';
  description: string;
  frequency: number; // per week
  impact_level: number; // 0-100
  controllable: boolean;
}

export interface StressReading {
  timestamp: Date;
  stress_level: StressLevel;
  biomarkers: StressBiomarkers;
  context: ReadingContext;
  predictions: StressPrediction[];
}

export interface StressBiomarkers {
  heart_rate: number; // bpm
  heart_rate_variability: number; // ms
  blood_pressure: BloodPressureData;
  cortisol_level?: number; // nmol/L
  skin_conductance: number; // microsiemens
  body_temperature: number; // Celsius
}

export interface StressPrediction {
  time_horizon: number; // minutes
  probability: number; // 0-100
  confidence: number; // 0-100
  factors: string[];
  recommendations: string[];
}

export interface HealthMetrics {
  overall_health: HealthScore;
  cardiovascular: CardiovascularMetrics;
  respiratory: RespiratoryMetrics;
  neurological: NeurologicalMetrics;
  musculoskeletal: MusculoskeletalMetrics;
  metabolic: MetabolicMetrics;
  immune: ImmuneMetrics;
  mental: MentalHealthMetrics;
  risk_factors: HealthRiskFactor[];
  recommendations: HealthRecommendation[];
}

export interface HealthScore {
  overall: number; // 0-100
  physical: number; // 0-100
  mental: number; // 0-100
  lifestyle: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  last_updated: Date;
}

export interface CardiovascularMetrics {
  resting_heart_rate: number; // bpm
  blood_pressure: BloodPressureData;
  heart_rate_variability: HRVData;
  oxygen_saturation: OxygenSaturationData;
  cardiovascular_age: number; // years
  risk_score: number; // 0-100
}

export interface RespiratoryMetrics {
  resting_respiratory_rate: number; // breaths per minute
  lung_capacity: number; // liters
  oxygen_efficiency: number; // 0-100
  breathing_pattern: BreathingPattern;
  respiratory_age: number; // years
}

export interface BreathingPattern {
  rhythm: 'regular' | 'irregular' | 'periodic';
  depth: 'shallow' | 'normal' | 'deep';
  rate: 'slow' | 'normal' | 'fast';
  chest_belly_ratio: number; // 0-100
}

export interface NeurologicalMetrics {
  cognitive_performance: CognitivePerformance;
  stress_resilience: number; // 0-100
  sleep_quality: number; // 0-100
  brain_age: number; // years
  neuroplasticity: number; // 0-100
}

export interface CognitivePerformance {
  attention: number; // 0-100
  memory: number; // 0-100
  processing_speed: number; // 0-100
  executive_function: number; // 0-100
  creativity: number; // 0-100
}

export interface MusculoskeletalMetrics {
  posture_quality: number; // 0-100
  flexibility: number; // 0-100
  strength: number; // 0-100
  balance: number; // 0-100
  musculoskeletal_age: number; // years
}

export interface MetabolicMetrics {
  basal_metabolic_rate: number; // kcal/day
  metabolic_age: number; // years
  insulin_sensitivity: number; // 0-100
  cholesterol_levels: CholesterolLevels;
  blood_sugar: BloodSugarLevels;
}

export interface CholesterolLevels {
  total: number; // mg/dL
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  triglycerides: number; // mg/dL
}

export interface BloodSugarLevels {
  fasting: number; // mg/dL
  postprandial: number; // mg/dL
  hba1c: number; // %
  variability: number; // 0-100
}

export interface ImmuneMetrics {
  immune_strength: number; // 0-100
  inflammation_level: number; // 0-100
  recovery_rate: number; // 0-100
  sleep_impact: number; // 0-100
  nutrition_impact: number; // 0-100
}

export interface MentalHealthMetrics {
  mood_stability: number; // 0-100
  stress_management: number; // 0-100
  emotional_resilience: number; // 0-100
  social_connection: number; // 0-100
  life_satisfaction: number; // 0-100
}

export interface HealthRiskFactor {
  type: 'cardiovascular' | 'respiratory' | 'neurological' | 'metabolic' | 'musculoskeletal' | 'mental' | 'lifestyle';
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  modifiable: boolean;
  recommendations: string[];
}

export interface HealthRecommendation {
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medical' | 'lifestyle';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action_steps: string[];
  expected_outcome: string;
  timeline: string;
  evidence: RecommendationEvidence[];
}

export interface RecommendationEvidence {
  source: string;
  type: 'clinical_study' | 'research' | 'expert_opinion' | 'data_analysis';
  confidence: number; // 0-100
  relevance: number; // 0-100
}

export interface PerformanceMetrics {
  cognitive_performance: CognitivePerformance;
  physical_performance: PhysicalPerformance;
  emotional_performance: EmotionalPerformance;
  social_performance: SocialPerformance;
  work_performance: WorkPerformance;
  academic_performance: AcademicPerformance;
}

export interface PhysicalPerformance {
  endurance: number; // 0-100
  strength: number; // 0-100
  flexibility: number; // 0-100
  balance: number; // 0-100
  coordination: number; // 0-100
  speed: number; // 0-100
}

export interface EmotionalPerformance {
  emotional_regulation: number; // 0-100
  stress_tolerance: number; // 0-100
  empathy: number; // 0-100
  social_intelligence: number; // 0-100
  resilience: number; // 0-100
}

export interface SocialPerformance {
  communication: number; // 0-100
  collaboration: number; // 0-100
  leadership: number; // 0-100
  networking: number; // 0-100
  conflict_resolution: number; // 0-100
}

export interface WorkPerformance {
  productivity: number; // 0-100
  quality: number; // 0-100
  efficiency: number; // 0-100
  innovation: number; // 0-100
  reliability: number; // 0-100
}

export interface AcademicPerformance {
  learning_speed: number; // 0-100
  retention: number; // 0-100
  comprehension: number; // 0-100
  critical_thinking: number; // 0-100
  problem_solving: number; // 0-100
}

export interface OptimizationGoal {
  id: string;
  name: string;
  description: string;
  category: 'health' | 'performance' | 'wellness' | 'recovery' | 'prevention';
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_metrics: TargetMetric[];
  current_status: GoalStatus;
  timeline: GoalTimeline;
  interventions: GoalIntervention[];
  progress: GoalProgress;
  created_at: Date;
  updated_at: Date;
}

export interface TargetMetric {
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  importance: number; // 0-100
  measurement_method: string;
  update_frequency: string;
}

export interface GoalStatus {
  status: 'not_started' | 'in_progress' | 'on_track' | 'ahead' | 'behind' | 'completed' | 'paused' | 'cancelled';
  completion_percentage: number; // 0-100
  last_updated: Date;
}

export interface GoalTimeline {
  start_date: Date;
  target_date: Date;
  milestones: GoalMilestone[];
  checkpoints: GoalCheckpoint[];
}

export interface GoalMilestone {
  id: string;
  name: string;
  target_date: Date;
  criteria: string[];
  completed: boolean;
  completed_at?: Date;
}

export interface GoalCheckpoint {
  date: Date;
  expected_progress: number; // 0-100
  actual_progress?: number; // 0-100
  assessment: string;
}

export interface GoalIntervention {
  id: string;
  name: string;
  type: 'behavioral' | 'environmental' | 'technological' | 'medical' | 'lifestyle';
  description: string;
  implementation: InterventionImplementation;
  effectiveness: number; // 0-100
  side_effects: string[];
  cost?: number;
}

export interface InterventionImplementation {
  frequency: string;
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  resources: string[];
  requirements: string[];
}

export interface GoalProgress {
  historical_data: ProgressDataPoint[];
  trend: 'improving' | 'stable' | 'declining';
  rate_of_change: number; // % per period
  predicted_completion: Date;
  confidence: number; // 0-100
}

export interface ProgressDataPoint {
  date: Date;
  value: number;
  context: string;
  notes?: string;
}

export interface BiometricBaseline {
  metric: string;
  baseline_value: number;
  unit: string;
  measurement_method: string;
  established_date: Date;
  confidence: number; // 0-100
  variability: number; // standard deviation
  normal_range: { min: number; max: number };
  updates: BaselineUpdate[];
}

export interface BaselineUpdate {
  date: Date;
  old_value: number;
  new_value: number;
  reason: string;
  confidence: number; // 0-100
}

export interface BiometricAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'pattern' | 'emergency';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  metric: string;
  current_value: number;
  threshold_value?: number;
  description: string;
  recommendations: AlertRecommendation[];
  triggered_at: Date;
  acknowledged_at?: Date;
  resolved_at?: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
}

export interface AlertRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  timeline: string;
  resources: string[];
}

export interface BiometricRecommendation {
  id: string;
  type: 'lifestyle' | 'medical' | 'technological' | 'environmental' | 'behavioral';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  rationale: string;
  evidence: RecommendationEvidence[];
  action_steps: ActionStep[];
  expected_outcome: string;
  timeline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cost?: number;
  resources: Resource[];
  success_metrics: SuccessMetric[];
  implementation_status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface ActionStep {
  step: number;
  description: string;
  duration: string;
  requirements: string[];
  tips: string[];
}

export interface Resource {
  type: 'device' | 'app' | 'service' | 'information' | 'support' | 'medication';
  name: string;
  description: string;
  url?: string;
  cost?: number;
  availability: string;
}

export interface SuccessMetric {
  name: string;
  target_value: number;
  unit: string;
  measurement_method: string;
  timeframe: string;
}

export interface PrivacySettings {
  data_collection: DataCollectionSettings;
  data_sharing: DataSharingSettings;
  data_retention: DataRetentionSettings;
  consent: ConsentSettings;
  security: SecuritySettings;
}

export interface DataCollectionSettings {
  biometric_data: boolean;
  health_data: boolean;
  performance_data: boolean;
  location_data: boolean;
  behavioral_data: boolean;
  environmental_data: boolean;
}

export interface DataSharingSettings {
  research_participation: boolean;
  anonymized_sharing: boolean;
  third_party_sharing: boolean;
  commercial_use: boolean;
  sharing_partners: string[];
}

export interface DataRetentionSettings {
  retention_period: number; // days
  auto_delete: boolean;
  export_before_delete: boolean;
  backup_retention: number; // days
}

export interface ConsentSettings {
  informed_consent: boolean;
  consent_version: string;
  consent_date: Date;
  withdrawal_allowed: boolean;
  withdrawal_date?: Date;
}

export interface SecuritySettings {
  encryption: boolean;
  two_factor_auth: boolean;
  biometric_auth: boolean;
  access_logs: boolean;
  breach_notifications: boolean;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  capabilities: DeviceCapability[];
  connection: DeviceConnection;
  status: DeviceStatus;
  battery: BatteryStatus;
  data_streams: DataStream[];
  settings: DeviceSettings;
  last_sync: Date;
  accuracy: number; // 0-100
}

export type DeviceType =
  | 'smartwatch'
  | 'fitness_tracker'
  | 'heart_rate_monitor'
  | 'blood_pressure_monitor'
  | 'glucometer'
  | 'pulse_oximeter'
  | 'eeg_headset'
  | 'emg_sensor'
  | 'eye_tracker'
  | 'smart_ring'
  | 'smart_scale'
  | 'sleep_tracker'
  | 'smart_phone'
  | 'tablet'
  | 'laptop'
  | 'desktop'
  | 'wearable'
  | 'implantable'
  | 'environmental_sensor';

export interface DeviceCapability {
  type: string;
  accuracy: number; // 0-100
  frequency: number; // Hz
  range: { min: number; max: number };
  unit: string;
}

export interface DeviceConnection {
  type: 'bluetooth' | 'wifi' | 'usb' | 'cellular' | 'wired';
  status: 'connected' | 'disconnected' | 'pairing' | 'error';
  signal_strength: number; // 0-100
  latency: number; // ms
  last_connected: Date;
}

export interface DeviceStatus {
  operational: boolean;
  battery_level: number; // 0-100
  charging: boolean;
  firmware_version: string;
  last_calibration: Date;
  error_count: number;
  maintenance_due: Date;
}

export interface BatteryStatus {
  level: number; // 0-100
  charging: boolean;
  health: number; // 0-100
  cycle_count: number;
  estimated_time_remaining: number; // minutes
}

export interface DataStream {
  id: string;
  name: string;
  type: string;
  frequency: number; // Hz
  enabled: boolean;
  quality: number; // 0-100
  last_data: Date;
  data_points: number;
}

export interface DeviceSettings {
  sampling_rate: number; // Hz
  data_quality: 'low' | 'medium' | 'high' | 'ultra';
  notifications: boolean;
  auto_sync: boolean;
  background_mode: boolean;
  power_save: boolean;
  custom_settings: Record<string, any>;
}
