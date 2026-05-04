/**
 * Impact Measurement Component
 * 
 * Main UI component for impact measurement features including environmental impact
 * tracking, social impact metrics, economic impact analysis, sustainability reporting,
 * and carbon footprint calculation.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { useImpactMeasurement } from '../hooks/useImpactMeasurement';

interface ImpactMeasurementProps {
  userId: string;
  onMetricPress?: (metric: any) => void;
  onReportPress?: (report: any) => void;
  onGoalPress?: (goal: any) => void;
  onAlertPress?: (alert: any) => void;
}

export function ImpactMeasurement({
  userId,
  onMetricPress,
  onReportPress,
  onGoalPress,
  onAlertPress,
}: ImpactMeasurementProps) {
  const {
    metrics,
    reports,
    sustainabilityGoals,
    alerts,
    carbonFootprints,
    impactSummary,
    loading,
    error,
    refreshData,
    acknowledgeAlert,
  } = useImpactMeasurement(userId);

  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'reports' | 'carbon'>('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateMetricModal, setShowCreateMetricModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);

  useEffect(() => {
    refreshData();
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      environmental: '#10b981',
      social: '#3b82f6',
      economic: '#f59e0b',
      sustainability: '#8b5cf6',
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const getGoalStatusColor = (status: string) => {
    const colors = {
      'on-track': '#10b981',
      'at-risk': '#f59e0b',
      'behind': '#ef4444',
      'completed': '#3b82f6',
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Impact Summary Cards */}
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Metrics</Text>
          <Text style={styles.summaryValue}>{impactSummary.totalMetrics}</Text>
          <Text style={styles.summarySubtitle}>Tracked</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Improving</Text>
          <Text style={styles.summaryValue}>{impactSummary.improvingMetrics}</Text>
          <Text style={styles.summarySubtitle}>Metrics</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Goals on Track</Text>
          <Text style={styles.summaryValue}>{Math.round(impactSummary.goalsProgress)}%</Text>
          <Text style={styles.summarySubtitle}>Progress</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Carbon Emissions</Text>
          <Text style={styles.summaryValue}>{impactSummary.totalCarbonEmissions}</Text>
          <Text style={styles.summarySubtitle}>kg CO2e</Text>
        </Card>
      </View>

      {/* Recent Alerts */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Card style={styles.alertsCard}>
          <Text style={styles.sectionTitle}>🚨 Active Alerts</Text>
          <View style={styles.alertsList}>
            {alerts.filter(a => !a.acknowledged).slice(0, 3).map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => onAlertPress?.(alert)}
              >
                <View style={styles.alertHeader}>
                  <Badge text={alert.severity} variant="warning" />
                  <Text style={styles.alertTime}>{alert.timestamp.toLocaleTimeString()}</Text>
                </View>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.actionRequired && (
                  <Button
                    title="Take Action"
                    onPress={() => acknowledgeAlert(alert.id)}
                    variant="primary"
                    style={styles.alertAction}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Key Metrics */}
      <Card style={styles.metricsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          <Button
            title="Add Metric"
            onPress={() => setShowCreateMetricModal(true)}
            variant="secondary"
            style={styles.addButton}
          />
        </View>
        <View style={styles.metricsList}>
          {metrics.slice(0, 4).map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={styles.metricItem}
              onPress={() => onMetricPress?.(metric)}
            >
              <View style={styles.metricHeader}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={styles.metricTrend}>
                  {getTrendIcon(metric.trend)} {metric.trend}
                </Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {metric.value} {metric.unit}
                </Text>
                <Text style={styles.metricTarget}>
                  Target: {metric.target} {metric.unit}
                </Text>
              </View>
              <ProgressBar
                progress={(metric.value / metric.target) * 100}
                color={getCategoryColor(metric.category)}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Sustainability Goals */}
      <Card style={styles.goalsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Sustainability Goals</Text>
          <Button
            title="Add Goal"
            onPress={() => setShowCreateGoalModal(true)}
            variant="secondary"
            style={styles.addButton}
          />
        </View>
        <View style={styles.goalsList}>
          {sustainabilityGoals.slice(0, 3).map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalItem}
              onPress={() => onGoalPress?.(goal)}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Badge text={goal.status} variant="primary" />
              </View>
              <View style={styles.goalProgress}>
                <Text style={styles.goalProgressText}>
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </Text>
                <ProgressBar
                  progress={(goal.currentValue / goal.targetValue) * 100}
                  color={getGoalStatusColor(goal.status)}
                />
              </View>
              <Text style={styles.goalDeadline}>
                Deadline: {goal.deadline.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </ScrollView>
  );

  const renderMetrics = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Category:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryFilters}>
            {['all', 'environmental', 'social', 'economic', 'sustainability'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilter,
                  selectedCategory === category && styles.activeCategoryFilter,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === category && styles.activeCategoryFilterText,
                ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Metrics List */}
      <View style={styles.metricsContainer}>
        {metrics
          .filter(metric => selectedCategory === 'all' || metric.category === selectedCategory)
          .map((metric) => (
            <Card key={metric.id} style={styles.metricCard}>
              <TouchableOpacity onPress={() => onMetricPress?.(metric)}>
                <View style={styles.metricCardHeader}>
                  <Text style={styles.metricCardName}>{metric.name}</Text>
                  <View style={styles.metricCardMeta}>
                    <Badge text={metric.category} variant="primary" />
                    <Text style={styles.metricCardTrend}>
                      {getTrendIcon(metric.trend)} {metric.trend}
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricCardDescription}>{metric.description}</Text>
                <View style={styles.metricCardValues}>
                  <View style={styles.metricCardValue}>
                    <Text style={styles.metricCardValueText}>Current:</Text>
                    <Text style={styles.metricCardValueNumber}>
                      {metric.value} {metric.unit}
                    </Text>
                  </View>
                  <View style={styles.metricCardValue}>
                    <Text style={styles.metricCardValueText}>Target:</Text>
                    <Text style={styles.metricCardValueNumber}>
                      {metric.target} {metric.unit}
                    </Text>
                  </View>
                  <View style={styles.metricCardValue}>
                    <Text style={styles.metricCardValueText}>Baseline:</Text>
                    <Text style={styles.metricCardValueNumber}>
                      {metric.baseline} {metric.unit}
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={(metric.value / metric.target) * 100}
                  color={getCategoryColor(metric.category)}
                  style={styles.metricProgressBar}
                />
                <Text style={styles.metricCardLastUpdated}>
                  Last updated: {metric.lastUpdated.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </Card>
          ))}
      </View>
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.reportsHeader}>
        <Text style={styles.sectionTitle}>📋 Impact Reports</Text>
        <Button
          title="Generate Report"
          onPress={() => setShowCreateReportModal(true)}
          variant="primary"
          style={styles.generateButton}
        />
      </View>

      <View style={styles.reportsContainer}>
        {reports.map((report) => (
          <Card key={report.id} style={styles.reportCard}>
            <TouchableOpacity onPress={() => onReportPress?.(report)}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Badge text={report.status} variant="primary" />
              </View>
              <View style={styles.reportMeta}>
                <Text style={styles.reportType}>{report.type}</Text>
                <Text style={styles.reportPeriod}>{report.period}</Text>
              </View>
              <View style={styles.reportInsights}>
                <Text style={styles.reportInsightsTitle}>Key Insights:</Text>
                {report.insights.slice(0, 2).map((insight, index) => (
                  <Text key={index} style={styles.reportInsight}>
                    • {insight}
                  </Text>
                ))}
              </View>
              <Text style={styles.reportDate}>
                Generated: {report.generatedAt.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  const renderCarbon = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.carbonHeader}>
        <Text style={styles.sectionTitle}>🌍 Carbon Footprint</Text>
        <Button
          title="Calculate Footprint"
          onPress={() => {}}
          variant="primary"
          style={styles.calculateButton}
        />
      </View>

      {/* Carbon Summary */}
      <Card style={styles.carbonSummaryCard}>
        <Text style={styles.carbonSummaryTitle}>Total Carbon Emissions</Text>
        <Text style={styles.carbonSummaryValue}>
          {impactSummary.totalCarbonEmissions} kg CO2e
        </Text>
        <View style={styles.carbonBreakdown}>
          <Text style={styles.carbonBreakdownTitle}>Breakdown by Source:</Text>
          {['energy', 'transport', 'materials', 'operations', 'supply_chain'].map((category) => {
            const categoryFootprints = carbonFootprints.filter(fp => fp.category === category);
            const total = categoryFootprints.reduce((sum, fp) => sum + fp.netEmissions, 0);
            return (
              <View key={category} style={styles.carbonBreakdownItem}>
                <Text style={styles.carbonBreakdownCategory}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </Text>
                <Text style={styles.carbonBreakdownValue}>{total} kg CO2e</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Carbon Footprints List */}
      <View style={styles.carbonListContainer}>
        {carbonFootprints.map((footprint) => (
          <Card key={footprint.id} style={styles.carbonCard}>
            <View style={styles.carbonCardHeader}>
              <Text style={styles.carbonCardTitle}>{footprint.activity}</Text>
              <Badge text={footprint.category} variant="secondary" />
            </View>
            <View style={styles.carbonCardValues}>
              <View style={styles.carbonCardValue}>
                <Text style={styles.carbonCardLabel}>Emissions:</Text>
                <Text style={styles.carbonCardAmount}>{footprint.netEmissions} kg CO2e</Text>
              </View>
              <View style={styles.carbonCardValue}>
                <Text style={styles.carbonCardLabel}>Date:</Text>
                <Text style={styles.carbonCardDate}>{footprint.date.toLocaleDateString()}</Text>
              </View>
            </View>
            <ProgressBar
              progress={Math.min((footprint.netEmissions / 100) * 100, 100)}
              color={getCategoryColor(footprint.category)}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'metrics': return renderMetrics();
      case 'reports': return renderReports();
      case 'carbon': return renderCarbon();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading impact data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading impact data</Text>
        <Button title="Retry" onPress={refreshData} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['overview', 'metrics', 'reports', 'carbon'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  summaryCard: {
    width: '50%',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  alertAction: {
    alignSelf: 'flex-start',
  },
  metricsCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metricsList: {
    gap: 16,
  },
  metricItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  metricTrend: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricValueContainer: {
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricTarget: {
    fontSize: 14,
    color: '#6b7280',
  },
  goalsCard: {
    marginBottom: 24,
  },
  goalsList: {
    gap: 16,
  },
  goalItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  goalProgress: {
    marginBottom: 12,
  },
  goalProgressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCategoryFilter: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeCategoryFilterText: {
    color: '#ffffff',
  },
  metricsContainer: {
    gap: 16,
  },
  metricCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metricCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  metricCardMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metricCardTrend: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  metricCardValues: {
    marginBottom: 16,
  },
  metricCardValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCardValueText: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricCardValueNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  metricProgressBar: {
    marginBottom: 12,
  },
  metricCardLastUpdated: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reportsContainer: {
    gap: 16,
  },
  reportCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  reportType: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportPeriod: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportInsights: {
    marginBottom: 12,
  },
  reportInsightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  reportInsight: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  carbonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  calculateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  carbonSummaryCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  carbonSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  carbonSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 20,
  },
  carbonBreakdown: {
    gap: 12,
  },
  carbonBreakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  carbonBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  carbonBreakdownCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  carbonBreakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  carbonListContainer: {
    gap: 16,
  },
  carbonCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  carbonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carbonCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  carbonCardValues: {
    marginBottom: 12,
  },
  carbonCardValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carbonCardLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  carbonCardAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  carbonCardDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});
