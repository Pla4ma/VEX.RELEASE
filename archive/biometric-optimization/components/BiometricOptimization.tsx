/**
 * Biometric Optimization Component
 * 
 * Main UI component for biometric optimization with health monitoring,
 * performance tracking, wellness recommendations, and physiological insights.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useBiometricOptimization } from '../hooks/useBiometricOptimization';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface BiometricOptimizationProps {
  userId: string;
  onHealthSessionPress?: (sessionId: string) => void;
  onPerformanceSessionPress?: (sessionId: string) => void;
  onWellnessSessionPress?: (sessionId: string) => void;
  onDevicePress?: (deviceId: string) => void;
  onRecommendationPress?: (recommendationId: string) => void;
  onGoalPress?: (goalId: string) => void;
}

export function BiometricOptimization({
  userId,
  onHealthSessionPress,
  onPerformanceSessionPress,
  onWellnessSessionPress,
  onDevicePress,
  onRecommendationPress,
  onGoalPress,
}: BiometricOptimizationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'performance' | 'wellness' | 'devices'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showConnectDeviceModal, setShowConnectDeviceModal] = useState(false);
  const [showStartMonitoringModal, setShowStartMonitoringModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedOptimizationType, setSelectedOptimizationType] = useState<string>('');

  const {
    profile,
    healthMetrics,
    performanceMetrics,
    wellnessRecommendations,
    physiologicalInsights,
    biometricDevices,
    healthSessions,
    performanceSessions,
    wellnessSessions,
    healthAlerts,
    performanceTrends,
    wellnessPlans,
    biometricAnalytics,
    userHealthStatus,
    biometricHistory,
    healthGoals,
    performanceGoals,
    wellnessGoals,
    biometricMetrics,
    optimizationMetrics,
    healthRecommendations,
    performanceRecommendations,
    wellnessRecommendations2,
    loading,
    error,
    initialized,
    isReady,
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
  } = useBiometricOptimization(userId);

  useEffect(() => {
    if (!initialized && userId) {
      initialize({
        enableHealthMonitoring: true,
        enablePerformanceTracking: true,
        enableWellnessPrograms: true,
        dataRetentionDays: 90,
        alertThresholds: {
          heartRate: { min: 40, max: 180 },
          bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
          stress: { max: 7 },
          sleep: { min: 6, max: 10 },
        },
        privacySettings: {
          shareData: false,
          anonymizeData: true,
          dataRetention: 90,
        },
      });
    }
  }, [initialized, userId, initialize]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await updateMetrics();
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectDevice = async (deviceType: string, deviceId: string) => {
    const device = await connectDevice(deviceType, deviceId);
    if (device) {
      setShowConnectDeviceModal(false);
    }
  };

  const handleStartHealthMonitoring = async () => {
    const session = await startHealthMonitoring();
    if (session && onHealthSessionPress) {
      onHealthSessionPress(session.id);
    }
  };

  const handleStartPerformanceTracking = async () => {
    const session = await startPerformanceTracking();
    if (session && onPerformanceSessionPress) {
      onPerformanceSessionPress(session.id);
    }
  };

  const handleStartWellnessProgram = async (programType: string) => {
    const session = await startWellnessProgram(programType);
    if (session && onWellnessSessionPress) {
      onWellnessSessionPress(session.id);
    }
  };

  const handleOptimizePerformance = async (optimizationType: string) => {
    const optimization = await optimizePerformance(optimizationType);
    if (optimization) {
      setShowOptimizationModal(false);
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.scrollView} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }>
      {/* Health Overview */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Health Status</Text>
          <Badge text={`${healthScore}/100`} variant={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'danger'} />
        </View>
        {healthMetrics && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Heart Rate</Text>
              <Text style={styles.metricValue}>{healthMetrics.heartRate} bpm</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Blood Pressure</Text>
              <Text style={styles.metricValue}>{healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Stress Level</Text>
              <Text style={styles.metricValue}>{healthMetrics.stressLevel}/10</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Sleep Quality</Text>
              <Text style={styles.metricValue}>{healthMetrics.sleepQuality}%</Text>
            </View>
          </View>
        )}
        <ProgressBar 
          progress={healthScore} 
          color={healthScore >= 80 ? '#27AE60' : healthScore >= 60 ? '#F39C12' : '#E74C3C'}
        />
      </Card>

      {/* Performance Overview */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Performance</Text>
          <Badge text={`${performanceScore}/100`} variant={performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'danger'} />
        </View>
        {performanceMetrics && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Energy Level</Text>
              <Text style={styles.metricValue}>{performanceMetrics.energyLevel}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Focus Score</Text>
              <Text style={styles.metricValue}>{performanceMetrics.focusScore}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Productivity</Text>
              <Text style={styles.metricValue}>{performanceMetrics.productivity}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Recovery</Text>
              <Text style={styles.metricValue}>{performanceMetrics.recovery}%</Text>
            </View>
          </View>
        )}
        <ProgressBar 
          progress={performanceScore} 
          color={performanceScore >= 80 ? '#27AE60' : performanceScore >= 60 ? '#F39C12' : '#E74C3C'}
        />
      </Card>

      {/* Wellness Overview */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Wellness</Text>
          <Badge text={`${wellnessScore}/100`} variant={wellnessScore >= 80 ? 'success' : wellnessScore >= 60 ? 'warning' : 'danger'} />
        </View>
        {wellnessRecommendations && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Exercise</Text>
              <Text style={styles.metricValue}>{wellnessRecommendations.exerciseScore}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Nutrition</Text>
              <Text style={styles.metricValue}>{wellnessRecommendations.nutritionScore}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Mental Health</Text>
              <Text style={styles.metricValue}>{wellnessRecommendations.mentalHealthScore}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Social Wellness</Text>
              <Text style={styles.metricValue}>{wellnessRecommendations.socialWellnessScore}%</Text>
            </View>
          </View>
        )}
        <ProgressBar 
          progress={wellnessScore} 
          color={wellnessScore >= 80 ? '#27AE60' : wellnessScore >= 60 ? '#F39C12' : '#E74C3C'}
        />
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <Button
            title="Start Health Monitoring"
            onPress={() => setShowStartMonitoringModal(true)}
            disabled={!canStartMonitoring}
            style={styles.quickActionButton}
          />
          <Button
            title="Connect Device"
            onPress={() => setShowConnectDeviceModal(true)}
            disabled={!canConnectDevice}
            variant="secondary"
            style={styles.quickActionButton}
          />
          <Button
            title="Optimize Performance"
            onPress={() => setShowOptimizationModal(true)}
            disabled={!hasPerformanceData}
            variant="secondary"
            style={styles.quickActionButton}
          />
        </View>
      </Card>

      {/* Recent Alerts */}
      {healthAlerts.length > 0 && (
        <Card style={styles.alertsCard}>
          <Text style={styles.alertsTitle}>Health Alerts</Text>
          {healthAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleTimeString()}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );

  const renderHealth = () => (
    <ScrollView style={styles.scrollView} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }>
      {/* Health Metrics */}
      {healthMetrics && (
        <Card style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.detailedMetricsContainer}>
            <View style={styles.metricGroup}>
              <Text style={styles.metricGroupTitle}>Vital Signs</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Heart Rate</Text>
                <Text style={styles.metricValue}>{healthMetrics.heartRate} bpm</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Blood Pressure</Text>
                <Text style={styles.metricValue}>{healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic} mmHg</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Body Temperature</Text>
                <Text style={styles.metricValue}>{healthMetrics.bodyTemperature}°C</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Oxygen Saturation</Text>
                <Text style={styles.metricValue}>{healthMetrics.oxygenSaturation}%</Text>
              </View>
            </View>

            <View style={styles.metricGroup}>
              <Text style={styles.metricGroupTitle}>Lifestyle</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Sleep Quality</Text>
                <Text style={styles.metricValue}>{healthMetrics.sleepQuality}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Stress Level</Text>
                <Text style={styles.metricValue}>{healthMetrics.stressLevel}/10</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Activity Level</Text>
                <Text style={styles.metricValue}>{healthMetrics.activityLevel}%</Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Health Sessions */}
      <Card style={styles.sessionsCard}>
        <Text style={styles.sectionTitle}>Health Monitoring Sessions</Text>
        {healthSessions.length > 0 ? (
          healthSessions.slice(0, 5).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionItem}
              onPress={() => onHealthSessionPress?.(session.id)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{session.type}</Text>
                <Badge text={session.active ? 'Active' : 'Completed'} variant={session.active ? 'success' : 'default'} />
              </View>
              <Text style={styles.sessionTime}>
                {new Date(session.startTime).toLocaleString()}
              </Text>
              {session.duration && (
                <Text style={styles.sessionDuration}>Duration: {session.duration} min</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No health sessions yet</Text>
        )}
      </Card>

      {/* Health Goals */}
      {healthGoals && (
        <Card style={styles.goalsCard}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Heart Rate</Text>
              <Text style={styles.goalValue}>{healthGoals.targetHeartRate} bpm</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Sleep Hours</Text>
              <Text style={styles.goalValue}>{healthGoals.targetSleepHours} hrs</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Activity</Text>
              <Text style={styles.goalValue}>{healthGoals.targetActivityMinutes} min/day</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Stress Level</Text>
              <Text style={styles.goalValue}>{healthGoals.targetStressLevel}/10</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Health Recommendations */}
      {healthRecommendations && (
        <Card style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>Health Recommendations</Text>
          {healthRecommendations.recommendations.slice(0, 5).map((recommendation) => (
            <TouchableOpacity
              key={recommendation.id}
              style={styles.recommendationItem}
              onPress={() => onRecommendationPress?.(recommendation.id)}
            >
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
              <Badge text={recommendation.priority} variant={recommendation.priority === 'high' ? 'danger' : recommendation.priority === 'medium' ? 'warning' : 'default'} />
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </ScrollView>
  );

  const renderPerformance = () => (
    <ScrollView style={styles.scrollView} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }>
      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.detailedMetricsContainer}>
            <View style={styles.metricGroup}>
              <Text style={styles.metricGroupTitle}>Cognitive Performance</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Focus Score</Text>
                <Text style={styles.metricValue}>{performanceMetrics.focusScore}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Memory Performance</Text>
                <Text style={styles.metricValue}>{performanceMetrics.memoryPerformance}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Cognitive Load</Text>
                <Text style={styles.metricValue}>{performanceMetrics.cognitiveLoad}%</Text>
              </View>
            </View>

            <View style={styles.metricGroup}>
              <Text style={styles.metricGroupTitle}>Physical Performance</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Energy Level</Text>
                <Text style={styles.metricValue}>{performanceMetrics.energyLevel}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Productivity</Text>
                <Text style={styles.metricValue}>{performanceMetrics.productivity}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Recovery</Text>
                <Text style={styles.metricValue}>{performanceMetrics.recovery}%</Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Performance Sessions */}
      <Card style={styles.sessionsCard}>
        <Text style={styles.sectionTitle}>Performance Tracking Sessions</Text>
        {performanceSessions.length > 0 ? (
          performanceSessions.slice(0, 5).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionItem}
              onPress={() => onPerformanceSessionPress?.(session.id)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{session.type}</Text>
                <Badge text={session.active ? 'Active' : 'Completed'} variant={session.active ? 'success' : 'default'} />
              </View>
              <Text style={styles.sessionTime}>
                {new Date(session.startTime).toLocaleString()}
              </Text>
              {session.duration && (
                <Text style={styles.sessionDuration}>Duration: {session.duration} min</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No performance sessions yet</Text>
        )}
      </Card>

      {/* Performance Trends */}
      {performanceTrends.length > 0 && (
        <Card style={styles.trendsCard}>
          <Text style={styles.sectionTitle}>Performance Trends</Text>
          {performanceTrends.slice(0, 5).map((trend) => (
            <View key={trend.id} style={styles.trendItem}>
              <Text style={styles.trendMetric}>{trend.metric}</Text>
              <Text style={styles.trendValue}>{trend.value}%</Text>
              <Text style={[
                styles.trendDirection,
                trend.direction === 'up' ? styles.trendUp : 
                trend.direction === 'down' ? styles.trendDown : 
                styles.trendStable
              ]}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.change}%
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Performance Goals */}
      {performanceGoals && (
        <Card style={styles.goalsCard}>
          <Text style={styles.sectionTitle}>Performance Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Focus Score</Text>
              <Text style={styles.goalValue}>{performanceGoals.targetFocusScore}%</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Energy Level</Text>
              <Text style={styles.goalValue}>{performanceGoals.targetEnergyLevel}%</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Productivity</Text>
              <Text style={styles.goalValue}>{performanceGoals.targetProductivity}%</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Recovery</Text>
              <Text style={styles.goalValue}>{performanceGoals.targetRecovery}%</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Performance Recommendations */}
      {performanceRecommendations && (
        <Card style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>Performance Recommendations</Text>
          {performanceRecommendations.recommendations.slice(0, 5).map((recommendation) => (
            <TouchableOpacity
              key={recommendation.id}
              style={styles.recommendationItem}
              onPress={() => onRecommendationPress?.(recommendation.id)}
            >
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
              <Badge text={recommendation.priority} variant={recommendation.priority === 'high' ? 'danger' : recommendation.priority === 'medium' ? 'warning' : 'default'} />
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </ScrollView>
  );

  const renderWellness = () => (
    <ScrollView style={styles.scrollView} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }>
      {/* Wellness Overview */}
      {wellnessRecommendations && (
        <Card style={styles.wellnessCard}>
          <Text style={styles.sectionTitle}>Wellness Overview</Text>
          <View style={styles.wellnessOverviewContainer}>
            <View style={styles.wellnessScoreItem}>
              <Text style={styles.wellnessScoreLabel}>Exercise</Text>
              <Text style={styles.wellnessScoreValue}>{wellnessRecommendations.exerciseScore}%</Text>
              <ProgressBar progress={wellnessRecommendations.exerciseScore} />
            </View>
            <View style={styles.wellnessScoreItem}>
              <Text style={styles.wellnessScoreLabel}>Nutrition</Text>
              <Text style={styles.wellnessScoreValue}>{wellnessRecommendations.nutritionScore}%</Text>
              <ProgressBar progress={wellnessRecommendations.nutritionScore} />
            </View>
            <View style={styles.wellnessScoreItem}>
              <Text style={styles.wellnessScoreLabel}>Mental Health</Text>
              <Text style={styles.wellnessScoreValue}>{wellnessRecommendations.mentalHealthScore}%</Text>
              <ProgressBar progress={wellnessRecommendations.mentalHealthScore} />
            </View>
            <View style={styles.wellnessScoreItem}>
              <Text style={styles.wellnessScoreLabel}>Social Wellness</Text>
              <Text style={styles.wellnessScoreValue}>{wellnessRecommendations.socialWellnessScore}%</Text>
              <ProgressBar progress={wellnessRecommendations.socialWellnessScore} />
            </View>
          </View>
        </Card>
      )}

      {/* Wellness Sessions */}
      <Card style={styles.sessionsCard}>
        <Text style={styles.sectionTitle}>Wellness Programs</Text>
        {wellnessSessions.length > 0 ? (
          wellnessSessions.slice(0, 5).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionItem}
              onPress={() => onWellnessSessionPress?.(session.id)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{session.type}</Text>
                <Badge text={session.active ? 'Active' : 'Completed'} variant={session.active ? 'success' : 'default'} />
              </View>
              <Text style={styles.sessionTime}>
                {new Date(session.startTime).toLocaleString()}
              </Text>
              {session.duration && (
                <Text style={styles.sessionDuration}>Duration: {session.duration} min</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No wellness programs yet</Text>
        )}
      </Card>

      {/* Wellness Plans */}
      {wellnessPlans.length > 0 && (
        <Card style={styles.plansCard}>
          <Text style={styles.sectionTitle}>Wellness Plans</Text>
          {wellnessPlans.slice(0, 3).map((plan) => (
            <View key={plan.id} style={styles.planItem}>
              <Text style={styles.planTitle}>{plan.name}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <View style={styles.planProgress}>
                <Text style={styles.planProgressText}>{plan.progress}% Complete</Text>
                <ProgressBar progress={plan.progress} />
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Wellness Goals */}
      {wellnessGoals && (
        <Card style={styles.goalsCard}>
          <Text style={styles.sectionTitle}>Wellness Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Exercise Minutes</Text>
              <Text style={styles.goalValue}>{wellnessGoals.exerciseMinutes} min/day</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Nutrition Score</Text>
              <Text style={styles.goalValue}>{wellnessGoals.nutritionScore}%</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Mental Health Score</Text>
              <Text style={styles.goalValue}>{wellnessGoals.mentalHealthScore}%</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Social Activities</Text>
              <Text style={styles.goalValue}>{wellnessGoals.socialActivities}/week</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Wellness Recommendations */}
      {wellnessRecommendations2 && (
        <Card style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>Wellness Recommendations</Text>
          {wellnessRecommendations2.recommendations.slice(0, 5).map((recommendation) => (
            <TouchableOpacity
              key={recommendation.id}
              style={styles.recommendationItem}
              onPress={() => onRecommendationPress?.(recommendation.id)}
            >
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
              <Badge text={recommendation.category} variant="default" />
            </TouchableOpacity>
          ))}
        </Card>
      )}
    </ScrollView>
  );

  const renderDevices = () => (
    <ScrollView style={styles.scrollView} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }>
      {/* Connected Devices */}
      <Card style={styles.devicesCard}>
        <View style={styles.devicesHeader}>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          <Button
            title="Add Device"
            onPress={() => setShowConnectDeviceModal(true)}
            variant="secondary"
            size="small"
          />
        </View>
        {biometricDevices.length > 0 ? (
          biometricDevices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.deviceItem}
              onPress={() => onDevicePress?.(device.id)}
            >
              <View style={styles.deviceHeader}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Badge text={device.connected ? 'Connected' : 'Disconnected'} variant={device.connected ? 'success' : 'danger'} />
              </View>
              <Text style={styles.deviceType}>{device.type}</Text>
              <Text style={styles.deviceStatus}>Status: {device.status}</Text>
              {device.lastSync && (
                <Text style={styles.deviceLastSync}>
                  Last sync: {new Date(device.lastSync).toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No devices connected yet</Text>
        )}
      </Card>

      {/* Device Categories */}
      <Card style={styles.deviceCategoriesCard}>
        <Text style={styles.sectionTitle}>Available Device Types</Text>
        <View style={styles.deviceCategoriesContainer}>
          <TouchableOpacity
            style={styles.deviceCategoryItem}
            onPress={() => handleConnectDevice('heart_rate_monitor', 'default')}
          >
            <Text style={styles.deviceCategoryIcon}>❤️</Text>
            <Text style={styles.deviceCategoryName}>Heart Rate Monitor</Text>
            <Text style={styles.deviceCategoryDescription}>Track heart rate and rhythm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deviceCategoryItem}
            onPress={() => handleConnectDevice('sleep_tracker', 'default')}
          >
            <Text style={styles.deviceCategoryIcon}>😴</Text>
            <Text style={styles.deviceCategoryName}>Sleep Tracker</Text>
            <Text style={styles.deviceCategoryDescription}>Monitor sleep patterns</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deviceCategoryItem}
            onPress={() => handleConnectDevice('activity_tracker', 'default')}
          >
            <Text style={styles.deviceCategoryIcon}>🏃</Text>
            <Text style={styles.deviceCategoryName}>Activity Tracker</Text>
            <Text style={styles.deviceCategoryDescription}>Track physical activity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deviceCategoryItem}
            onPress={() => handleConnectDevice('stress_monitor', 'default')}
          >
            <Text style={styles.deviceCategoryIcon}>🧘</Text>
            <Text style={styles.deviceCategoryName}>Stress Monitor</Text>
            <Text style={styles.deviceCategoryDescription}>Monitor stress levels</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deviceCategoryItem}
            onPress={() => handleConnectDevice('nutrition_tracker', 'default')}
          >
            <Text style={styles.deviceCategoryIcon}>🥗</Text>
            <Text style={styles.deviceCategoryName}>Nutrition Tracker</Text>
            <Text style={styles.deviceCategoryDescription}>Track nutrition intake</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Device Settings */}
      <Card style={styles.deviceSettingsCard}>
        <Text style={styles.sectionTitle}>Device Settings</Text>
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-sync</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sync Frequency</Text>
            <Text style={styles.settingValue}>Every 5 minutes</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Data Retention</Text>
            <Text style={styles.settingValue}>90 days</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Battery Optimization</Text>
            <Text style={styles.settingValue}>Balanced</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'health':
        return renderHealth();
      case 'performance':
        return renderPerformance();
      case 'wellness':
        return renderWellness();
      case 'devices':
        return renderDevices();
      default:
        return renderOverview();
    }
  };

  if (!isReady) {
    return <BiometricOptimizationLoading />;
  }

  if (error) {
    return <BiometricOptimizationError error={error} onRetry={retry} />;
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['overview', 'health', 'performance', 'wellness', 'devices'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
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

      {/* Tab Content */}
      {renderTabContent()}

      {/* Connect Device Modal */}
      {showConnectDeviceModal && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modal}>
            <Text style={styles.modalTitle}>Connect Device</Text>
            <Text style={styles.modalDescription}>Select device type to connect</Text>
            <View style={styles.modalButtons}>
              <Button
                title="Heart Rate Monitor"
                onPress={() => handleConnectDevice('heart_rate_monitor', 'default')}
                style={styles.modalButton}
              />
              <Button
                title="Sleep Tracker"
                onPress={() => handleConnectDevice('sleep_tracker', 'default')}
                style={styles.modalButton}
              />
              <Button
                title="Activity Tracker"
                onPress={() => handleConnectDevice('activity_tracker', 'default')}
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={() => setShowConnectDeviceModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      )}

      {/* Start Monitoring Modal */}
      {showStartMonitoringModal && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modal}>
            <Text style={styles.modalTitle}>Start Monitoring</Text>
            <Text style={styles.modalDescription}>Choose monitoring type</Text>
            <View style={styles.modalButtons}>
              <Button
                title="Health Monitoring"
                onPress={handleStartHealthMonitoring}
                style={styles.modalButton}
              />
              <Button
                title="Performance Tracking"
                onPress={handleStartPerformanceTracking}
                style={styles.modalButton}
              />
              <Button
                title="Wellness Program"
                onPress={() => handleStartWellnessProgram('general')}
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={() => setShowStartMonitoringModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      )}

      {/* Optimization Modal */}
      {showOptimizationModal && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modal}>
            <Text style={styles.modalTitle}>Optimize Performance</Text>
            <Text style={styles.modalDescription}>Select optimization type</Text>
            <View style={styles.modalButtons}>
              <Button
                title="Energy Optimization"
                onPress={() => handleOptimizePerformance('energy')}
                style={styles.modalButton}
              />
              <Button
                title="Focus Enhancement"
                onPress={() => handleOptimizePerformance('focus')}
                style={styles.modalButton}
              />
              <Button
                title="Recovery Acceleration"
                onPress={() => handleOptimizePerformance('recovery')}
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={() => setShowOptimizationModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498DB',
  },
  tabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498DB',
    fontWeight: '600',
  },
  overviewCard: {
    marginBottom: 16,
    padding: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  metricValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionButton: {
    marginBottom: 8,
  },
  alertsCard: {
    marginBottom: 16,
    padding: 16,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  alertMessage: {
    fontSize: 14,
    color: '#E74C3C',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  metricsCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  detailedMetricsContainer: {
    gap: 20,
  },
  metricGroup: {
    gap: 12,
  },
  metricGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  sessionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  sessionItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  sessionTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  emptyText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    padding: 20,
  },
  goalsCard: {
    marginBottom: 16,
    padding: 16,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  goalValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  recommendationsCard: {
    marginBottom: 16,
    padding: 16,
  },
  recommendationItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  trendsCard: {
    marginBottom: 16,
    padding: 16,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  trendMetric: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  trendValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  trendDirection: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendUp: {
    color: '#27AE60',
  },
  trendDown: {
    color: '#E74C3C',
  },
  trendStable: {
    color: '#95A5A6',
  },
  wellnessCard: {
    marginBottom: 16,
    padding: 16,
  },
  wellnessOverviewContainer: {
    gap: 16,
  },
  wellnessScoreItem: {
    gap: 8,
  },
  wellnessScoreLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  wellnessScoreValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  plansCard: {
    marginBottom: 16,
    padding: 16,
  },
  planItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  planProgress: {
    gap: 4,
  },
  planProgressText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  devicesCard: {
    marginBottom: 16,
    padding: 16,
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  deviceType: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  deviceStatus: {
    fontSize: 12,
    color: '#95A5A6',
  },
  deviceLastSync: {
    fontSize: 12,
    color: '#95A5A6',
  },
  deviceCategoriesCard: {
    marginBottom: 16,
    padding: 16,
  },
  deviceCategoriesContainer: {
    gap: 12,
  },
  deviceCategoryItem: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  deviceCategoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  deviceCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  deviceCategoryDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  deviceSettingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  settingValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    marginBottom: 8,
  },
});
