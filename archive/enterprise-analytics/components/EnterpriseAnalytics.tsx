/**
 * Enterprise Analytics Component
 * 
 * Main UI component for enterprise analytics with comprehensive business intelligence,
 * team performance metrics, organizational insights, and strategic analytics.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useEnterpriseAnalytics } from '../hooks/useEnterpriseAnalytics';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

interface EnterpriseAnalyticsProps {
  organizationId: string;
  onReportPress?: (report: any) => void;
  onTeamPress?: (team: any) => void;
  onDepartmentPress?: (department: any) => void;
}

export function EnterpriseAnalytics({ 
  organizationId, 
  onReportPress, 
  onTeamPress, 
  onDepartmentPress 
}: EnterpriseAnalyticsProps) {
  const {
    profile,
    teamMetrics,
    organizationalInsights,
    businessIntelligence,
    strategicAnalytics,
    performanceDashboard,
    kpiAnalytics,
    departmentMetrics,
    employeeAnalytics,
    productivityAnalytics,
    costAnalytics,
    revenueAnalytics,
    riskAnalytics,
    complianceAnalytics,
    reports,
    visualizations,
    trendAnalysis,
    forecasting,
    alerts,
    settings,
    loading,
    error,
    initialized,
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
  } = useEnterpriseAnalytics(organizationId);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'teams' | 'departments' | 'reports' | 'insights'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableBusinessIntelligence: true,
        enableStrategicAnalytics: true,
        enableRealTimeMonitoring: true,
        enablePredictiveAnalytics: true,
        enableComplianceTracking: true,
        supportedDataSources: ['hr-system', 'crm', 'erp', 'productivity-tools'],
        reportingFrequency: 'daily',
        alertThresholds: {
          performance: 0.7,
          risk: 0.8,
          compliance: 0.9,
        },
      });
    }
  }, [initialized]);

  // Handle report generation
  const handleGenerateReport = async (reportType: string) => {
    const report = await generateReport(reportType, {
      timeframe: '30d',
      includeCharts: true,
      format: 'pdf',
    });
    if (report) {
      Alert.alert('Success', 'Report generated successfully!');
      setSelectedTab('reports');
    } else {
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const handleExportData = async (dataType: string, format: string) => {
    const exportData = await exportData(dataType, format);
    if (exportData) {
      Alert.alert('Success', 'Data exported successfully!');
    } else {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleGenerateForecast = async (modelType: string) => {
    const forecast = await generateForecast(modelType, {
      timeframe: '90d',
      confidence: 0.95,
      variables: ['performance', 'cost', 'revenue'],
    });
    if (forecast) {
      Alert.alert('Success', 'Forecast generated successfully!');
    } else {
      Alert.alert('Error', 'Failed to generate forecast');
    }
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading message="Loading Enterprise Analytics..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="Enterprise Analytics Error"
        message={error}
        onRetry={retry}
        onDismiss={clearError}
      />
    );
  }

  // Empty state
  if (!hasProfile && isReady) {
    return (
      <EmptyState
        title="Welcome to Enterprise Analytics"
        message="Get comprehensive business intelligence and organizational insights."
        icon="📊"
        action={{
          title: "Get Started",
          onPress: () => {},
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Enterprise Analytics</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalTeams}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalDepartments}</Text>
            <Text style={styles.statLabel}>Departments</Text>
          </View>
        </View>
      </View>

      {/* Performance Overview */}
      <View style={styles.performanceContainer}>
        <View style={styles.performanceHeader}>
          <Text style={styles.performanceTitle}>Performance Overview</Text>
          <Badge text={overallPerformance > 80 ? 'Excellent' : overallPerformance > 60 ? 'Good' : 'Needs Improvement'} color={overallPerformance > 80 ? '#27AE60' : overallPerformance > 60 ? '#F39C12' : '#E74C3C'} size="small" />
        </View>
        <ProgressBar progress={overallPerformance} color="#3498DB" />
        <Text style={styles.performanceDescription}>
          Overall Performance: {Math.round(overallPerformance)}%
        </Text>
      </View>

      {/* Risk and Compliance */}
      <View style={styles.riskContainer}>
        <View style={styles.riskItems}>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Risk Level</Text>
            <ProgressBar progress={riskLevel} color={riskLevel > 0.7 ? '#E74C3C' : riskLevel > 0.4 ? '#F39C12' : '#27AE60'} />
            <Text style={styles.riskValue}>{Math.round(riskLevel * 100)}%</Text>
          </View>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Compliance</Text>
            <ProgressBar progress={complianceScore} color="#27AE60" />
            <Text style={styles.riskValue}>{Math.round(complianceScore)}%</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'teams' && styles.activeTab]}
          onPress={() => setSelectedTab('teams')}
        >
          <Text style={[styles.tabText, selectedTab === 'teams' && styles.activeTabText]}>
            Teams ({totalTeams})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'departments' && styles.activeTab]}
          onPress={() => setSelectedTab('departments')}
        >
          <Text style={[styles.tabText, selectedTab === 'departments' && styles.activeTabText]}>
            Departments ({totalDepartments})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reports' && styles.activeTab]}
          onPress={() => setSelectedTab('reports')}
        >
          <Text style={[styles.tabText, selectedTab === 'reports' && styles.activeTabText]}>
            Reports ({reports.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'insights' && styles.activeTab]}
          onPress={() => setSelectedTab('insights')}
        >
          <Text style={[styles.tabText, selectedTab === 'insights' && styles.activeTabText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <OverviewTab
            performanceDashboard={performanceDashboard}
            kpiAnalytics={kpiAnalytics}
            productivityAnalytics={productivityAnalytics}
            costAnalytics={costAnalytics}
            revenueAnalytics={revenueAnalytics}
            riskAnalytics={riskAnalytics}
            complianceAnalytics={complianceAnalytics}
            alerts={alerts}
            onGenerateReport={() => setShowReportModal(true)}
            onExportData={() => setShowExportModal(true)}
            onForecast={() => setShowForecastModal(true)}
          />
        )}

        {selectedTab === 'teams' && (
          <TeamsTab
            teamMetrics={teamMetrics}
            onTeamPress={onTeamPress}
          />
        )}

        {selectedTab === 'departments' && (
          <DepartmentsTab
            departmentMetrics={departmentMetrics}
            onDepartmentPress={onDepartmentPress}
          />
        )}

        {selectedTab === 'reports' && (
          <ReportsTab
            reports={reports}
            onReportPress={onReportPress}
            onGenerateReport={handleGenerateReport}
            canGenerateReports={canGenerateReports}
            isGeneratingReport={isGeneratingReport}
          />
        )}

        {selectedTab === 'insights' && (
          <InsightsTab
            organizationalInsights={organizationalInsights}
            businessIntelligence={businessIntelligence}
            strategicAnalytics={strategicAnalytics}
            trendAnalysis={trendAnalysis}
            forecasting={forecasting}
            visualizations={visualizations}
          />
        )}
      </ScrollView>

      {/* Report Generation Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Report</Text>
            <Text style={styles.modalDescription}>
              Choose the type of report to generate for your organization.
            </Text>
            
            <Button
              title="Performance Report"
              onPress={() => handleGenerateReport('performance')}
              style={styles.modalButton}
            />

            <Button
              title="Financial Report"
              onPress={() => handleGenerateReport('financial')}
              style={styles.modalButton}
            />

            <Button
              title="Compliance Report"
              onPress={() => handleGenerateReport('compliance')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Data</Text>
            <Text style={styles.modalDescription}>
              Export analytics data in your preferred format.
            </Text>
            
            <Button
              title="Export to CSV"
              onPress={() => handleExportData('metrics', 'csv')}
              style={styles.modalButton}
            />

            <Button
              title="Export to Excel"
              onPress={() => handleExportData('metrics', 'excel')}
              style={styles.modalButton}
            />

            <Button
              title="Export to PDF"
              onPress={() => handleExportData('dashboard', 'pdf')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Forecast Modal */}
      <Modal
        visible={showForecastModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowForecastModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Forecast</Text>
            <Text style={styles.modalDescription}>
              Create predictive forecasts for business metrics.
            </Text>
            
            <Button
              title="Performance Forecast"
              onPress={() => handleGenerateForecast('performance')}
              style={styles.modalButton}
            />

            <Button
              title="Revenue Forecast"
              onPress={() => handleGenerateForecast('revenue')}
              style={styles.modalButton}
            />

            <Button
              title="Cost Forecast"
              onPress={() => handleGenerateForecast('cost')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowForecastModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Overview Tab Component
function OverviewTab({ 
  performanceDashboard, 
  kpiAnalytics, 
  productivityAnalytics, 
  costAnalytics, 
  revenueAnalytics, 
  riskAnalytics, 
  complianceAnalytics, 
  alerts, 
  onGenerateReport, 
  onExportData, 
  onForecast 
}: any) {
  return (
    <View style={styles.tabContent}>
      {/* KPI Dashboard */}
      {kpiAnalytics && (
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{Math.round(kpiAnalytics.productivity * 100)}%</Text>
              <Text style={styles.kpiLabel}>Productivity</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{Math.round(kpiAnalytics.efficiency * 100)}%</Text>
              <Text style={styles.kpiLabel}>Efficiency</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{Math.round(kpiAnalytics.engagement * 100)}%</Text>
              <Text style={styles.kpiLabel}>Engagement</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{Math.round(kpiAnalytics.satisfaction * 100)}%</Text>
              <Text style={styles.kpiLabel}>Satisfaction</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Productivity Analytics */}
      {productivityAnalytics && (
        <Card style={styles.productivityCard}>
          <Text style={styles.productivityTitle}>Productivity Analytics</Text>
          <ProgressBar progress={productivityAnalytics.overallProductivity * 100} color="#3498DB" />
          <Text style={styles.productivityDescription}>
            Overall productivity is {productivityAnalytics.overallProductivity > 0.7 ? 'excellent' : productivityAnalytics.overallProductivity > 0.5 ? 'good' : 'needs improvement'}
          </Text>
          <View style={styles.productivityMetrics}>
            <Text style={styles.productivityMetric}>
              Output per employee: {productivityAnalytics.outputPerEmployee}
            </Text>
            <Text style={styles.productivityMetric}>
              Time efficiency: {Math.round(productivityAnalytics.timeEfficiency * 100)}%
            </Text>
          </View>
        </Card>
      )}

      {/* Financial Analytics */}
      <View style={styles.financialContainer}>
        <Card style={styles.revenueCard}>
          <Text style={styles.revenueTitle}>Revenue Analytics</Text>
          {revenueAnalytics && (
            <>
              <Text style={styles.revenueAmount}>${(revenueAnalytics.totalRevenue / 1000000).toFixed(1)}M</Text>
              <Text style={styles.revenueGrowth}>
                Growth: {revenueAnalytics.growthRate > 0 ? '+' : ''}{revenueAnalytics.growthRate}%
              </Text>
              <ProgressBar progress={revenueAnalytics.targetAchievement * 100} color="#27AE60" />
            </>
          )}
        </Card>

        <Card style={styles.costCard}>
          <Text style={styles.costTitle}>Cost Analytics</Text>
          {costAnalytics && (
            <>
              <Text style={styles.costAmount}>${(costAnalytics.totalCost / 1000000).toFixed(1)}M</Text>
              <Text style={styles.costEfficiency}>
                Efficiency: {Math.round(costAnalytics.efficiency * 100)}%
              </Text>
              <ProgressBar progress={costAnalytics.budgetUtilization * 100} color={costAnalytics.budgetUtilization > 0.8 ? '#E74C3C' : '#27AE60'} />
            </>
          )}
        </Card>
      </View>

      {/* Risk and Compliance */}
      <View style={styles.riskComplianceContainer}>
        <Card style={styles.riskCard}>
          <Text style={styles.riskCardTitle}>Risk Analytics</Text>
          {riskAnalytics && (
            <>
              <Text style={styles.riskLevel}>
                Overall Risk: {riskAnalytics.overallRiskLevel > 0.7 ? 'High' : riskAnalytics.overallRiskLevel > 0.4 ? 'Medium' : 'Low'}
              </Text>
              <ProgressBar progress={riskAnalytics.overallRiskLevel * 100} color={riskAnalytics.overallRiskLevel > 0.7 ? '#E74C3C' : riskAnalytics.overallRiskLevel > 0.4 ? '#F39C12' : '#27AE60'} />
              <Text style={styles.riskFactors}>
                Top risks: {riskAnalytics.topRisks.slice(0, 2).join(', ')}
              </Text>
            </>
          )}
        </Card>

        <Card style={styles.complianceCard}>
          <Text style={styles.complianceCardTitle}>Compliance Analytics</Text>
          {complianceAnalytics && (
            <>
              <Text style={styles.complianceScore}>
                Compliance Score: {Math.round(complianceAnalytics.overallScore)}%
              </Text>
              <ProgressBar progress={complianceAnalytics.overallScore} color="#27AE60" />
              <Text style={styles.complianceStatus}>
                Status: {complianceAnalytics.overallScore > 0.9 ? 'Excellent' : complianceAnalytics.overallScore > 0.8 ? 'Good' : 'Needs Attention'}
              </Text>
            </>
          )}
        </Card>
      </View>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <Card style={styles.alertsCard}>
          <Text style={styles.alertsTitle}>Active Alerts</Text>
          {alerts.slice(0, 3).map((alert: any) => (
            <View key={alert.id} style={styles.alertItem}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={onGenerateReport}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Generate Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={onExportData}>
            <Text style={styles.quickActionIcon}>📤</Text>
            <Text style={styles.quickActionText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={onForecast}>
            <Text style={styles.quickActionIcon}>🔮</Text>
            <Text style={styles.quickActionText}>Forecast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Teams Tab Component
function TeamsTab({ teamMetrics, onTeamPress }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.teamsHeader}>
        <Text style={styles.teamsTitle}>Team Performance</Text>
      </View>

      {teamMetrics.length === 0 ? (
        <EmptyState
          title="No Team Data"
          message="Team performance metrics will appear here once data is available"
          icon="👥"
        />
      ) : (
        teamMetrics.map((team: any) => (
          <TeamCard
            key={team.id}
            team={team}
            onPress={() => onTeamPress?.(team)}
          />
        ))
      )}
    </View>
  );
}

// Team Card Component
function TeamCard({ team, onPress }: any) {
  return (
    <Card style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Badge 
          text={team.performance > 0.8 ? 'Excellent' : team.performance > 0.6 ? 'Good' : 'Needs Improvement'} 
          color={team.performance > 0.8 ? '#27AE60' : team.performance > 0.6 ? '#F39C12' : '#E74C3C'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.teamDescription}>{team.description}</Text>
      
      <View style={styles.teamMetrics}>
        <View style={styles.teamMetric}>
          <Text style={styles.teamMetricLabel}>Performance</Text>
          <ProgressBar progress={team.performance * 100} color="#3498DB" />
        </View>
        <View style={styles.teamMetric}>
          <Text style={styles.teamMetricLabel}>Productivity</Text>
          <ProgressBar progress={team.productivity * 100} color="#27AE60" />
        </View>
        <View style={styles.teamMetric}>
          <Text style={styles.teamMetricLabel}>Efficiency</Text>
          <ProgressBar progress={team.efficiency * 100} color="#9B59B6" />
        </View>
      </View>

      <View style={styles.teamFooter}>
        <TouchableOpacity style={styles.teamDetailsButton} onPress={onPress}>
          <Text style={styles.teamDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Departments Tab Component
function DepartmentsTab({ departmentMetrics, onDepartmentPress }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.departmentsHeader}>
        <Text style={styles.departmentsTitle}>Department Analytics</Text>
      </View>

      {departmentMetrics.length === 0 ? (
        <EmptyState
          title="No Department Data"
          message="Department analytics will appear here once data is available"
          icon="🏢"
        />
      ) : (
        departmentMetrics.map((department: any) => (
          <DepartmentCard
            key={department.id}
            department={department}
            onPress={() => onDepartmentPress?.(department)}
          />
        ))
      )}
    </View>
  );
}

// Department Card Component
function DepartmentCard({ department, onPress }: any) {
  return (
    <Card style={styles.departmentCard}>
      <View style={styles.departmentHeader}>
        <Text style={styles.departmentName}>{department.name}</Text>
        <Badge 
          text={department.status} 
          color={department.status === 'Active' ? '#27AE60' : '#95A5A6'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.departmentDescription}>{department.description}</Text>
      
      <View style={styles.departmentMetrics}>
        <Text style={styles.departmentMetric}>
          Employees: {department.employeeCount}
        </Text>
        <Text style={styles.departmentMetric}>
          Budget: ${(department.budget / 1000000).toFixed(1)}M
        </Text>
        <Text style={styles.departmentMetric}>
          Performance: {Math.round(department.performance * 100)}%
        </Text>
      </View>

      <View style={styles.departmentFooter}>
        <TouchableOpacity style={styles.departmentDetailsButton} onPress={onPress}>
          <Text style={styles.departmentDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Reports Tab Component
function ReportsTab({ reports, onReportPress, onGenerateReport, canGenerateReports, isGeneratingReport }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.reportsHeader}>
        <Text style={styles.reportsTitle}>Analytics Reports</Text>
        <TouchableOpacity 
          style={[styles.generateButton, !canGenerateReports && styles.disabledButton]}
          onPress={() => onGenerateReport('performance')}
          disabled={!canGenerateReports || isGeneratingReport}
        >
          <Text style={styles.generateButtonText}>
            {isGeneratingReport ? 'Generating...' : '+ Generate'}
          </Text>
        </TouchableOpacity>
      </View>

      {reports.length === 0 ? (
        <EmptyState
          title="No Reports"
          message="Generate your first analytics report to get insights into your organization"
          icon="📊"
        />
      ) : (
        reports.map((report: any) => (
          <ReportCard
            key={report.id}
            report={report}
            onPress={() => onReportPress?.(report)}
          />
        ))
      )}
    </View>
  );
}

// Report Card Component
function ReportCard({ report, onPress }: any) {
  return (
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Badge 
          text={report.status} 
          color={report.status === 'Completed' ? '#27AE60' : report.status === 'Generating' ? '#F39C12' : '#95A5A6'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.reportDescription}>{report.description}</Text>
      <Text style={styles.reportDate}>
        Generated {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true })}
      </Text>

      <View style={styles.reportFooter}>
        <TouchableOpacity style={styles.reportDetailsButton} onPress={onPress}>
          <Text style={styles.reportDetailsText}>View Report</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Insights Tab Component
function InsightsTab({ 
  organizationalInsights, 
  businessIntelligence, 
  strategicAnalytics, 
  trendAnalysis, 
  forecasting, 
  visualizations 
}: any) {
  return (
    <View style={styles.tabContent}>
      {/* Organizational Insights */}
      {organizationalInsights && (
        <Card style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Organizational Insights</Text>
          <Text style={styles.insightsDescription}>{organizationalInsights.summary}</Text>
          <View style={styles.insightsMetrics}>
            <Text style={styles.insightsMetric}>
              Strengths: {organizationalInsights.strengths.join(', ')}
            </Text>
            <Text style={styles.insightsMetric}>
              Areas for improvement: {organizationalInsights.improvements.join(', ')}
            </Text>
          </View>
        </Card>
      )}

      {/* Business Intelligence */}
      {businessIntelligence && (
        <Card style={styles.biCard}>
          <Text style={styles.biTitle}>Business Intelligence</Text>
          <Text style={styles.biDescription}>{businessIntelligence.executiveSummary}</Text>
          <View style={styles.biMetrics}>
            <Text style={styles.biMetric}>
              Market position: {businessIntelligence.marketPosition}
            </Text>
            <Text style={styles.biMetric}>
              Competitive advantage: {businessIntelligence.competitiveAdvantage}
            </Text>
          </View>
        </Card>
      )}

      {/* Strategic Analytics */}
      {strategicAnalytics && (
        <Card style={styles.strategicCard}>
          <Text style={styles.strategicTitle}>Strategic Analytics</Text>
          <Text style={styles.strategicDescription}>{strategicAnalytics.strategicRecommendations}</Text>
          <View style={styles.strategicMetrics}>
            <Text style={styles.strategicMetric}>
              Strategic alignment: {Math.round(strategicAnalytics.alignment * 100)}%
            </Text>
            <Text style={styles.strategicMetric}>
              Goal achievement: {Math.round(strategicAnalytics.goalAchievement * 100)}%
            </Text>
          </View>
        </Card>
      )}

      {/* Trend Analysis */}
      {trendAnalysis && trendAnalysis.length > 0 && (
        <Card style={styles.trendsCard}>
          <Text style={styles.trendsTitle}>Trend Analysis</Text>
          {trendAnalysis.slice(0, 3).map((trend: any) => (
            <View key={trend.id} style={styles.trendItem}>
              <Text style={styles.trendName}>{trend.name}</Text>
              <Text style={styles.trendDirection}>
                {trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'} {trend.change}%
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Forecasting */}
      {forecasting && forecasting.length > 0 && (
        <Card style={styles.forecastingCard}>
          <Text style={styles.forecastingTitle}>Forecasting Models</Text>
          {forecasting.slice(0, 2).map((forecast: any) => (
            <View key={forecast.id} style={styles.forecastItem}>
              <Text style={styles.forecastName}>{forecast.name}</Text>
              <Text style={styles.forecastAccuracy}>
                Accuracy: {Math.round(forecast.accuracy * 100)}%
              </Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  performanceContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  performanceDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
  riskContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  riskItems: {
    gap: 16,
  },
  riskItem: {
    gap: 8,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  riskValue: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498DB',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#3498DB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  kpiCard: {
    padding: 20,
    marginBottom: 16,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  productivityCard: {
    padding: 20,
    marginBottom: 16,
  },
  productivityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  productivityDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  productivityMetrics: {
    gap: 8,
  },
  productivityMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  financialContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  revenueCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  revenueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 4,
  },
  revenueGrowth: {
    fontSize: 12,
    color: '#27AE60',
    marginBottom: 8,
  },
  costCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  costTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 4,
  },
  costEfficiency: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  riskComplianceContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  riskCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  riskCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 8,
  },
  riskFactors: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  complianceCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  complianceCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  complianceScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 8,
  },
  complianceStatus: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  alertsCard: {
    padding: 16,
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  alertItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  alertMessage: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  quickActionsContainer: {
    marginTop: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  teamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  teamCard: {
    padding: 16,
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  teamDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  teamMetrics: {
    gap: 8,
    marginBottom: 12,
  },
  teamMetric: {
    gap: 4,
  },
  teamMetricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  teamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  teamDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  departmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  departmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  departmentCard: {
    padding: 16,
    marginBottom: 16,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  departmentDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  departmentMetrics: {
    gap: 4,
    marginBottom: 12,
  },
  departmentMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  departmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  departmentDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  departmentDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  generateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reportCard: {
    padding: 16,
    marginBottom: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  reportDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  reportDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsCard: {
    padding: 20,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  insightsDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  insightsMetrics: {
    gap: 8,
  },
  insightsMetric: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  biCard: {
    padding: 20,
    marginBottom: 16,
  },
  biTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  biDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  biMetrics: {
    gap: 8,
  },
  biMetric: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  strategicCard: {
    padding: 20,
    marginBottom: 16,
  },
  strategicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  strategicDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  strategicMetrics: {
    gap: 8,
  },
  strategicMetric: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  trendsCard: {
    padding: 20,
    marginBottom: 16,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  trendName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  trendDirection: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  forecastingCard: {
    padding: 20,
  },
  forecastingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  forecastName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  forecastAccuracy: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#3498DB',
    marginBottom: 12,
  },
  modalCancel: {
    alignItems: 'center',
    padding: 12,
  },
  modalCancelText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
});
