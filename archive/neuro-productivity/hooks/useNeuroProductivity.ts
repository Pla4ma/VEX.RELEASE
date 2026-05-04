/**
 * Neuro Productivity Hook
 * 
 * React hook for accessing neuro productivity with brainwave integration,
 * real-time EEG analysis, personalized neurofeedback, and cognitive enhancement.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getNeuroProductivitySystem } from '../../productivity/neuro/NeuroProductivitySystem';
import type { 
  NeuroProductivityProfile,
  BiometricMetrics,
  BrainwaveData,
  CognitiveState,
  NeuroFeedbackSession,
  EnhancementProtocol,
  NeuroOptimizationPlan,
  ProductivityPrediction,
  NeuroAlert,
  DeviceConnection,
  NeuroConfig,
  NeuroRequest,
  NeuroResponse,
  CognitiveEnhancement,
  FocusState,
  MentalFatigue,
  PerformanceMetrics
} from '../../productivity/neuro/NeuroProductivitySystem';

interface UseNeuroProductivityState {
  profile: NeuroProductivityProfile | null;
  metrics: BiometricMetrics[];
  brainwaves: BrainwaveData[];
  cognitiveState: CognitiveState | null;
  sessions: NeuroFeedbackSession[];
  protocols: EnhancementProtocol[];
  plans: NeuroOptimizationPlan[];
  predictions: ProductivityPrediction[];
  alerts: NeuroAlert[];
  devices: DeviceConnection[];
  enhancements: CognitiveEnhancement[];
  focusState: FocusState | null;
  mentalFatigue: MentalFatigue | null;
  performance: PerformanceMetrics | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseNeuroProductivityActions {
  initialize: (config: NeuroConfig) => Promise<void>;
  startSession: (sessionType: string) => Promise<NeuroFeedbackSession | null>;
  endSession: (sessionId: string) => Promise<boolean>;
  connectDevice: (deviceId: string, deviceType: string) => Promise<boolean>;
  disconnectDevice: (deviceId: string) => Promise<boolean>;
  recordBrainwaves: (duration: number) => Promise<BrainwaveData[] | null>;
  analyzeCognitiveState: () => Promise<CognitiveState | null>;
  generateOptimizationPlan: (goals: string[]) => Promise<NeuroOptimizationPlan | null>;
  applyEnhancementProtocol: (protocolId: string) => Promise<boolean>;
  predictProductivity: (timeframe: number) => Promise<ProductivityPrediction | null>;
  updateFocusState: () => Promise<FocusState | null>;
  assessMentalFatigue: () => Promise<MentalFatigue | null>;
  getPerformanceMetrics: () => Promise<PerformanceMetrics | null>;
  createAlert: (alertData: Partial<NeuroAlert>) => Promise<NeuroAlert | null>;
  dismissAlert: (alertId: string) => Promise<boolean>;
  getRecommendations: (context: string) => Promise<string[]>;
  refreshProfile: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseNeuroProductivityReturn extends UseNeuroProductivityState, UseNeuroProductivityActions {
  isReady: boolean;
  hasProfile: boolean;
  hasMetrics: boolean;
  hasSessions: boolean;
  hasDevices: boolean;
  isDeviceConnected: boolean;
  isInSession: boolean;
  currentFocusLevel: number;
  currentEnergyLevel: number;
  cognitivePerformance: number;
  canStartSession: boolean;
  canConnectDevice: boolean;
  isOptimizing: boolean;
}

export function useNeuroProductivity(userId: string): UseNeuroProductivityReturn {
  const [state, setState] = useState<UseNeuroProductivityState>({
    profile: null,
    metrics: [],
    brainwaves: [],
    cognitiveState: null,
    sessions: [],
    protocols: [],
    plans: [],
    predictions: [],
    alerts: [],
    devices: [],
    enhancements: [],
    focusState: null,
    mentalFatigue: null,
    performance: null,
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize neuro productivity system
  const initialize = useCallback(async (config: NeuroConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getNeuroProductivitySystem(userId);
      await system.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        refreshProfile(),
        refreshMetrics(),
        refreshSessions(),
        refreshDevices(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize neuro productivity',
      }));
    }
  }, [userId]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getNeuroProductivitySystem(userId);
      const [
        profile,
        cognitiveState,
        focusState,
        mentalFatigue,
        performance,
      ] = await Promise.all([
        system.getProfile(),
        system.getCognitiveState(),
        system.getFocusState(),
        system.getMentalFatigue(),
        system.getPerformanceMetrics(),
      ]);
      
      setState(prev => ({
        ...prev,
        profile,
        cognitiveState,
        focusState,
        mentalFatigue,
        performance,
        loading: false,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh profile',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const [metrics, brainwaves, alerts] = await Promise.all([
        system.getMetrics(),
        system.getBrainwaves(),
        system.getAlerts(),
      ]);
      
      setState(prev => ({
        ...prev,
        metrics,
        brainwaves,
        alerts,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh metrics',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const [sessions, protocols, plans, predictions] = await Promise.all([
        system.getSessions(),
        system.getProtocols(),
        system.getPlans(),
        system.getPredictions(),
      ]);
      
      setState(prev => ({
        ...prev,
        sessions,
        protocols,
        plans,
        predictions,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh sessions',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh devices
  const refreshDevices = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const [devices, enhancements] = await Promise.all([
        system.getDevices(),
        system.getEnhancements(),
      ]);
      
      setState(prev => ({
        ...prev,
        devices,
        enhancements,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh devices',
      }));
    }
  }, [userId, state.initialized]);

  // Start neuro feedback session
  const startSession = useCallback(async (sessionType: string): Promise<NeuroFeedbackSession | null> => {
    if (!state.initialized) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getNeuroProductivitySystem(userId);
      const session = await system.startSession(sessionType);
      
      if (session) {
        setState(prev => ({
          ...prev,
          sessions: [session, ...prev.sessions],
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to start session',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // End neuro feedback session
  const endSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const success = await system.endSession(sessionId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, isActive: false, endedAt: Date.now() }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end session',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Connect device
  const connectDevice = useCallback(async (deviceId: string, deviceType: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getNeuroProductivitySystem(userId);
      const success = await system.connectDevice(deviceId, deviceType);
      
      if (success) {
        setState(prev => ({
          ...prev,
          devices: [...prev.devices, {
            id: deviceId,
            type: deviceType,
            isConnected: true,
            connectedAt: Date.now(),
          }],
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect device',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Disconnect device
  const disconnectDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const success = await system.disconnectDevice(deviceId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          devices: prev.devices.filter(device => device.id !== deviceId),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect device',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Record brainwaves
  const recordBrainwaves = useCallback(async (duration: number): Promise<BrainwaveData[] | null> => {
    if (!state.initialized) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getNeuroProductivitySystem(userId);
      const brainwaves = await system.recordBrainwaves(duration);
      
      if (brainwaves) {
        setState(prev => ({
          ...prev,
          brainwaves: [...prev.brainwaves, ...brainwaves],
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return brainwaves;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to record brainwaves',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Analyze cognitive state
  const analyzeCognitiveState = useCallback(async (): Promise<CognitiveState | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const cognitiveState = await system.analyzeCognitiveState();
      
      if (cognitiveState) {
        setState(prev => ({
          ...prev,
          cognitiveState,
          lastUpdated: Date.now(),
        }));
      }
      
      return cognitiveState;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze cognitive state',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Generate optimization plan
  const generateOptimizationPlan = useCallback(async (goals: string[]): Promise<NeuroOptimizationPlan | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const plan = await system.generateOptimizationPlan(goals);
      
      if (plan) {
        setState(prev => ({
          ...prev,
          plans: [plan, ...prev.plans],
          lastUpdated: Date.now(),
        }));
      }
      
      return plan;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate optimization plan',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Apply enhancement protocol
  const applyEnhancementProtocol = useCallback(async (protocolId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const success = await system.applyEnhancementProtocol(protocolId);
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to apply enhancement protocol',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Predict productivity
  const predictProductivity = useCallback(async (timeframe: number): Promise<ProductivityPrediction | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const prediction = await system.predictProductivity(timeframe);
      
      if (prediction) {
        setState(prev => ({
          ...prev,
          predictions: [prediction, ...prev.predictions],
          lastUpdated: Date.now(),
        }));
      }
      
      return prediction;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to predict productivity',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Update focus state
  const updateFocusState = useCallback(async (): Promise<FocusState | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const focusState = await system.updateFocusState();
      
      if (focusState) {
        setState(prev => ({
          ...prev,
          focusState,
          lastUpdated: Date.now(),
        }));
      }
      
      return focusState;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update focus state',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Assess mental fatigue
  const assessMentalFatigue = useCallback(async (): Promise<MentalFatigue | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const mentalFatigue = await system.assessMentalFatigue();
      
      if (mentalFatigue) {
        setState(prev => ({
          ...prev,
          mentalFatigue,
          lastUpdated: Date.now(),
        }));
      }
      
      return mentalFatigue;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assess mental fatigue',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(async (): Promise<PerformanceMetrics | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const performance = await system.getPerformanceMetrics();
      
      if (performance) {
        setState(prev => ({
          ...prev,
          performance,
          lastUpdated: Date.now(),
        }));
      }
      
      return performance;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get performance metrics',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create alert
  const createAlert = useCallback(async (alertData: Partial<NeuroAlert>): Promise<NeuroAlert | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const alert = await system.createAlert(alertData);
      
      if (alert) {
        setState(prev => ({
          ...prev,
          alerts: [alert, ...prev.alerts],
          lastUpdated: Date.now(),
        }));
      }
      
      return alert;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create alert',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const success = await system.dismissAlert(alertId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          alerts: prev.alerts.filter(alert => alert.id !== alertId),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to dismiss alert',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Get recommendations
  const getRecommendations = useCallback(async (context: string): Promise<string[]> => {
    if (!state.initialized) return [];
    
    try {
      const system = getNeuroProductivitySystem(userId);
      const recommendations = await system.getRecommendations(context);
      
      return recommendations;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
      }));
      return [];
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
        refreshProfile(),
        refreshMetrics(),
        refreshSessions(),
        refreshDevices(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, refreshProfile, refreshMetrics, refreshSessions, refreshDevices, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasProfile = useMemo(() => state.profile !== null, [state.profile]);
  const hasMetrics = useMemo(() => state.metrics.length > 0, [state.metrics.length]);
  const hasSessions = useMemo(() => state.sessions.length > 0, [state.sessions.length]);
  const hasDevices = useMemo(() => state.devices.length > 0, [state.devices.length]);

  const isDeviceConnected = useMemo(() => 
    state.devices.some(device => device.isConnected),
    [state.devices]
  );

  const isInSession = useMemo(() => 
    state.sessions.some(session => session.isActive),
    [state.sessions]
  );

  const currentFocusLevel = useMemo(() => 
    state.focusState?.level || 0,
    [state.focusState]
  );

  const currentEnergyLevel = useMemo(() => 
    state.mentalFatigue ? 100 - state.mentalFatigue.level : 50,
    [state.mentalFatigue]
  );

  const cognitivePerformance = useMemo(() => 
    state.performance?.overallScore || 0,
    [state.performance]
  );

  const canStartSession = useMemo(() => 
    state.initialized && isDeviceConnected && !isInSession,
    [state.initialized, isDeviceConnected, isInSession]
  );

  const canConnectDevice = useMemo(() => 
    state.initialized && !isDeviceConnected,
    [state.initialized, isDeviceConnected]
  );

  const isOptimizing = useMemo(() => 
    state.plans.some(plan => plan.isActive),
    [state.plans]
  );

  // Auto-refresh data periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      refreshMetrics();
      updateFocusState();
      assessMentalFatigue();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.initialized, refreshMetrics, updateFocusState, assessMentalFatigue]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
    startSession,
    endSession,
    connectDevice,
    disconnectDevice,
    recordBrainwaves,
    analyzeCognitiveState,
    generateOptimizationPlan,
    applyEnhancementProtocol,
    predictProductivity,
    updateFocusState,
    assessMentalFatigue,
    getPerformanceMetrics,
    createAlert,
    dismissAlert,
    getRecommendations,
    refreshProfile,
    refreshMetrics,
    refreshSessions,
    clearError,
    retry,
    isReady,
    hasProfile,
    hasMetrics,
    hasSessions,
    hasDevices,
    isDeviceConnected,
    isInSession,
    currentFocusLevel,
    currentEnergyLevel,
    cognitivePerformance,
    canStartSession,
    canConnectDevice,
    isOptimizing,
  };
}
