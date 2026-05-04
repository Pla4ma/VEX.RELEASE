/**
 * Enterprise Analytics Hook
 * 
 * React hook for accessing enterprise analytics with comprehensive business intelligence,
 * team performance metrics, organizational insights, and strategic analytics.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getEnterpriseAnalyticsSystem } from '../../productivity/analytics/EnterpriseAnalyticsSystem';
import type { 
  EnterpriseAnalyticsProfile,
  TeamMetrics,
  OrganizationalInsights,
  BusinessIntelligence,
  StrategicAnalytics,
  PerformanceDashboard,
  KPIAnalytics,
  DepartmentMetrics,
  EmployeeAnalytics,
  ProductivityAnalytics,
  CostAnalytics,
  RevenueAnalytics,
  RiskAnalytics,
  ComplianceAnalytics,
  EnterpriseConfig,
  EnterpriseRequest,
  EnterpriseResponse,
  AnalyticsReport,
  DataVisualization,
  TrendAnalysis,
  ForecastingModel,
  AlertSystem,
  EnterpriseAlert,
  DataExport,
  AnalyticsSettings
} from '../../productivity/analytics/EnterpriseAnalyticsSystem';

interface UseEnterpriseAnalyticsState {
  profile: EnterpriseAnalyticsProfile | null;
  teamMetrics: TeamMetrics[];
  organizationalInsights: OrganizationalInsights | null;
  businessIntelligence: BusinessIntelligence | null;
  strategicAnalytics: StrategicAnalytics | null;
  performanceDashboard: PerformanceDashboard | null;
  kpiAnalytics: KPIAnalytics | null;
  departmentMetrics: DepartmentMetrics[];
  employeeAnalytics: EmployeeAnalytics[];
  productivityAnalytics: ProductivityAnalytics | null;
  costAnalytics: CostAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  riskAnalytics: RiskAnalytics | null;
  complianceAnalytics: ComplianceAnalytics | null;
  reports: AnalyticsReport[];
  visualizations: DataVisualization[];
  trendAnalysis: TrendAnalysis[];
  forecasting: ForecastingModel[];
  alerts: EnterpriseAlert[];
  settings: AnalyticsSettings | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseEnterpriseAnalyticsActions {
  initialize: (config: EnterpriseConfig) => Promise<void>;
  generateReport: (reportType: string, parameters: any) => Promise<AnalyticsReport | null>;
  exportData: (dataType: string, format: string) => Promise<DataExport | null>;
  createVisualization: (chartType: string, dataSource: string) => Promise<DataVisualization | null>;
  analyzeTrends: (timeframe: number, metrics: string[]) => Promise<TrendAnalysis[]>;
  generateForecast: (modelType: string, parameters: any) => Promise<ForecastingModel | null>;
  createAlert: (alertConfig: Partial<EnterpriseAlert>) => Promise<EnterpriseAlert | null>;
  updateSettings: (settings: Partial<AnalyticsSettings>) => Promise<boolean>;
  refreshMetrics: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseEnterpriseAnalyticsReturn extends UseEnterpriseAnalyticsState, UseEnterpriseAnalyticsActions {
  isReady: boolean;
  hasProfile: boolean;
  hasMetrics: boolean;
  hasInsights: boolean;
  hasReports: boolean;
  hasAlerts: boolean;
  canGenerateReports: boolean;
  canExportData: boolean;
  isGeneratingReport: boolean;
  totalTeams: number;
  totalEmployees: number;
  totalDepartments: number;
  overallPerformance: number;
  riskLevel: number;
  complianceScore: number;
}

export function useEnterpriseAnalytics(organizationId: string): UseEnterpriseAnalyticsReturn {
  const [state, setState] = useState<UseEnterpriseAnalyticsState>({
    profile: null,
    teamMetrics: [],
    organizationalInsights: null,
    businessIntelligence: null,
    strategicAnalytics: null,
    performanceDashboard: null,
    kpiAnalytics: null,
    departmentMetrics: [],
    employeeAnalytics: [],
    productivityAnalytics: null,
    costAnalytics: null,
    revenueAnalytics: null,
    riskAnalytics: null,
    complianceAnalytics: null,
    reports: [],
    visualizations: [],
    trendAnalysis: [],
    forecasting: [],
    alerts: [],
    settings: null,
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize enterprise analytics system
  const initialize = useCallback(async (config: EnterpriseConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getEnterpriseAnalyticsSystem(organizationId);
      await system.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        refreshMetrics(),
        refreshInsights(),
        refreshDashboard(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize enterprise analytics',
      }));
    }
  }, [organizationId]);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const [
        teamMetrics,
        departmentMetrics,
        employeeAnalytics,
        productivityAnalytics,
        costAnalytics,
        revenueAnalytics,
        riskAnalytics,
        complianceAnalytics,
      ] = await Promise.all([
        system.getTeamMetrics(),
        system.getDepartmentMetrics(),
        system.getEmployeeAnalytics(),
        system.getProductivityAnalytics(),
        system.getCostAnalytics(),
        system.getRevenueAnalytics(),
        system.getRiskAnalytics(),
        system.getComplianceAnalytics(),
      ]);
      
      setState(prev => ({
        ...prev,
        teamMetrics,
        departmentMetrics,
        employeeAnalytics,
        productivityAnalytics,
        costAnalytics,
        revenueAnalytics,
        riskAnalytics,
        complianceAnalytics,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh metrics',
      }));
    }
  }, [organizationId, state.initialized]);

  // Refresh insights
  const refreshInsights = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const [
        organizationalInsights,
        businessIntelligence,
        strategicAnalytics,
        kpiAnalytics,
      ] = await Promise.all([
        system.getOrganizationalInsights(),
        system.getBusinessIntelligence(),
        system.getStrategicAnalytics(),
        system.getKPIAnalytics(),
      ]);
      
      setState(prev => ({
        ...prev,
        organizationalInsights,
        businessIntelligence,
        strategicAnalytics,
        kpiAnalytics,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh insights',
      }));
    }
  }, [organizationId, state.initialized]);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const [performanceDashboard, reports, visualizations, trendAnalysis, forecasting, alerts, settings] = await Promise.all([
        system.getPerformanceDashboard(),
        system.getReports(),
        system.getVisualizations(),
        system.getTrendAnalysis(),
        system.getForecasting(),
        system.getAlerts(),
        system.getSettings(),
      ]);
      
      setState(prev => ({
        ...prev,
        performanceDashboard,
        reports,
        visualizations,
        trendAnalysis,
        forecasting,
        alerts,
        settings,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh dashboard',
      }));
    }
  }, [organizationId, state.initialized]);

  // Generate report
  const generateReport = useCallback(async (reportType: string, parameters: any): Promise<AnalyticsReport | null> => {
    if (!state.initialized) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const report = await system.generateReport(reportType, parameters);
      
      if (report) {
        setState(prev => ({
          ...prev,
          reports: [report, ...prev.reports],
          loading: false,
          lastUpdated: Date.now(),
        }));
      }
      
      return report;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      }));
      return null;
    }
  }, [organizationId, state.initialized]);

  // Export data
  const exportData = useCallback(async (dataType: string, format: string): Promise<DataExport | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const exportData = await system.exportData(dataType, format);
      
      return exportData;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export data',
      }));
      return null;
    }
  }, [organizationId, state.initialized]);

  // Create visualization
  const createVisualization = useCallback(async (chartType: string, dataSource: string): Promise<DataVisualization | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const visualization = await system.createVisualization(chartType, dataSource);
      
      if (visualization) {
        setState(prev => ({
          ...prev,
          visualizations: [visualization, ...prev.visualizations],
          lastUpdated: Date.now(),
        }));
      }
      
      return visualization;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create visualization',
      }));
      return null;
    }
  }, [organizationId, state.initialized]);

  // Analyze trends
  const analyzeTrends = useCallback(async (timeframe: number, metrics: string[]): Promise<TrendAnalysis[]> => {
    if (!state.initialized) return [];
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const trends = await system.analyzeTrends(timeframe, metrics);
      
      if (trends) {
        setState(prev => ({
          ...prev,
          trendAnalysis: [...prev.trendAnalysis, ...trends],
          lastUpdated: Date.now(),
        }));
      }
      
      return trends;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze trends',
      }));
      return [];
    }
  }, [organizationId, state.initialized]);

  // Generate forecast
  const generateForecast = useCallback(async (modelType: string, parameters: any): Promise<ForecastingModel | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const forecast = await system.generateForecast(modelType, parameters);
      
      if (forecast) {
        setState(prev => ({
          ...prev,
          forecasting: [forecast, ...prev.forecasting],
          lastUpdated: Date.now(),
        }));
      }
      
      return forecast;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate forecast',
      }));
      return null;
    }
  }, [organizationId, state.initialized]);

  // Create alert
  const createAlert = useCallback(async (alertConfig: Partial<EnterpriseAlert>): Promise<EnterpriseAlert | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const alert = await system.createAlert(alertConfig);
      
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
  }, [organizationId, state.initialized]);

  // Update settings
  const updateSettings = useCallback(async (settings: Partial<AnalyticsSettings>): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getEnterpriseAnalyticsSystem(organizationId);
      const success = await system.updateSettings(settings);
      
      if (success) {
        setState(prev => ({
          ...prev,
          settings: { ...prev.settings, ...settings },
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
  }, [organizationId, state.initialized]);

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
        refreshMetrics(),
        refreshInsights(),
        refreshDashboard(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, refreshMetrics, refreshInsights, refreshDashboard, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasProfile = useMemo(() => state.profile !== null, [state.profile]);
  const hasMetrics = useMemo(() => state.teamMetrics.length > 0, [state.teamMetrics.length]);
  const hasInsights = useMemo(() => state.organizationalInsights !== null, [state.organizationalInsights]);
  const hasReports = useMemo(() => state.reports.length > 0, [state.reports.length]);
  const hasAlerts = useMemo(() => state.alerts.length > 0, [state.alerts.length]);

  const canGenerateReports = useMemo(() => 
    state.initialized && hasMetrics,
    [state.initialized, hasMetrics]
  );

  const canExportData = useMemo(() => 
    state.initialized && hasMetrics,
    [state.initialized, hasMetrics]
  );

  const isGeneratingReport = useMemo(() => state.loading, [state.loading]);

  const totalTeams = useMemo(() => state.teamMetrics.length, [state.teamMetrics.length]);
  const totalEmployees = useMemo(() => state.employeeAnalytics.length, [state.employeeAnalytics.length]);
  const totalDepartments = useMemo(() => state.departmentMetrics.length, [state.departmentMetrics.length]);

  const overallPerformance = useMemo(() => 
    state.performanceDashboard?.overallScore || 0,
    [state.performanceDashboard]
  );

  const riskLevel = useMemo(() => 
    state.riskAnalytics?.overallRiskLevel || 0,
    [state.riskAnalytics]
  );

  const complianceScore = useMemo(() => 
    state.complianceAnalytics?.overallScore || 0,
    [state.complianceAnalytics]
  );

  // Auto-refresh data periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      refreshMetrics();
      refreshInsights();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [state.initialized, refreshMetrics, refreshInsights]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
    generateReport,
    exportData,
    createVisualization,
    analyzeTrends,
    generateForecast,
    createAlert,
    updateSettings,
    refreshMetrics,
    refreshInsights,
    refreshDashboard,
    clearError,
    retry,
    isReady,
    hasProfile,
    hasMetrics,
    hasInsights,
    hasReports,
    hasAlerts,
    canGenerateReports,
    canExportData,
    isGeneratingReport,
    totalTeams,
    totalEmployees,
    totalDepartments,
    overallPerformance,
    riskLevel,
    complianceScore,
  };
}
