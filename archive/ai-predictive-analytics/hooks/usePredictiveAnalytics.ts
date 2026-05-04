/**
 * Predictive Analytics Hook
 * 
 * React hook for accessing AI-powered predictive analytics functionality
 * with comprehensive state management, error handling, and loading states.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPredictiveAnalyticsEngine } from '../../productivity/ai/PredictiveAnalyticsEngine';
import type { 
  PredictiveInsight, 
  ProductivityQuantumState,
  PredictiveAnalyticsConfig,
  PredictionRequest,
  PredictionResult
} from '../../productivity/ai/PredictiveAnalyticsEngine';

interface UsePredictiveAnalyticsState {
  insights: PredictiveInsight[];
  quantumState: ProductivityQuantumState | null;
  predictions: PredictionResult[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UsePredictiveAnalyticsActions {
  initialize: (config: PredictiveAnalyticsConfig) => Promise<void>;
  refreshInsights: () => Promise<void>;
  refreshQuantumState: () => Promise<void>;
  generatePrediction: (request: PredictionRequest) => Promise<PredictionResult | null>;
  dismissInsight: (insightId: string) => Promise<void>;
  acknowledgeInsight: (insightId: string) => Promise<void>;
  updateQuantumState: (state: Partial<ProductivityQuantumState>) => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UsePredictiveAnalyticsReturn extends UsePredictiveAnalyticsState, UsePredictiveAnalyticsActions {
  isReady: boolean;
  hasInsights: boolean;
  hasQuantumState: boolean;
  activeInsights: PredictiveInsight[];
  expiredInsights: PredictiveInsight[];
  insightsByType: Record<string, PredictiveInsight[]>;
  insightsByImpact: Record<string, PredictiveInsight[]>;
  canGeneratePredictions: boolean;
}

export function usePredictiveAnalytics(userId: string): UsePredictiveAnalyticsReturn {
  const [state, setState] = useState<UsePredictiveAnalyticsState>({
    insights: [],
    quantumState: null,
    predictions: [],
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize predictive analytics engine
  const initialize = useCallback(async (config: PredictiveAnalyticsConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const engine = getPredictiveAnalyticsEngine(userId);
      await engine.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        refreshInsights(),
        refreshQuantumState(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize predictive analytics',
      }));
    }
  }, [userId]);

  // Refresh insights
  const refreshInsights = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const engine = getPredictiveAnalyticsEngine(userId);
      const insights = await engine.getInsights();
      
      setState(prev => ({
        ...prev,
        insights,
        loading: false,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh insights',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh quantum state
  const refreshQuantumState = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const engine = getPredictiveAnalyticsEngine(userId);
      const quantumState = await engine.getQuantumState();
      
      setState(prev => ({
        ...prev,
        quantumState,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh quantum state',
      }));
    }
  }, [userId, state.initialized]);

  // Generate prediction
  const generatePrediction = useCallback(async (request: PredictionRequest): Promise<PredictionResult | null> => {
    if (!state.initialized || !state.canGeneratePredictions) return null;
    
    try {
      const engine = getPredictiveAnalyticsEngine(userId);
      const result = await engine.generatePrediction(request);
      
      setState(prev => ({
        ...prev,
        predictions: [...prev.predictions, result],
        lastUpdated: Date.now(),
      }));
      
      return result;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate prediction',
      }));
      return null;
    }
  }, [userId, state.initialized, state.canGeneratePredictions]);

  // Dismiss insight
  const dismissInsight = useCallback(async (insightId: string) => {
    if (!state.initialized) return;
    
    try {
      const engine = getPredictiveAnalyticsEngine(userId);
      await engine.dismissInsight(insightId);
      
      setState(prev => ({
        ...prev,
        insights: prev.insights.filter(insight => insight.id !== insightId),
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to dismiss insight',
      }));
    }
  }, [userId, state.initialized]);

  // Acknowledge insight
  const acknowledgeInsight = useCallback(async (insightId: string) => {
    if (!state.initialized) return;
    
    try {
      const engine = getPredictiveAnalyticsEngine(userId);
      await engine.acknowledgeInsight(insightId);
      
      setState(prev => ({
        ...prev,
        insights: prev.insights.map(insight => 
          insight.id === insightId 
            ? { ...insight, acknowledged: true }
            : insight
        ),
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to acknowledge insight',
      }));
    }
  }, [userId, state.initialized]);

  // Update quantum state
  const updateQuantumState = useCallback(async (updates: Partial<ProductivityQuantumState>) => {
    if (!state.initialized || !state.quantumState) return;
    
    try {
      const engine = getPredictiveAnalyticsEngine(userId);
      await engine.updateQuantumState(updates);
      
      setState(prev => ({
        ...prev,
        quantumState: prev.quantumState ? { ...prev.quantumState, ...updates } : null,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update quantum state',
      }));
    }
  }, [userId, state.initialized, state.quantumState]);

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
        refreshInsights(),
        refreshQuantumState(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, refreshInsights, refreshQuantumState, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasInsights = useMemo(() => state.insights.length > 0, [state.insights.length]);
  const hasQuantumState = useMemo(() => state.quantumState !== null, [state.quantumState]);
  const canGeneratePredictions = useMemo(() => state.initialized && state.quantumState !== null, [state.initialized, state.quantumState]);

  const activeInsights = useMemo(() => 
    state.insights.filter(insight => !insight.acknowledged && insight.expiresAt > Date.now()),
    [state.insights]
  );

  const expiredInsights = useMemo(() => 
    state.insights.filter(insight => insight.expiresAt <= Date.now()),
    [state.insights]
  );

  const insightsByType = useMemo(() => {
    const grouped: Record<string, PredictiveInsight[]> = {};
    state.insights.forEach(insight => {
      if (!grouped[insight.type]) {
        grouped[insight.type] = [];
      }
      grouped[insight.type].push(insight);
    });
    return grouped;
  }, [state.insights]);

  const insightsByImpact = useMemo(() => {
    const grouped: Record<string, PredictiveInsight[]> = {};
    state.insights.forEach(insight => {
      if (!grouped[insight.impact]) {
        grouped[insight.impact] = [];
      }
      grouped[insight.impact].push(insight);
    });
    return grouped;
  }, [state.insights]);

  // Auto-refresh insights periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      refreshInsights();
      refreshQuantumState();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [state.initialized, refreshInsights, refreshQuantumState]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
    refreshInsights,
    refreshQuantumState,
    generatePrediction,
    dismissInsight,
    acknowledgeInsight,
    updateQuantumState,
    clearError,
    retry,
    isReady,
    hasInsights,
    hasQuantumState,
    activeInsights,
    expiredInsights,
    insightsByType,
    insightsByImpact,
    canGeneratePredictions,
  };
}
