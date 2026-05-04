/**
 * Predictive Analytics Component
 * 
 * Main UI component for displaying AI-powered predictive analytics insights,
 * quantum state visualization, and prediction generation interface.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { usePredictiveAnalytics } from '../hooks/usePredictiveAnalytics';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

interface PredictiveAnalyticsProps {
  userId: string;
  onInsightPress?: (insight: any) => void;
  onPredictionPress?: (prediction: any) => void;
}

export function PredictiveAnalytics({ userId, onInsightPress, onPredictionPress }: PredictiveAnalyticsProps) {
  const {
    insights,
    quantumState,
    predictions,
    loading,
    error,
    initialized,
    isReady,
    hasInsights,
    hasQuantumState,
    activeInsights,
    expiredInsights,
    insightsByType,
    insightsByImpact,
    canGeneratePredictions,
    initialize,
    refreshInsights,
    refreshQuantumState,
    generatePrediction,
    dismissInsight,
    acknowledgeInsight,
    clearError,
    retry,
  } = usePredictiveAnalytics(userId);

  const [selectedTab, setSelectedTab] = useState<'insights' | 'quantum' | 'predictions'>('insights');

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableQuantumAnalysis: true,
        enablePredictiveInsights: true,
        enableRealTimeUpdates: true,
        confidenceThreshold: 75,
        maxInsights: 50,
      });
    }
  }, [initialized, initialize]);

  // Handle insight actions
  const handleInsightPress = (insight: any) => {
    if (onInsightPress) {
      onInsightPress(insight);
    } else {
      Alert.alert(
        insight.title,
        insight.description,
        [
          { text: 'Dismiss', style: 'cancel', onPress: () => dismissInsight(insight.id) },
          { text: 'Acknowledge', onPress: () => acknowledgeInsight(insight.id) },
        ]
      );
    }
  };

  const handleGeneratePrediction = async () => {
    if (!canGeneratePredictions) return;
    
    try {
      const result = await generatePrediction({
        type: 'PRODUCTIVITY_FORECAST',
        timeframe: 'WEEKLY',
        factors: ['ENERGY', 'FOCUS', 'HABITS'],
        confidence: 80,
      });
      
      if (result && onPredictionPress) {
        onPredictionPress(result);
      }
    } catch (error) {
      console.error('Failed to generate prediction:', error);
    }
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading message="Initializing Predictive Analytics..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="Predictive Analytics Error"
        message={error}
        onRetry={retry}
        onDismiss={clearError}
      />
    );
  }

  // Empty state
  if (!hasInsights && !hasQuantumState && isReady) {
    return (
      <EmptyState
        title="No Insights Available"
        message="Start using the app to generate predictive insights about your productivity patterns."
        icon="🧠"
        action={{
          title: "Refresh",
          onPress: () => Promise.all([refreshInsights(), refreshQuantumState()]),
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Predictive Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => refreshInsights()} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => refreshQuantumState()} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Update State</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'insights' && styles.activeTab]}
          onPress={() => setSelectedTab('insights')}
        >
          <Text style={[styles.tabText, selectedTab === 'insights' && styles.activeTabText]}>
            Insights ({activeInsights.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'quantum' && styles.activeTab]}
          onPress={() => setSelectedTab('quantum')}
        >
          <Text style={[styles.tabText, selectedTab === 'quantum' && styles.activeTabText]}>
            Quantum State
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'predictions' && styles.activeTab]}
          onPress={() => setSelectedTab('predictions')}
        >
          <Text style={[styles.tabText, selectedTab === 'predictions' && styles.activeTabText]}>
            Predictions ({predictions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'insights' && (
          <InsightsTab
            insights={insights}
            activeInsights={activeInsights}
            expiredInsights={expiredInsights}
            insightsByType={insightsByType}
            insightsByImpact={insightsByImpact}
            onInsightPress={handleInsightPress}
            onDismiss={dismissInsight}
            onAcknowledge={acknowledgeInsight}
          />
        )}

        {selectedTab === 'quantum' && (
          <QuantumStateTab
            quantumState={quantumState}
            onUpdateState={updateQuantumState}
          />
        )}

        {selectedTab === 'predictions' && (
          <PredictionsTab
            predictions={predictions}
            canGenerate={canGeneratePredictions}
            onGenerate={handleGeneratePrediction}
            onPress={onPredictionPress}
          />
        )}
      </ScrollView>
    </View>
  );
}

// Insights Tab Component
function InsightsTab({ 
  insights, 
  activeInsights, 
  expiredInsights, 
  insightsByType, 
  insightsByImpact,
  onInsightPress,
  onDismiss,
  onAcknowledge 
}: any) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredInsights = useMemo(() => {
    switch (filter) {
      case 'active':
        return activeInsights;
      case 'expired':
        return expiredInsights;
      default:
        return insights;
    }
  }, [filter, insights, activeInsights, expiredInsights]);

  return (
    <View style={styles.tabContent}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'expired'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({filterType === 'all' ? insights.length : filterType === 'active' ? activeInsights.length : expiredInsights.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <EmptyState
          title={`No ${filter} insights`}
          message={filter === 'all' ? 'Start using the app to generate insights' : `No ${filter} insights available`}
          icon="💡"
        />
      ) : (
        filteredInsights.map((insight: any) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onPress={() => onInsightPress(insight)}
            onDismiss={() => onDismiss(insight.id)}
            onAcknowledge={() => onAcknowledge(insight.id)}
          />
        ))
      )}
    </View>
  );
}

// Insight Card Component
function InsightCard({ insight, onPress, onDismiss, onAcknowledge }: any) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'TRANSFORMATIVE': return '#FF6B6B';
      case 'MAJOR': return '#4ECDC4';
      case 'MODERATE': return '#45B7D1';
      case 'MINOR': return '#96CEB4';
      default: return '#DDA0DD';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PREDICTIVE': return '#FF6B6B';
      case 'PRESCRIPTIVE': return '#4ECDC4';
      case 'DETECTIVE': return '#45B7D1';
      case 'ADAPTIVE': return '#96CEB4';
      default: return '#DDA0DD';
    }
  };

  return (
    <Card style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <View style={styles.insightTitleContainer}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <View style={styles.insightBadges}>
            <Badge 
              text={insight.impact} 
              color={getImpactColor(insight.impact)}
              size="small"
            />
            <Badge 
              text={insight.type} 
              color={getTypeColor(insight.type)}
              size="small"
            />
          </View>
        </View>
        <Text style={styles.insightConfidence}>
          {insight.confidence}% confidence
        </Text>
      </View>

      <Text style={styles.insightDescription}>{insight.description}</Text>

      {insight.prediction && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionLabel}>Prediction:</Text>
          <Text style={styles.predictionText}>
            {insight.prediction.likelihood}% chance of {insight.prediction.outcome}
          </Text>
          <ProgressBar progress={insight.prediction.likelihood} color={getImpactColor(insight.impact)} />
        </View>
      )}

      {insight.recommendations && insight.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsLabel}>Recommendations:</Text>
          {insight.recommendations.slice(0, 2).map((rec: any, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• {rec.action}</Text>
              <Text style={styles.recommendationPriority}>
                Priority: {rec.priority}/10
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.insightFooter}>
        <Text style={styles.insightTime}>
          {formatDistanceToNow(new Date(insight.expiresAt), { addSuffix: true })}
        </Text>
        <View style={styles.insightActions}>
          {!insight.acknowledged && (
            <TouchableOpacity
              style={styles.insightActionButton}
              onPress={() => onAcknowledge()}
            >
              <Text style={styles.insightActionText}>Acknowledge</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.insightActionButton, styles.dismissButton]}
            onPress={() => onDismiss()}
          >
            <Text style={styles.insightActionText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

// Quantum State Tab Component
function QuantumStateTab({ quantumState, onUpdateState }: any) {
  if (!quantumState) {
    return (
      <EmptyState
        title="No Quantum State Data"
        message="Quantum state analysis requires more usage data to establish patterns."
        icon="⚛️"
      />
    );
  }

  const metrics = [
    { label: 'Energy Level', value: quantumState.energyLevel, color: '#FF6B6B' },
    { label: 'Focus Capacity', value: quantumState.focusCapacity, color: '#4ECDC4' },
    { label: 'Creative Flow', value: quantumState.creativeFlow, color: '#45B7D1' },
    { label: 'Analytical Mode', value: quantumState.analyticalMode, color: '#96CEB4' },
    { label: 'Social Energy', value: quantumState.socialEnergy, color: '#DDA0DD' },
    { label: 'Physical State', value: quantumState.physicalState, color: '#FFA07A' },
    { label: 'Mental Clarity', value: quantumState.mentalClarity, color: '#98D8C8' },
    { label: 'Emotional Balance', value: quantumState.emotionalBalance, color: '#F7DC6F' },
  ];

  return (
    <View style={styles.tabContent}>
      <Card style={styles.quantumCard}>
        <Text style={styles.quantumTitle}>Current Quantum State</Text>
        <Text style={styles.quantumSubtitle}>
          Last updated: {formatDistanceToNow(new Date(quantumState.timestamp), { addSuffix: true })}
        </Text>

        <View style={styles.quantumMetrics}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.quantumMetric}>
              <Text style={styles.quantumMetricLabel}>{metric.label}</Text>
              <ProgressBar progress={metric.value} color={metric.color} />
              <Text style={styles.quantumMetricValue}>{metric.value}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.quantumActions}>
          <Button
            title="Update State"
            onPress={() => {
              // Implementation for updating quantum state
              console.log('Update quantum state');
            }}
          />
        </View>
      </Card>
    </View>
  );
}

// Predictions Tab Component
function PredictionsTab({ predictions, canGenerate, onGenerate, onPress }: any) {
  return (
    <View style={styles.tabContent}>
      {/* Generate Prediction Button */}
      <Card style={styles.generateCard}>
        <Text style={styles.generateTitle}>Generate New Prediction</Text>
        <Text style={styles.generateDescription}>
          Get AI-powered predictions about your productivity patterns and future performance.
        </Text>
        <Button
          title="Generate Prediction"
          onPress={onGenerate}
          disabled={!canGenerate}
        />
      </Card>

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <EmptyState
          title="No Predictions Yet"
          message="Generate your first prediction to see AI-powered insights about your productivity."
          icon="🔮"
        />
      ) : (
        predictions.map((prediction: any, index: number) => (
          <Card key={index} style={styles.predictionCard}>
            <Text style={styles.predictionCardTitle}>{prediction.type}</Text>
            <Text style={styles.predictionCardDescription}>
              {prediction.description}
            </Text>
            <View style={styles.predictionCardFooter}>
              <Text style={styles.predictionCardConfidence}>
                {prediction.confidence}% confidence
              </Text>
              <TouchableOpacity
                style={styles.predictionCardButton}
                onPress={() => onPress(prediction)}
              >
                <Text style={styles.predictionCardButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 14,
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#3498DB',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  insightCard: {
    marginBottom: 16,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  insightBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  insightConfidence: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  insightDescription: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 12,
  },
  predictionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  recommendationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  recommendationItem: {
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 13,
    color: '#34495E',
  },
  recommendationPriority: {
    fontSize: 11,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  insightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  insightActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  dismissButton: {
    backgroundColor: '#E74C3C',
  },
  insightActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quantumCard: {
    padding: 20,
  },
  quantumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  quantumSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  quantumMetrics: {
    marginBottom: 20,
  },
  quantumMetric: {
    marginBottom: 16,
  },
  quantumMetricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  quantumMetricValue: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  quantumActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  generateCard: {
    padding: 20,
    marginBottom: 16,
  },
  generateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  generateDescription: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 16,
    textAlign: 'center',
  },
  predictionCard: {
    padding: 16,
    marginBottom: 16,
  },
  predictionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  predictionCardDescription: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 12,
  },
  predictionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionCardConfidence: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  predictionCardButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  predictionCardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
