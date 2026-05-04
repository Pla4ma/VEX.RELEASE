/**
 * Biometric Optimization Hook
 * 
 * React hook for accessing biometric optimization with health monitoring,
 * performance tracking, wellness recommendations, and physiological insights.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBiometricOptimizationSystem } from '../../productivity/biometric/BiometricOptimizationSystem';
import type { 
  BiometricProfile,
  HealthMetrics,
  PerformanceMetrics,
  WellnessRecommendations,
  PhysiologicalInsights,
  BiometricDevice,
  HeartRateMonitor,
  SleepTracker,
  ActivityMonitor,
  StressMonitor,
  NutritionTracker,
  BiometricData,
  HealthAlert,
  PerformanceTrend,
  WellnessPlan,
  BiometricSettings,
  OptimizationStrategy,
  BiometricRequest,
  BiometricResponse,
  HealthSession,
  PerformanceSession,
  WellnessSession,
  BiometricAnalytics,
  UserHealthStatus,
  BiometricHistory,
  DeviceConnection,
  SensorData,
  CalibrationData,
  HealthGoals,
  PerformanceGoals,
  WellnessGoals,
  BiometricMetrics,
  OptimizationMetrics,
  HealthRecommendations,
  PerformanceRecommendations,
  WellnessRecommendations as WellnessRecs
} from '../../productivity/biometric/BiometricOptimizationSystem';

interface UseBiometricOptimizationState {
  profile: BiometricProfile | null;
  healthMetrics: HealthMetrics | null;
  performanceMetrics: PerformanceMetrics | null;
  wellnessRecommendations: WellnessRecommendations | null;
  physiologicalInsights: PhysiologicalInsights | null;
  biometricDevices: BiometricDevice[];
  heartRateMonitor: HeartRateMonitor | null;
  sleepTracker: SleepTracker | null;
  activityMonitor: ActivityMonitor | null;
  stressMonitor: StressMonitor | null;
  nutritionTracker: NutritionTracker | null;
  biometricData: BiometricData[];
  healthAlerts: HealthAlert[];
  performanceTrends: PerformanceTrend[];
  wellnessPlans: WellnessPlan[];
  biometricSettings: BiometricSettings | null;
  optimizationStrategy: OptimizationStrategy | null;
  healthSessions: HealthSession[];
  performanceSessions: PerformanceSession[];
  wellnessSessions: WellnessSession[];
  biometricAnalytics: BiometricAnalytics | null;
  userHealthStatus: UserHealthStatus | null;
  biometricHistory: BiometricHistory | null;
  deviceConnections: DeviceConnection[];
  sensorData: SensorData[];
  calibrationData: CalibrationData | null;
  healthGoals: HealthGoals | null;
  performanceGoals: PerformanceGoals | null;
  wellnessGoals: WellnessGoals | null;
  biometricMetrics: BiometricMetrics | null;
  optimizationMetrics: OptimizationMetrics | null;
  healthRecommendations: HealthRecommendations | null;
  performanceRecommendations: PerformanceRecommendations | null;
  wellnessRecommendations2: WellnessRecs | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseBiometricOptimizationActions {
  initialize: (config: BiometricSettings) => Promise<void>;
  connectDevice: (deviceType: string, deviceId: string) => Promise<BiometricDevice | null>;
  startHealthMonitoring: () => Promise<HealthSession | null>;
  startPerformanceTracking: () => Promise<PerformanceSession | null>;
  startWellnessProgram: (programType: string) => Promise<WellnessSession | null>;
  recordBiometricData: (dataType: string, data: any) => Promise<BiometricData | null>;
  generateHealthInsights: () => Promise<PhysiologicalInsights | null>;
  createOptimizationPlan: (planType: string) => Promise<OptimizationStrategy | null>;
  updateHealthGoals: (goals: Partial<HealthGoals>) => Promise<boolean>;
  updatePerformanceGoals: (goals: Partial<PerformanceGoals>) => Promise<boolean>;
  updateWellnessGoals: (goals: Partial<WellnessGoals>) => Promise<boolean>;
  calibrateDevice: (deviceId: string) => Promise<CalibrationData | null>;
  getHealthRecommendations: () => Promise<HealthRecommendations | null>;
  getPerformanceRecommendations: () => Promise<PerformanceRecommendations | null>;
  getWellnessRecommendations: () => Promise<WellnessRecs | null>;
  updateMetrics: () => Promise<void>;
  optimizePerformance: (optimizationType: string) => Promise<OptimizationMetrics | null>;
  updateSettings: (settings: Partial<BiometricSettings>) => Promise<boolean>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseBiometricOptimizationReturn extends UseBiometricOptimizationState, UseBiometricOptimizationActions {
  isReady: boolean;
  hasProfile: boolean;
  hasDevices: boolean;
  hasHealthData: boolean;
  hasPerformanceData: boolean;
  canConnectDevice: boolean;
  canStartMonitoring: boolean;
  isMonitoring: boolean;
  totalDevices: number;
  activeSessions: number;
  healthScore: number;
  performanceScore: number;
  wellnessScore: number;
  overallOptimization: number;
}

export function useBiometricOptimization(userId: string): UseBiometricOptimizationReturn {
  const [state, setState] = useState<UseBiometricOptimizationState>({
    profile: null,
    healthMetrics: null,
    performanceMetrics: null,
    wellnessRecommendations: null,
    physiologicalInsights: null,
    biometricDevices: [],
    heartRateMonitor: null,
    sleepTracker: null,
    activityMonitor: null,
    stressMonitor: null,
    nutritionTracker: null,
    biometricData: [],
    healthAlerts: [],
    performanceTrends: [],
    wellnessPlans: [],
    biometricSettings: null,
    optimizationStrategy: null,
    healthSessions: [],
    performanceSessions: [],
    wellnessSessions: [],
    biometricAnalytics: null,
    userHealthStatus: null,
    biometricHistory: null,
    deviceConnections: [],
    sensorData: [],
    calibrationData: null,
    healthGoals: null,
    performanceGoals: null,
    wellnessGoals: null,
    biometricMetrics: null,
    optimizationMetrics: null,
    healthRecommendations: null,
    performanceRecommendations: null,
    wellnessRecommendations2: null,
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize biometric optimization system
  const initialize = useCallback(async (config: BiometricSettings) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getBiometricOptimizationSystem(userId);
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
        loadDevices(),
        loadHealthData(),
        loadPerformanceData(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize biometric optimization',
      }));
    }
  }, [userId]);

  // Load devices
  const loadDevices = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const [biometricDevices, deviceConnections] = await Promise.all([
        system.getBiometricDevices(),
        system.getDeviceConnections(),
      ]);
      
      setState(prev => ({
        ...prev,
        biometricDevices,
        deviceConnections,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load devices',
      }));
    }
  }, [userId, state.initialized]);

  // Load health data
  const loadHealthData = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const [healthMetrics, healthSessions, healthAlerts] = await Promise.all([
        system.getHealthMetrics(),
        system.getHealthSessions(),
        system.getHealthAlerts(),
      ]);
      
      setState(prev => ({
        ...prev,
        healthMetrics,
        healthSessions,
        healthAlerts,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load health data',
      }));
    }
  }, [userId, state.initialized]);

  // Load performance data
  const loadPerformanceData = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const [performanceMetrics, performanceSessions, performanceTrends] = await Promise.all([
        system.getPerformanceMetrics(),
        system.getPerformanceSessions(),
        system.getPerformanceTrends(),
      ]);
      
      setState(prev => ({
        ...prev,
        performanceMetrics,
        performanceSessions,
        performanceTrends,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load performance data',
      }));
    }
  }, [userId, state.initialized]);

  // Update metrics
  const updateMetrics = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const [
        biometricMetrics,
        optimizationMetrics,
        biometricAnalytics,
        userHealthStatus,
        biometricHistory,
      ] = await Promise.all([
        system.getBiometricMetrics(),
        system.getOptimizationMetrics(),
        system.getBiometricAnalytics(),
        system.getUserHealthStatus(),
        system.getBiometricHistory(),
      ]);
      
      setState(prev => ({
        ...prev,
        biometricMetrics,
        optimizationMetrics,
        biometricAnalytics,
        userHealthStatus,
        biometricHistory,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update metrics',
      }));
    }
  }, [userId, state.initialized]);

  // Connect device
  const connectDevice = useCallback(async (deviceType: string, deviceId: string): Promise<BiometricDevice | null> => {
    if (!state.initialized) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getBiometricOptimizationSystem(userId);
      const device = await system.connectDevice(deviceType, deviceId);
      
      if (device) {
        setState(prev => ({
          ...prev,
          biometricDevices: [device, ...prev.biometricDevices],
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return device;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect device',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Start health monitoring
  const startHealthMonitoring = useCallback(async (): Promise<HealthSession | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const session = await system.startHealthMonitoring();
      
      if (session) {
        setState(prev => ({
          ...prev,
          healthSessions: [session, ...prev.healthSessions],
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start health monitoring',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Start performance tracking
  const startPerformanceTracking = useCallback(async (): Promise<PerformanceSession | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const session = await system.startPerformanceTracking();
      
      if (session) {
        setState(prev => ({
          ...prev,
          performanceSessions: [session, ...prev.performanceSessions],
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start performance tracking',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Start wellness program
  const startWellnessProgram = useCallback(async (programType: string): Promise<WellnessSession | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const session = await system.startWellnessProgram(programType);
      
      if (session) {
        setState(prev => ({
          ...prev,
          wellnessSessions: [session, ...prev.wellnessSessions],
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start wellness program',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Record biometric data
  const recordBiometricData = useCallback(async (dataType: string, data: any): Promise<BiometricData | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const biometricData = await system.recordBiometricData(dataType, data);
      
      if (biometricData) {
        setState(prev => ({
          ...prev,
          biometricData: [biometricData, ...prev.biometricData],
          lastUpdated: Date.now(),
        }));
      }
      
      return biometricData;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to record biometric data',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Generate health insights
  const generateHealthInsights = useCallback(async (): Promise<PhysiologicalInsights | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const insights = await system.generateHealthInsights();
      
      if (insights) {
        setState(prev => ({
          ...prev,
          physiologicalInsights: insights,
          lastUpdated: Date.now(),
        }));
      }
      
      return insights;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate health insights',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Create optimization plan
  const createOptimizationPlan = useCallback(async (planType: string): Promise<OptimizationStrategy | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const plan = await system.createOptimizationPlan(planType);
      
      if (plan) {
        setState(prev => ({
          ...prev,
          optimizationStrategy: plan,
          lastUpdated: Date.now(),
        }));
      }
      
      return plan;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create optimization plan',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Update health goals
  const updateHealthGoals = useCallback(async (goals: Partial<HealthGoals>): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const success = await system.updateHealthGoals(goals);
      
      if (success) {
        setState(prev => ({
          ...prev,
          healthGoals: { ...prev.healthGoals, ...goals },
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update health goals',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Update performance goals
  const updatePerformanceGoals = useCallback(async (goals: Partial<PerformanceGoals>): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const success = await system.updatePerformanceGoals(goals);
      
      if (success) {
        setState(prev => ({
          ...prev,
          performanceGoals: { ...prev.performanceGoals, ...goals },
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update performance goals',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Update wellness goals
  const updateWellnessGoals = useCallback(async (goals: Partial<WellnessGoals>): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const success = await system.updateWellnessGoals(goals);
      
      if (success) {
        setState(prev => ({
          ...prev,
          wellnessGoals: { ...prev.wellnessGoals, ...goals },
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update wellness goals',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Calibrate device
  const calibrateDevice = useCallback(async (deviceId: string): Promise<CalibrationData | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const calibration = await system.calibrateDevice(deviceId);
      
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

  // Get health recommendations
  const getHealthRecommendations = useCallback(async (): Promise<HealthRecommendations | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const recommendations = await system.getHealthRecommendations();
      
      if (recommendations) {
        setState(prev => ({
          ...prev,
          healthRecommendations: recommendations,
          lastUpdated: Date.now(),
        }));
      }
      
      return recommendations;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get health recommendations',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Get performance recommendations
  const getPerformanceRecommendations = useCallback(async (): Promise<PerformanceRecommendations | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const recommendations = await system.getPerformanceRecommendations();
      
      if (recommendations) {
        setState(prev => ({
          ...prev,
          performanceRecommendations: recommendations,
          lastUpdated: Date.now(),
        }));
      }
      
      return recommendations;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get performance recommendations',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Get wellness recommendations
  const getWellnessRecommendations = useCallback(async (): Promise<WellnessRecs | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const recommendations = await system.getWellnessRecommendations();
      
      if (recommendations) {
        setState(prev => ({
          ...prev,
          wellnessRecommendations2: recommendations,
          lastUpdated: Date.now(),
        }));
      }
      
      return recommendations;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get wellness recommendations',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Optimize performance
  const optimizePerformance = useCallback(async (optimizationType: string): Promise<OptimizationMetrics | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const optimization = await system.optimizePerformance(optimizationType);
      
      if (optimization) {
        setState(prev => ({
          ...prev,
          optimizationMetrics: optimization,
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

  // Update settings
  const updateSettings = useCallback(async (settings: Partial<BiometricSettings>): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getBiometricOptimizationSystem(userId);
      const success = await system.updateSettings(settings);
      
      if (success) {
        setState(prev => ({
          ...prev,
          biometricSettings: { ...prev.biometricSettings, ...settings },
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
        loadDevices(),
        loadHealthData(),
        loadPerformanceData(),
        updateMetrics(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, loadDevices, loadHealthData, loadPerformanceData, updateMetrics, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasProfile = useMemo(() => state.profile !== null, [state.profile]);
  const hasDevices = useMemo(() => state.biometricDevices.length > 0, [state.biometricDevices.length]);
  const hasHealthData = useMemo(() => state.healthMetrics !== null, [state.healthMetrics]);
  const hasPerformanceData = useMemo(() => state.performanceMetrics !== null, [state.performanceMetrics]);

  const canConnectDevice = useMemo(() => 
    state.initialized,
    [state.initialized]
  );

  const canStartMonitoring = useMemo(() => 
    state.initialized && hasDevices,
    [state.initialized, hasDevices]
  );

  const isMonitoring = useMemo(() => 
    state.healthSessions.some(session => session.active) ||
    state.performanceSessions.some(session => session.active) ||
    state.wellnessSessions.some(session => session.active),
    [state.healthSessions, state.performanceSessions, state.wellnessSessions]
  );

  const totalDevices = useMemo(() => state.biometricDevices.length, [state.biometricDevices.length]);
  const activeSessions = useMemo(() => 
    state.healthSessions.filter(s => s.active).length +
    state.performanceSessions.filter(s => s.active).length +
    state.wellnessSessions.filter(s => s.active).length,
    [state.healthSessions, state.performanceSessions, state.wellnessSessions]
  );

  const healthScore = useMemo(() => 
    state.healthMetrics?.overallScore || 0,
    [state.healthMetrics]
  );

  const performanceScore = useMemo(() => 
    state.performanceMetrics?.overallScore || 0,
    [state.performanceMetrics]
  );

  const wellnessScore = useMemo(() => 
    state.wellnessRecommendations?.overallScore || 0,
    [state.wellnessRecommendations]
  );

  const overallOptimization = useMemo(() => 
    state.optimizationMetrics?.overallScore || 0,
    [state.optimizationMetrics]
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
    connectDevice,
    startHealthMonitoring,
    startPerformanceTracking,
    startWellnessProgram,
    recordBiometricData,
    generateHealthInsights,
    createOptimizationPlan,
    updateHealthGoals,
    updatePerformanceGoals,
    updateWellnessGoals,
    calibrateDevice,
    getHealthRecommendations,
    getPerformanceRecommendations,
    getWellnessRecommendations,
    updateMetrics,
    optimizePerformance,
    updateSettings,
    clearError,
    retry,
    isReady,
    hasProfile,
    hasDevices,
    hasHealthData,
    hasPerformanceData,
    canConnectDevice,
    canStartMonitoring,
    isMonitoring,
    totalDevices,
    activeSessions,
    healthScore,
    performanceScore,
    wellnessScore,
    overallOptimization,
  };
}
