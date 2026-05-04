/**
 * AR/VR Environments - Domain Types
 */

export interface ARVREnvironment {
  id: string;
  name: string;
  description?: string;
  type: 'augmented_reality' | 'virtual_reality' | 'mixed_reality';
  category: 'training' | 'collaboration' | 'visualization' | 'simulation' | 'entertainment' | 'education' | 'design' | 'therapy';
  status: 'draft' | 'active' | 'paused' | 'archived';
  creator: string;
  version: string;
  platform: PlatformConfig;
  environment: EnvironmentConfig;
  assets: AssetLibrary;
  interactions: InteractionConfig;
  users: UserEnvironment[];
  sessions: EnvironmentSession[];
  analytics: EnvironmentAnalytics;
  permissions: EnvironmentPermissions;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformConfig {
  supported_platforms: Platform[];
  requirements: PlatformRequirements;
  compatibility: CompatibilityConfig;
  optimization: OptimizationConfig;
}

export type Platform =
  | 'oculus_quest_2'
  | 'oculus_quest_3'
  | 'meta_quest_pro'
  | 'htc_vive'
  | 'htc_vive_pro'
  | 'valve_index'
  | 'playstation_vr2'
  | 'hololens_2'
  | 'magic_leap_2'
  | 'iphone_ar'
  | 'android_ar'
  | 'webxr'
  | 'desktop_vr'
  | 'mobile_vr';

export interface PlatformRequirements {
  min_os_version: string;
  min_ram: number; // GB
  min_storage: number; // GB
  min_processor: string;
  min_graphics: string;
  required_peripherals: string[];
  optional_peripherals: string[];
  network_required: boolean;
  bandwidth_required?: number; // Mbps
}

export interface CompatibilityConfig {
  cross_platform: boolean;
  save_data_sync: boolean;
  multiplayer_compatibility: boolean;
  asset_sharing: boolean;
  api_compatibility: string[];
}

export interface OptimizationConfig {
  performance_targets: PerformanceTargets;
  quality_settings: QualitySettings;
  adaptive_settings: AdaptiveSettings;
}

export interface PerformanceTargets {
  target_fps: number;
  minimum_fps: number;
  target_resolution: string;
  loading_time_max: number; // seconds
  memory_limit: number; // MB
}

export interface QualitySettings {
  graphics_quality: 'low' | 'medium' | 'high' | 'ultra' | 'auto';
  texture_quality: 'low' | 'medium' | 'high' | 'ultra';
  shadow_quality: 'low' | 'medium' | 'high' | 'ultra';
  lighting_quality: 'low' | 'medium' | 'high' | 'ultra';
  anti_aliasing: 'none' | 'fxaa' | 'msaa_2x' | 'msaa_4x' | 'msaa_8x';
}

export interface AdaptiveSettings {
  dynamic_quality: boolean;
  adaptive_resolution: boolean;
  performance_monitoring: boolean;
  auto_adjustment: boolean;
}

export interface EnvironmentConfig {
  scene: SceneConfig;
  physics: PhysicsConfig;
  audio: AudioConfig;
  lighting: LightingConfig;
  rendering: RenderingConfig;
  user_interface: UIConfig;
}

export interface SceneConfig {
  type: 'spatial' | '360_video' | 'panoramic' | 'cubemap' | 'custom';
  scale: {
    type: 'real_world' | 'miniature' | 'giant' | 'custom';
    scale_factor: number;
  };
  boundaries: BoundaryConfig;
  spawn_points: SpawnPoint[];
  navigation: NavigationConfig;
}

export interface BoundaryConfig {
  type: 'room_scale' | 'standing' | 'seated' | 'custom';
  dimensions: {
    width: number; // meters
    height: number; // meters
    depth?: number; // meters
  };
  safety_features: SafetyFeature[];
  warnings: BoundaryWarning[];
}

export interface SafetyFeature {
  type: 'chaperone' | 'guardian' | 'boundary_warning' | 'collision_detection';
  enabled: boolean;
  sensitivity: number; // 0-100
  visual_indicators: boolean;
  audio_indicators: boolean;
  haptic_feedback: boolean;
}

export interface BoundaryWarning {
  distance: number; // meters from boundary
  type: 'visual' | 'audio' | 'haptic' | 'combination';
  intensity: 'low' | 'medium' | 'high';
  color?: string;
  sound?: string;
}

export interface SpawnPoint {
  id: string;
  name: string;
  position: Vector3;
  rotation: Vector3;
  user_type: 'host' | 'participant' | 'spectator' | 'all';
  enabled: boolean;
}

export interface NavigationConfig {
  type: 'teleport' | 'smooth_locomotion' | 'room_scale' | 'mixed';
  speed: number; // meters/second
  snap_turn: boolean;
  comfort_settings: ComfortSettings;
}

export interface ComfortSettings {
  vignette_strength: number; // 0-100
  snap_turn_angle: number; // degrees
    teleport_delay: number; // seconds
  motion_sickness_reduction: boolean;
  height_adjustment: boolean;
}

export interface PhysicsConfig {
  enabled: boolean;
  gravity: Vector3;
  collision_detection: boolean;
  physics_engine: 'unity_physics' | 'havok' | 'physx' | 'custom';
  performance: PhysicsPerformance;
}

export interface PhysicsPerformance {
  max_collision_objects: number;
  update_rate: number; // Hz
  complexity_level: 'low' | 'medium' | 'high';
  optimization: boolean;
}

export interface AudioConfig {
  spatial_audio: boolean;
  audio_engine: 'unity_audio' | 'fmod' | 'wwise' | 'custom';
  quality: AudioQuality;
  zones: AudioZone[];
  ambient_sounds: AmbientSound[];
}

export interface AudioQuality {
  sample_rate: number; // Hz
  bit_depth: number; // bits
  channels: number;
  compression: 'none' | 'lossy' | 'lossless';
  max_concurrent_sounds: number;
}

export interface AudioZone {
  id: string;
  name: string;
  shape: 'sphere' | 'box' | 'mesh';
  position: Vector3;
  size: Vector3;
  volume: number; // 0-100
  reverb: ReverbSettings;
  sounds: SoundAsset[];
}

export interface ReverbSettings {
  preset: string;
  dry_level: number; // 0-100
  wet_level: number; // 0-100
  room_size: number; // 0-100
  damping: number; // 0-100
}

export interface AmbientSound {
  id: string;
  name: string;
  asset: SoundAsset;
  loop: boolean;
  volume: number; // 0-100
  pitch: number; // 0.5-2.0
  play_conditions: PlayCondition[];
}

export interface LightingConfig {
  type: 'realistic' | 'stylized' | 'cartoon' | 'custom';
  quality: LightingQuality;
  lights: Light[];
  shadows: ShadowConfig;
  reflections: ReflectionConfig;
}

export interface LightingQuality {
  shadow_resolution: 'low' | 'medium' | 'high' | 'ultra';
  shadow_distance: number; // meters
  light_count_limit: number;
  reflection_quality: 'low' | 'medium' | 'high' | 'ultra';
}

export interface Light {
  id: string;
  type: 'directional' | 'point' | 'spot' | 'area';
  position: Vector3;
  rotation: Vector3;
  color: Color;
  intensity: number; // 0-100
  range?: number;
  angle?: number; // for spot lights
  shadows: boolean;
  dynamic: boolean;
}

export interface ShadowConfig {
  enabled: boolean;
  type: 'hard' | 'soft' | 'contact';
  resolution: number;
  distance: number;
  cascades: number;
}

export interface ReflectionConfig {
  enabled: boolean;
  type: 'screen_space' | 'planar' | 'cube_map' | 'ray_traced';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  update_rate: number; // Hz
}

export interface RenderingConfig {
  pipeline: 'forward' | 'deferred' | 'custom';
  post_processing: PostProcessingConfig;
  effects: RenderingEffect[];
  optimization: RenderingOptimization;
}

export interface PostProcessingConfig {
  anti_aliasing: AntiAliasingConfig;
  bloom: BloomConfig;
  color_grading: ColorGradingConfig;
  depth_of_field: DepthOfFieldConfig;
  motion_blur: MotionBlurConfig;
}

export interface AntiAliasingConfig {
  enabled: boolean;
  method: 'fxaa' | 'smaa' | 'taa' | 'msaa';
  quality: 'low' | 'medium' | 'high';
}

export interface BloomConfig {
  enabled: boolean;
  threshold: number;
  intensity: number;
  color: Color;
}

export interface ColorGradingConfig {
  enabled: boolean;
  contrast: number;
  brightness: number;
  saturation: number;
  gamma: number;
  color_filter?: Color;
}

export interface DepthOfFieldConfig {
  enabled: boolean;
  focus_distance: number;
  aperture: number;
  focal_length: number;
}

export interface MotionBlurConfig {
  enabled: boolean;
  strength: number;
  shutter_angle: number;
}

export interface RenderingEffect {
  type: 'particle_system' | 'shader_effect' | 'post_process' | 'custom';
  name: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface RenderingOptimization {
  lod_levels: number;
  culling_distance: number;
  occlusion_culling: boolean;
  frustum_culling: boolean;
  instancing: boolean;
}

export interface UIConfig {
  type: 'world_space' | 'screen_space' | 'head_locked' | 'hand_locked' | 'mixed';
  scale: number;
  distance: number; // meters from user
  interaction: UIInteractionConfig;
  elements: UIElement[];
}

export interface UIInteractionConfig {
  method: 'gaze' | 'pointer' | 'hand_tracking' | 'voice' | 'mixed';
  sensitivity: number; // 0-100
  haptic_feedback: boolean;
  audio_feedback: boolean;
}

export interface UIElement {
  id: string;
  type: 'button' | 'panel' | 'text' | 'image' | 'video' | '3d_model' | 'custom';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  content: UIContent;
  interaction: UIElementInteraction;
  visibility: VisibilityConfig;
}

export interface UIContent {
  text?: string;
  image?: string;
  video?: string;
  model?: string;
  color?: Color;
  font?: string;
  size?: number;
}

export interface UIElementInteraction {
  clickable: boolean;
  hoverable: boolean;
  draggable: boolean;
  resizable: boolean;
  actions: UIAction[];
}

export interface UIAction {
  type: 'navigate' | 'trigger' | 'toggle' | 'input' | 'custom';
  target: string;
  parameters: Record<string, any>;
}

export interface VisibilityConfig {
  always_visible: boolean;
  distance_based: boolean;
  max_distance?: number;
  angle_based: boolean;
  max_angle?: number; // degrees
}

export interface AssetLibrary {
  models: ModelAsset[];
  textures: TextureAsset[];
  audio: SoundAsset[];
  videos: VideoAsset[];
  shaders: ShaderAsset[];
  scripts: ScriptAsset[];
  materials: MaterialAsset[];
  animations: AnimationAsset[];
}

export interface ModelAsset {
  id: string;
  name: string;
  file_path: string;
  format: 'fbx' | 'obj' | 'gltf' | 'dae' | 'custom';
  size: number; // bytes
  polygons: number;
  vertices: number;
  materials: string[];
  animations: string[];
  lod_levels: LODLevel[];
  collision: CollisionConfig;
}

export interface LODLevel {
  level: number;
  distance: number; // meters
  model_path: string;
  polygon_count: number;
}

export interface CollisionConfig {
  enabled: boolean;
  type: 'mesh' | 'convex' | 'box' | 'sphere' | 'capsule';
  physics_material: string;
}

export interface TextureAsset {
  id: string;
  name: string;
  file_path: string;
  format: 'png' | 'jpg' | 'tga' | 'hdr' | 'exr' | 'custom';
  resolution: Vector2;
  size: number; // bytes
  compression: 'none' | 'dxt' | 'astc' | 'etc' | 'custom';
  type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emission' | 'height' | 'ambient_occlusion' | 'custom';
}

export interface SoundAsset {
  id: string;
  name: string;
  file_path: string;
  format: 'wav' | 'mp3' | 'ogg' | 'aac' | 'custom';
  size: number; // bytes
  duration: number; // seconds
  sample_rate: number; // Hz
  bit_depth: number; // bits
  channels: number;
  type: 'sfx' | 'music' | 'voice' | 'ambient';
}

export interface VideoAsset {
  id: string;
  name: string;
  file_path: string;
  format: 'mp4' | 'webm' | 'avi' | 'mov' | 'custom';
  resolution: Vector2;
  size: number; // bytes
  duration: number; // seconds
  frame_rate: number; // fps
  bitrate: number; // kbps
  has_audio: boolean;
}

export interface ShaderAsset {
  id: string;
  name: string;
  file_path: string;
  language: 'hlsl' | 'glsl' | 'cg' | 'custom';
  properties: ShaderProperty[];
  passes: ShaderPass[];
}

export interface ShaderProperty {
  name: string;
  type: 'float' | 'vector2' | 'vector3' | 'vector4' | 'color' | 'texture' | 'custom';
  default_value: any;
  range?: Vector2;
}

export interface ShaderPass {
  name: string;
  vertex_shader: string;
  fragment_shader: string;
  render_state: RenderState;
}

export interface RenderState {
  cull_mode: string;
  blend_mode: string;
  depth_test: boolean;
  depth_write: boolean;
}

export interface ScriptAsset {
  id: string;
  name: string;
  file_path: string;
  language: 'csharp' | 'javascript' | 'lua' | 'python' | 'custom';
  dependencies: string[];
  functions: ScriptFunction[];
}

export interface ScriptFunction {
  name: string;
  parameters: ScriptParameter[];
  return_type: string;
  description: string;
}

export interface ScriptParameter {
  name: string;
  type: string;
  default_value?: any;
  description: string;
}

export interface MaterialAsset {
  id: string;
  name: string;
  shader: string;
  properties: MaterialProperty[];
  textures: MaterialTexture[];
}

export interface MaterialProperty {
  name: string;
  type: 'float' | 'vector2' | 'vector3' | 'vector4' | 'color' | 'boolean';
  value: any;
}

export interface MaterialTexture {
  property_name: string;
  texture_id: string;
  uv_channel: number;
  tiling: Vector2;
  offset: Vector2;
}

export interface AnimationAsset {
  id: string;
  name: string;
  file_path: string;
  format: 'fbx' | 'gltf' | 'custom';
  duration: number; // seconds
  frame_rate: number; // fps
  loops: boolean;
  events: AnimationEvent[];
  curves: AnimationCurve[];
}

export interface AnimationEvent {
  time: number; // seconds
  name: string;
  parameters: Record<string, any>;
}

export interface AnimationCurve {
  name: string;
  property: string;
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number; // seconds
  value: any;
  in_tangent?: Vector3;
  out_tangent?: Vector3;
}

export interface InteractionConfig {
  input_methods: InputMethod[];
  gestures: GestureConfig[];
  voice_commands: VoiceCommandConfig[];
  haptics: HapticConfig[];
  accessibility: AccessibilityConfig;
}

export interface InputMethod {
  type: 'controller' | 'hand_tracking' | 'gaze' | 'voice' | 'touch' | 'keyboard_mouse';
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface GestureConfig {
  type: 'pinch' | 'grab' | 'point' | 'thumbs_up' | 'wave' | 'custom';
  enabled: boolean;
  sensitivity: number; // 0-100
  actions: GestureAction[];
}

export interface GestureAction {
  gesture_type: string;
  action: string;
  parameters: Record<string, any>;
}

export interface VoiceCommandConfig {
  enabled: boolean;
  language: string;
  commands: VoiceCommand[];
  confidence_threshold: number; // 0-100
}

export interface VoiceCommand {
  phrase: string;
  action: string;
  parameters: Record<string, any>;
  aliases: string[];
}

export interface HapticConfig {
  enabled: boolean;
  intensity: number; // 0-100
  feedback_types: HapticFeedbackType[];
}

export interface HapticFeedbackType {
  type: 'collision' | 'interaction' | 'notification' | 'warning' | 'custom';
  pattern: HapticPattern;
  intensity: number; // 0-100
}

export interface HapticPattern {
  duration: number; // milliseconds
  intervals: number[]; // milliseconds
  intensities: number[]; // 0-100
}

export interface AccessibilityConfig {
  subtitles: SubtitleConfig;
  color_blind_assistance: ColorBlindConfig;
  motion_sickness_reduction: MotionSicknessConfig;
  physical_assistance: PhysicalAssistanceConfig;
}

export interface SubtitleConfig {
  enabled: boolean;
  font_size: number;
  font_color: Color;
  background_color: Color;
  position: 'bottom' | 'top' | 'middle';
}

export interface ColorBlindConfig {
  mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  intensity: number; // 0-100
}

export interface MotionSicknessConfig {
  enabled: boolean;
  vignette_strength: number; // 0-100
  snap_turn: boolean;
  reduced_motion: boolean;
  comfort_mode: boolean;
}

export interface PhysicalAssistanceConfig {
  seated_mode: boolean;
  height_adjustment: boolean;
  reach_assistance: boolean;
  controller_assistance: boolean;
}

export interface UserEnvironment {
  id: string;
  user_id: string;
  environment_id: string;
  role: 'host' | 'participant' | 'spectator' | 'moderator';
  status: 'online' | 'offline' | 'away' | 'busy';
  joined_at: Date;
  last_seen: Date;
  permissions: UserPermissions;
  settings: UserSettings;
  platform: Platform;
  location: UserLocation;
  statistics: UserStatistics;
}

export interface UserPermissions {
  can_modify_environment: boolean;
  can_add_users: boolean;
  can_remove_users: boolean;
  can_start_session: boolean;
  can_stop_session: boolean;
  can_record: boolean;
  can_chat: boolean;
  can_share_screen: boolean;
  can_use_voice: boolean;
}

export interface UserSettings {
  graphics_quality: QualitySettings;
  audio_settings: AudioSettings;
  control_settings: ControlSettings;
  accessibility_settings: AccessibilitySettings;
  privacy_settings: PrivacySettings;
}

export interface AudioSettings {
  master_volume: number; // 0-100
  voice_volume: number; // 0-100
  sfx_volume: number; // 0-100
  music_volume: number; // 0-100
  spatial_audio: boolean;
  voice_chat: boolean;
}

export interface ControlSettings {
  movement_type: string;
  turn_type: string;
  snap_turn_angle: number;
  movement_speed: number;
  haptic_feedback: boolean;
}

export interface AccessibilitySettings {
  subtitles: boolean;
  color_blind_mode: string;
  motion_sickness_reduction: boolean;
  seated_mode: boolean;
}

export interface PrivacySettings {
  share_analytics: boolean;
  share_performance: boolean;
  allow_recording: boolean;
  data_retention: number; // days
}

export interface UserLocation {
  position: Vector3;
  rotation: Vector3;
  room: string;
  zone: string;
  last_updated: Date;
}

export interface UserStatistics {
  total_time: number; // minutes
  session_count: number;
  interaction_count: number;
  movement_distance: number; // meters
  achievements: UserAchievement[];
  preferences: UserPreference[];
}

export interface UserAchievement {
  achievement_id: string;
  unlocked_at: Date;
  progress: number; // 0-100
}

export interface UserPreference {
  category: string;
  preference: string;
  value: any;
  updated_at: Date;
}

export interface EnvironmentSession {
  id: string;
  environment_id: string;
  host_id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'invite_only';
  status: 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  max_participants: number;
  current_participants: number;
  start_time?: Date;
  end_time?: Date;
  duration?: number; // minutes
  settings: SessionSettings;
  participants: SessionParticipant[];
  recording?: SessionRecording;
  chat: ChatMessage[];
  analytics: SessionAnalytics;
  created_at: Date;
  updated_at: Date;
}

export interface SessionSettings {
  persistent: boolean;
  auto_save: boolean;
  allow_recording: boolean;
  require_approval: boolean;
  password?: string;
  voice_chat: boolean;
  text_chat: boolean;
  screen_sharing: boolean;
  file_sharing: boolean;
}

export interface SessionParticipant {
  user_id: string;
  role: 'host' | 'participant' | 'spectator';
  joined_at: Date;
  left_at?: Date;
  platform: Platform;
  connection_quality: ConnectionQuality;
  permissions: UserPermissions;
}

export interface ConnectionQuality {
  bandwidth: number; // Mbps
  latency: number; // ms
  packet_loss: number; // %
  connection_stability: number; // 0-100
}

export interface SessionRecording {
  id: string;
  format: 'video' | 'data' | 'both';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  duration?: number; // seconds
  file_size?: number; // bytes
  url?: string;
  thumbnail?: string;
  permissions: RecordingPermissions;
  created_at: Date;
}

export interface RecordingPermissions {
  can_view: string[];
  can_download: string[];
  can_share: string[];
  is_public: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  type: 'text' | 'emoji' | 'system';
  timestamp: Date;
  reactions: MessageReaction[];
  reply_to?: string;
}

export interface MessageReaction {
  emoji: string;
  user_id: string;
  timestamp: Date;
}

export interface SessionAnalytics {
  session_id: string;
  metrics: SessionMetrics;
  participant_analytics: ParticipantAnalytics[];
  interaction_analytics: InteractionAnalytics[];
  performance_analytics: PerformanceAnalytics[];
  generated_at: Date;
}

export interface SessionMetrics {
  total_duration: number; // minutes
  peak_participants: number;
  average_participants: number;
  total_interactions: number;
  chat_messages: number;
  file_shares: number;
  screen_shares: number;
  voice_chat_usage: number; // minutes
}

export interface ParticipantAnalytics {
  user_id: string;
  join_time: Date;
  leave_time?: Date;
  duration: number; // minutes
  interactions: number;
  movement_distance: number; // meters
  platform: Platform;
  connection_quality: ConnectionQuality;
}

export interface InteractionAnalytics {
  type: 'gesture' | 'voice' | 'controller' | 'ui' | 'environment';
  count: number;
  duration: number; // total minutes
  success_rate: number; // 0-100
  most_common: string;
}

export interface PerformanceAnalytics {
  average_fps: number;
  minimum_fps: number;
  frame_drops: number;
  loading_times: LoadingTime[];
  memory_usage: MemoryUsage;
  network_usage: NetworkUsage;
}

export interface LoadingTime {
  asset_type: string;
  load_time: number; // seconds
  file_size: number; // bytes
  success: boolean;
}

export interface MemoryUsage {
  peak_usage: number; // MB
  average_usage: number; // MB
  asset_memory: number; // MB
  texture_memory: number; // MB
  audio_memory: number; // MB
}

export interface NetworkUsage {
  bandwidth_used: number; // MB
  packet_count: number;
  latency: number; // ms
  packet_loss: number; // %
}

export interface EnvironmentAnalytics {
  environment_id: string;
  period: {
    start: Date;
    end: Date;
  };
  usage_metrics: UsageMetrics;
  performance_metrics: PerformanceMetrics;
  user_metrics: UserMetrics;
  content_metrics: ContentMetrics;
  generated_at: Date;
}

export interface UsageMetrics {
  total_sessions: number;
  total_users: number;
  total_duration: number; // minutes
  average_session_length: number; // minutes
  peak_concurrent_users: number;
  popular_times: TimeSlot[];
  retention_rate: number; // 0-100
}

export interface TimeSlot {
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  user_count: number;
  session_count: number;
}

export interface PerformanceMetrics {
  average_fps: number;
  minimum_fps: number;
  loading_times: number; // average seconds
  crash_rate: number; // 0-100
  error_rate: number; // 0-100
  platform_performance: PlatformPerformance[];
}

export interface PlatformPerformance {
  platform: Platform;
  average_fps: number;
  loading_time: number; // seconds
  crash_count: number;
  user_satisfaction: number; // 1-5
}

export interface UserMetrics {
  demographics: UserDemographics;
  behavior: UserBehavior;
  engagement: UserEngagement;
  feedback: UserFeedback[];
}

export interface UserDemographics {
  age_groups: Record<string, number>;
  regions: Record<string, number>;
  languages: Record<string, number>;
  experience_levels: Record<string, number>;
}

export interface UserBehavior {
  session_patterns: SessionPattern[];
  interaction_preferences: InteractionPreference[];
  navigation_patterns: NavigationPattern[];
  content_consumption: ContentConsumption[];
}

export interface SessionPattern {
  duration_range: string;
  frequency: number;
  time_of_day: string[];
  day_of_week: string[];
}

export interface InteractionPreference {
  input_method: string;
  usage_percentage: number;
  satisfaction_score: number; // 1-5
}

export interface NavigationPattern {
  movement_type: string;
  usage_percentage: number;
  average_speed: number; // meters/second
}

export interface ContentConsumption {
  content_type: string;
  view_count: number;
  average_view_time: number; // minutes
  completion_rate: number; // 0-100
}

export interface UserEngagement {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  session_frequency: number; // average per user
  session_duration: number; // average minutes
  retention_rates: RetentionRate[];
}

export interface RetentionRate {
  period: 'day_1' | 'day_7' | 'day_30' | 'day_90';
  rate: number; // 0-100
}

export interface UserFeedback {
  id: string;
  user_id: string;
  rating: number; // 1-5
  category: 'performance' | 'usability' | 'content' | 'social' | 'technical';
  comments?: string;
  platform: Platform;
  submitted_at: Date;
}

export interface ContentMetrics {
  asset_usage: AssetUsage[];
  feature_usage: FeatureUsage[];
  content_popularity: ContentPopularity[];
  creation_metrics: CreationMetrics[];
}

export interface AssetUsage {
  asset_id: string;
  asset_type: string;
  usage_count: number;
  load_time: number; // average seconds
  error_rate: number; // 0-100
  user_satisfaction: number; // 1-5
}

export interface FeatureUsage {
  feature_name: string;
  usage_count: number;
  usage_percentage: number;
  user_satisfaction: number; // 1-5
  most_used_platform: Platform;
}

export interface ContentPopularity {
  content_id: string;
  content_type: string;
  view_count: number;
  like_count: number;
  share_count: number;
  rating: number; // 1-5
}

export interface CreationMetrics {
  total_environments: number;
  active_creators: number;
  average_creation_time: number; // hours
  popular_categories: CategoryUsage[];
  quality_metrics: QualityMetrics[];
}

export interface CategoryUsage {
  category: string;
  environment_count: number;
  user_count: number;
  average_rating: number; // 1-5
}

export interface QualityMetrics {
  average_rating: number; // 1-5
  review_count: number;
  bug_reports: number;
  performance_issues: number;
  user_satisfaction: number; // 1-5
}

export interface EnvironmentPermissions {
  owner_id: string;
  administrators: string[];
  moderators: string[];
  contributors: string[];
  viewers: string[];
  public_access: boolean;
  sharing: SharingConfig;
}

export interface SharingConfig {
  allow_sharing: boolean;
  require_approval: boolean;
  share_link_enabled: boolean;
  embed_enabled: boolean;
  export_enabled: boolean;
  api_access: boolean;
}

// Helper types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Color {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-255
}

export interface PlayCondition {
  type: 'time' | 'location' | 'user_action' | 'environment_state' | 'custom';
  condition: string;
  value: any;
}
