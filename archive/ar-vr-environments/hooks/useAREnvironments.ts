/**
 * AR/VR Environments Hook
 * 
 * React hook for accessing AR/VR environments with immersive experiences,
 * virtual workspaces, 3D visualizations, and mixed reality productivity.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAREnvironmentsSystem } from '../../productivity/ar-vr/AREnvironmentsSystem';
import type { 
  AREnvironmentsProfile,
  VirtualWorkspace,
  ImmersiveExperience,
  MixedRealityEnvironment,
  ARVisualization,
  VRProductivitySpace,
  Interface3D,
  SpatialComputing,
  HapticFeedback,
  GestureControl,
  VoiceInterface,
  EyeTracking,
  MotionCapture,
  ARConfig,
  VRConfig,
  ARRequest,
  ARResponse,
  EnvironmentSession,
  VirtualObject,
  SpatialAnchor,
  CollaborationSpace,
  PresentationMode,
  TrainingEnvironment,
  SimulationSpace,
  ARSettings,
  VRSettings,
  EnvironmentMetrics,
  PerformanceOptimization,
  DeviceCompatibility,
  CalibrationData,
  TrackingState,
  RenderingQuality,
  AudioSpatialization,
  EnvironmentAnalytics,
  UserPresence,
  InteractionHistory
} from '../../productivity/ar-vr/AREnvironmentsSystem';

interface UseAREnvironmentsState {
  profile: AREnvironmentsProfile | null;
  virtualWorkspaces: VirtualWorkspace[];
  immersiveExperiences: ImmersiveExperience[];
  mixedRealityEnvironments: MixedRealityEnvironment[];
  arVisualizations: ARVisualization[];
  vrProductivitySpaces: VRProductivitySpace[];
  interfaces3D: Interface3D[];
  spatialComputing: SpatialComputing | null;
  hapticFeedback: HapticFeedback | null;
  gestureControl: GestureControl | null;
  voiceInterface: VoiceInterface | null;
  eyeTracking: EyeTracking | null;
  motionCapture: MotionCapture | null;
  collaborationSpaces: CollaborationSpace[];
  presentationModes: PresentationMode[];
  trainingEnvironments: TrainingEnvironment[];
  simulationSpaces: SimulationSpace[];
  sessions: EnvironmentSession[];
  virtualObjects: VirtualObject[];
  spatialAnchors: SpatialAnchor[];
  metrics: EnvironmentMetrics | null;
  performanceOptimization: PerformanceOptimization | null;
  deviceCompatibility: DeviceCompatibility | null;
  calibrationData: CalibrationData | null;
  trackingState: TrackingState | null;
  renderingQuality: RenderingQuality | null;
  audioSpatialization: AudioSpatialization | null;
  analytics: EnvironmentAnalytics | null;
  userPresence: UserPresence | null;
  interactionHistory: InteractionHistory[];
  arSettings: ARSettings | null;
  vrSettings: VRSettings | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseAREnvironmentsActions {
  initialize: (config: ARConfig & VRConfig) => Promise<void>;
  createWorkspace: (workspaceType: string, parameters: any) => Promise<VirtualWorkspace | null>;
  startImmersiveExperience: (experienceType: string, parameters: any) => Promise<ImmersiveExperience | null>;
  enableMixedReality: (environmentType: string) => Promise<MixedRealityEnvironment | null>;
  createARVisualization: (dataType: string, parameters: any) => Promise<ARVisualization | null>;
  setupVRProductivitySpace: (spaceType: string, parameters: any) => Promise<VRProductivitySpace | null>;
  create3DInterface: (interfaceType: string, parameters: any) => Promise<Interface3D | null>;
  enableSpatialComputing: (computingType: string) => Promise<SpatialComputing | null>;
  configureHaptics: (feedbackType: string, parameters: any) => Promise<HapticFeedback | null>;
  enableGestureControl: (controlType: string) => Promise<GestureControl | null>;
  setupVoiceInterface: (interfaceType: string) => Promise<VoiceInterface | null>;
  enableEyeTracking: (trackingType: string) => Promise<EyeTracking | null>;
  enableMotionCapture: (captureType: string) => Promise<MotionCapture | null>;
  createCollaborationSpace: (spaceType: string, parameters: any) => Promise<CollaborationSpace | null>;
  setupPresentationMode: (modeType: string, parameters: any) => Promise<PresentationMode | null>;
  createTrainingEnvironment: (trainingType: string, parameters: any) => Promise<TrainingEnvironment | null>;
  createSimulationSpace: (simulationType: string, parameters: any) => Promise<SimulationSpace | null>;
  addVirtualObject: (objectType: string, parameters: any) => Promise<VirtualObject | null>;
  createSpatialAnchor: (anchorType: string, parameters: any) => Promise<SpatialAnchor | null>;
  updateMetrics: () => Promise<void>;
  optimizePerformance: (optimizationType: string) => Promise<PerformanceOptimization | null>;
  calibrateDevice: (calibrationType: string) => Promise<CalibrationData | null>;
  updateSettings: (settings: Partial<ARSettings & VRSettings>) => Promise<boolean>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseAREnvironmentsReturn extends UseAREnvironmentsState, UseAREnvironmentsActions {
  isReady: boolean;
  hasProfile: boolean;
  hasWorkspaces: boolean;
  hasExperiences: boolean;
  hasDevices: boolean;
  canCreateWorkspace: boolean;
  canStartExperience: boolean;
  isCreatingWorkspace: boolean;
  totalWorkspaces: number;
  totalExperiences: number;
  activeCollaborationSpaces: number;
  overallPerformance: number;
  trackingAccuracy: number;
  renderingFPS: number;
}

export function useAREnvironments(userId: string): UseAREnvironmentsReturn {
  const [state, setState] = useState<UseAREnvironmentsState>({
    profile: null,
    virtualWorkspaces: [],
    immersiveExperiences: [],
    mixedRealityEnvironments: [],
    arVisualizations: [],
    vrProductivitySpaces: [],
    interfaces3D: [],
    spatialComputing: null,
    hapticFeedback: null,
    gestureControl: null,
    voiceInterface: null,
    eyeTracking: null,
    motionCapture: null,
    collaborationSpaces: [],
    presentationModes: [],
    trainingEnvironments: [],
    simulationSpaces: [],
    sessions: [],
    virtualObjects: [],
    spatialAnchors: [],
    metrics: null,
    performanceOptimization: null,
    deviceCompatibility: null,
    calibrationData: null,
    trackingState: null,
    renderingQuality: null,
    audioSpatialization: null,
    analytics: null,
    userPresence: null,
    interactionHistory: [],
    arSettings: null,
    vrSettings: null,
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize AR/VR environments system
  const initialize = useCallback(async (config: ARConfig & VRConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getAREnvironmentsSystem(userId);
      await system.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        updateMetrics(),
        loadWorkspaces(),
        loadExperiences(),
        loadDevices(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize AR/VR environments',
      }));
    }
  }, [userId]);

  // Load workspaces
  const loadWorkspaces = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const [virtualWorkspaces, vrProductivitySpaces, collaborationSpaces] = await Promise.all([
        system.getVirtualWorkspaces(),
        system.getVRProductivitySpaces(),
        system.getCollaborationSpaces(),
      ]);
      
      setState(prev => ({
        ...prev,
        virtualWorkspaces,
        vrProductivitySpaces,
        collaborationSpaces,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load workspaces',
      }));
    }
  }, [userId, state.initialized]);

  // Load experiences
  const loadExperiences = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const [immersiveExperiences, mixedRealityEnvironments, arVisualizations] = await Promise.all([
        system.getImmersiveExperiences(),
        system.getMixedRealityEnvironments(),
        system.getARVisualizations(),
      ]);
      
      setState(prev => ({
        ...prev,
        immersiveExperiences,
        mixedRealityEnvironments,
        arVisualizations,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load experiences',
      }));
    }
  }, [userId, state.initialized]);

  // Load devices and interfaces
  const loadDevices = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const [
        spatialComputing,
        hapticFeedback,
        gestureControl,
        voiceInterface,
        eyeTracking,
        motionCapture,
        deviceCompatibility,
        trackingState,
        renderingQuality,
        audioSpatialization,
      ] = await Promise.all([
        system.getSpatialComputing(),
        system.getHapticFeedback(),
        system.getGestureControl(),
        system.getVoiceInterface(),
        system.getEyeTracking(),
        system.getMotionCapture(),
        system.getDeviceCompatibility(),
        system.getTrackingState(),
        system.getRenderingQuality(),
        system.getAudioSpatialization(),
      ]);
      
      setState(prev => ({
        ...prev,
        spatialComputing,
        hapticFeedback,
        gestureControl,
        voiceInterface,
        eyeTracking,
        motionCapture,
        deviceCompatibility,
        trackingState,
        renderingQuality,
        audioSpatialization,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load devices',
      }));
    }
  }, [userId, state.initialized]);

  // Update metrics
  const updateMetrics = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const [metrics, performanceOptimization, analytics, userPresence, interactionHistory] = await Promise.all([
        system.getEnvironmentMetrics(),
        system.getPerformanceOptimization(),
        system.getEnvironmentAnalytics(),
        system.getUserPresence(),
        system.getInteractionHistory(),
      ]);
      
      setState(prev => ({
        ...prev,
        metrics,
        performanceOptimization,
        analytics,
        userPresence,
        interactionHistory,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update metrics',
      }));
    }
  }, [userId, state.initialized]);

  // Create workspace
  const createWorkspace = useCallback(async (workspaceType: string, parameters: any): Promise<VirtualWorkspace | null> => {
    if (!state.initialized) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getAREnvironmentsSystem(userId);
      const workspace = await system.createWorkspace(workspaceType, parameters);
      
      if (workspace) {
        setState(prev => ({
          ...prev,
          virtualWorkspaces: [workspace, ...prev.virtualWorkspaces],
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return workspace;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create workspace',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Start immersive experience
  const startImmersiveExperience = useCallback(async (experienceType: string, parameters: any): Promise<ImmersiveExperience | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const experience = await system.startImmersiveExperience(experienceType, parameters);
      
      if (experience) {
        setState(prev => ({
          ...prev,
          immersiveExperiences: [experience, ...prev.immersiveExperiences],
          lastUpdated: Date.now(),
        }));
      }
      
      return experience;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start immersive experience',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Enable mixed reality
  const enableMixedReality = useCallback(async (environmentType: string): Promise<MixedRealityEnvironment | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const environment = await system.enableMixedReality(environmentType);
      
      if (environment) {
        setState(prev => ({
          ...prev,
          mixedRealityEnvironments: [environment, ...prev.mixedRealityEnvironments],
          lastUpdated: Date.now(),
        }));
      }
      
      return environment;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable mixed reality',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create AR visualization
  const createARVisualization = useCallback(async (dataType: string, parameters: any): Promise<ARVisualization | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const visualization = await system.createARVisualization(dataType, parameters);
      
      if (visualization) {
        setState(prev => ({
          ...prev,
          arVisualizations: [visualization, ...prev.arVisualizations],
          lastUpdated: Date.now(),
        }));
      }
      
      return visualization;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create AR visualization',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Setup VR productivity space
  const setupVRProductivitySpace = useCallback(async (spaceType: string, parameters: any): Promise<VRProductivitySpace | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const space = await system.setupVRProductivitySpace(spaceType, parameters);
      
      if (space) {
        setState(prev => ({
          ...prev,
          vrProductivitySpaces: [space, ...prev.vrProductivitySpaces],
          lastUpdated: Date.now(),
        }));
      }
      
      return space;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to setup VR productivity space',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create 3D interface
  const create3DInterface = useCallback(async (interfaceType: string, parameters: any): Promise<Interface3D | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const interface3D = await system.create3DInterface(interfaceType, parameters);
      
      if (interface3D) {
        setState(prev => ({
          ...prev,
          interfaces3D: [interface3D, ...prev.interfaces3D],
          lastUpdated: Date.now(),
        }));
      }
      
      return interface3D;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create 3D interface',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Enable spatial computing
  const enableSpatialComputing = useCallback(async (computingType: string): Promise<SpatialComputing | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const computing = await system.enableSpatialComputing(computingType);
      
      if (computing) {
        setState(prev => ({
          ...prev,
          spatialComputing: computing,
          lastUpdated: Date.now(),
        }));
      }
      
      return computing;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable spatial computing',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Configure haptics
  const configureHaptics = useCallback(async (feedbackType: string, parameters: any): Promise<HapticFeedback | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const haptics = await system.configureHaptics(feedbackType, parameters);
      
      if (haptics) {
        setState(prev => ({
          ...prev,
          hapticFeedback: haptics,
          lastUpdated: Date.now(),
        }));
      }
      
      return haptics;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to configure haptics',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Enable gesture control
  const enableGestureControl = useCallback(async (controlType: string): Promise<GestureControl | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const gestureControl = await system.enableGestureControl(controlType);
      
      if (gestureControl) {
        setState(prev => ({
          ...prev,
          gestureControl,
          lastUpdated: Date.now(),
        }));
      }
      
      return gestureControl;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable gesture control',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Setup voice interface
  const setupVoiceInterface = useCallback(async (interfaceType: string): Promise<VoiceInterface | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const voiceInterface = await system.setupVoiceInterface(interfaceType);
      
      if (voiceInterface) {
        setState(prev => ({
          ...prev,
          voiceInterface,
          lastUpdated: Date.now(),
        }));
      }
      
      return voiceInterface;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to setup voice interface',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Enable eye tracking
  const enableEyeTracking = useCallback(async (trackingType: string): Promise<EyeTracking | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const eyeTracking = await system.enableEyeTracking(trackingType);
      
      if (eyeTracking) {
        setState(prev => ({
          ...prev,
          eyeTracking,
          lastUpdated: Date.now(),
        }));
      }
      
      return eyeTracking;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable eye tracking',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Enable motion capture
  const enableMotionCapture = useCallback(async (captureType: string): Promise<MotionCapture | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const motionCapture = await system.enableMotionCapture(captureType);
      
      if (motionCapture) {
        setState(prev => ({
          ...prev,
          motionCapture,
          lastUpdated: Date.now(),
        }));
      }
      
      return motionCapture;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable motion capture',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create collaboration space
  const createCollaborationSpace = useCallback(async (spaceType: string, parameters: any): Promise<CollaborationSpace | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const space = await system.createCollaborationSpace(spaceType, parameters);
      
      if (space) {
        setState(prev => ({
          ...prev,
          collaborationSpaces: [space, ...prev.collaborationSpaces],
          lastUpdated: Date.now(),
        }));
      }
      
      return space;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create collaboration space',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Setup presentation mode
  const setupPresentationMode = useCallback(async (modeType: string, parameters: any): Promise<PresentationMode | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const mode = await system.setupPresentationMode(modeType, parameters);
      
      if (mode) {
        setState(prev => ({
          ...prev,
          presentationModes: [mode, ...prev.presentationModes],
          lastUpdated: Date.now(),
        }));
      }
      
      return mode;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to setup presentation mode',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create training environment
  const createTrainingEnvironment = useCallback(async (trainingType: string, parameters: any): Promise<TrainingEnvironment | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const environment = await system.createTrainingEnvironment(trainingType, parameters);
      
      if (environment) {
        setState(prev => ({
          ...prev,
          trainingEnvironments: [environment, ...prev.trainingEnvironments],
          lastUpdated: Date.now(),
        }));
      }
      
      return environment;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create training environment',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create simulation space
  const createSimulationSpace = useCallback(async (simulationType: string, parameters: any): Promise<SimulationSpace | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const space = await system.createSimulationSpace(simulationType, parameters);
      
      if (space) {
        setState(prev => ({
          ...prev,
          simulationSpaces: [space, ...prev.simulationSpaces],
          lastUpdated: Date.now(),
        }));
      }
      
      return space;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create simulation space',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Add virtual object
  const addVirtualObject = useCallback(async (objectType: string, parameters: any): Promise<VirtualObject | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const object = await system.addVirtualObject(objectType, parameters);
      
      if (object) {
        setState(prev => ({
          ...prev,
          virtualObjects: [object, ...prev.virtualObjects],
          lastUpdated: Date.now(),
        }));
      }
      
      return object;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add virtual object',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create spatial anchor
  const createSpatialAnchor = useCallback(async (anchorType: string, parameters: any): Promise<SpatialAnchor | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const anchor = await system.createSpatialAnchor(anchorType, parameters);
      
      if (anchor) {
        setState(prev => ({
          ...prev,
          spatialAnchors: [anchor, ...prev.spatialAnchors],
          lastUpdated: Date.now(),
        }));
      }
      
      return anchor;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create spatial anchor',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Optimize performance
  const optimizePerformance = useCallback(async (optimizationType: string): Promise<PerformanceOptimization | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const optimization = await system.optimizePerformance(optimizationType);
      
      if (optimization) {
        setState(prev => ({
          ...prev,
          performanceOptimization: optimization,
          lastUpdated: Date.now(),
        }));
      }
      
      return optimization;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize performance',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Calibrate device
  const calibrateDevice = useCallback(async (calibrationType: string): Promise<CalibrationData | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const calibration = await system.calibrateDevice(calibrationType);
      
      if (calibration) {
        setState(prev => ({
          ...prev,
          calibrationData: calibration,
          lastUpdated: Date.now(),
        }));
      }
      
      return calibration;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to calibrate device',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Update settings
  const updateSettings = useCallback(async (settings: Partial<ARSettings & VRSettings>): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getAREnvironmentsSystem(userId);
      const success = await system.updateSettings(settings);
      
      if (success) {
        setState(prev => ({
          ...prev,
          arSettings: { ...prev.arSettings, ...settings },
          vrSettings: { ...prev.vrSettings, ...settings },
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Retry operation
  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setState(prev => ({
        ...prev,
        error: 'Maximum retry attempts exceeded',
      }));
      return;
    }
    
    setRetryCount(prev => prev + 1);
    clearError();
    
    // Retry the last failed operation
    if (state.initialized) {
      await Promise.all([
        loadWorkspaces(),
        loadExperiences(),
        loadDevices(),
        updateMetrics(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, loadWorkspaces, loadExperiences, loadDevices, updateMetrics, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasProfile = useMemo(() => state.profile !== null, [state.profile]);
  const hasWorkspaces = useMemo(() => state.virtualWorkspaces.length > 0, [state.virtualWorkspaces.length]);
  const hasExperiences = useMemo(() => state.immersiveExperiences.length > 0, [state.immersiveExperiences.length]);
  const hasDevices = useMemo(() => state.deviceCompatibility !== null, [state.deviceCompatibility]);

  const canCreateWorkspace = useMemo(() => 
    state.initialized && hasDevices,
    [state.initialized, hasDevices]
  );

  const canStartExperience = useMemo(() => 
    state.initialized && hasDevices,
    [state.initialized, hasDevices]
  );

  const isCreatingWorkspace = useMemo(() => state.loading, [state.loading]);

  const totalWorkspaces = useMemo(() => state.virtualWorkspaces.length, [state.virtualWorkspaces.length]);
  const totalExperiences = useMemo(() => state.immersiveExperiences.length, [state.immersiveExperiences.length]);
  const activeCollaborationSpaces = useMemo(() => state.collaborationSpaces.filter(space => space.active).length, [state.collaborationSpaces]);

  const overallPerformance = useMemo(() => 
    state.performanceOptimization?.overallScore || 0,
    [state.performanceOptimization]
  );

  const trackingAccuracy = useMemo(() => 
    state.trackingState?.accuracy || 0,
    [state.trackingState]
  );

  const renderingFPS = useMemo(() => 
    state.renderingQuality?.fps || 0,
    [state.renderingQuality]
  );

  // Auto-refresh data periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      updateMetrics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.initialized, updateMetrics]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
    createWorkspace,
    startImmersiveExperience,
    enableMixedReality,
    createARVisualization,
    setupVRProductivitySpace,
    create3DInterface,
    enableSpatialComputing,
    configureHaptics,
    enableGestureControl,
    setupVoiceInterface,
    enableEyeTracking,
    enableMotionCapture,
    createCollaborationSpace,
    setupPresentationMode,
    createTrainingEnvironment,
    createSimulationSpace,
    addVirtualObject,
    createSpatialAnchor,
    updateMetrics,
    optimizePerformance,
    calibrateDevice,
    updateSettings,
    clearError,
    retry,
    isReady,
    hasProfile,
    hasWorkspaces,
    hasExperiences,
    hasDevices,
    canCreateWorkspace,
    canStartExperience,
    isCreatingWorkspace,
    totalWorkspaces,
    totalExperiences,
    activeCollaborationSpaces,
    overallPerformance,
    trackingAccuracy,
    renderingFPS,
  };
}
