/**
 * Neuro Productivity Component
 * 
 * Main UI component for neuro productivity with brainwave integration,
 * real-time EEG analysis, personalized neurofeedback, and cognitive enhancement.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNeuroProductivity } from '../hooks/useNeuroProductivity';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

interface NeuroProductivityProps {
  userId: string;
  onSessionPress?: (session: any) => void;
  onDevicePress?: (device: any) => void;
  onProtocolPress?: (protocol: any) => void;
}

export function NeuroProductivity({ 
  userId, 
  onSessionPress, 
  onDevicePress, 
  onProtocolPress 
}: NeuroProductivityProps) {
  const {
    profile,
    metrics,
    brainwaves,
    cognitiveState,
    sessions,
    protocols,
    plans,
    predictions,
    alerts,
    devices,
    enhancements,
    focusState,
    mentalFatigue,
    performance,
    loading,
    error,
    initialized,
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
  } = useNeuroProductivity(userId);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions' | 'devices' | 'enhancements'>('overview');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableBrainwaveAnalysis: true,
        enableRealTimeMonitoring: true,
        enableNeuroFeedback: true,
        enableCognitiveEnhancement: true,
        supportedDevices: ['eeg-headset', 'heart-rate-monitor', 'galvanic-skin-response'],
        samplingRate: 250,
        bufferSize: 1000,
      });
    }
  }, [initialized]);

  // Handle session actions
  const handleStartSession = async (sessionType: string) => {
    const session = await startSession(sessionType);
    if (session) {
      Alert.alert('Success', 'Neuro feedback session started successfully!');
      setSelectedTab('sessions');
    } else {
      Alert.alert('Error', 'Failed to start session');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    const success = await endSession(sessionId);
    if (success) {
      Alert.alert('Success', 'Session ended successfully!');
    } else {
      Alert.alert('Error', 'Failed to end session');
    }
  };

  const handleConnectDevice = async (deviceId: string, deviceType: string) => {
    const success = await connectDevice(deviceId, deviceType);
    if (success) {
      Alert.alert('Success', 'Device connected successfully!');
      setSelectedTab('devices');
    } else {
      Alert.alert('Error', 'Failed to connect device');
    }
  };

  const handleApplyProtocol = async (protocolId: string) => {
    const success = await applyEnhancementProtocol(protocolId);
    if (success) {
      Alert.alert('Success', 'Enhancement protocol applied successfully!');
    } else {
      Alert.alert('Error', 'Failed to apply protocol');
    }
  };

  const handleGeneratePlan = async () => {
    const plan = await generateOptimizationPlan(['focus', 'energy', 'cognitive-performance']);
    if (plan) {
      Alert.alert('Success', 'Optimization plan generated successfully!');
    } else {
      Alert.alert('Error', 'Failed to generate plan');
    }
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading message="Loading Neuro Productivity..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="Neuro Productivity Error"
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
        title="Welcome to Neuro Productivity"
        message="Optimize your productivity with brainwave analysis and cognitive enhancement."
        icon="🧠"
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
        <Text style={styles.title}>Neuro Productivity</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(currentFocusLevel)}%</Text>
            <Text style={styles.statLabel}>Focus</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(currentEnergyLevel)}%</Text>
            <Text style={styles.statLabel}>Energy</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(cognitivePerformance)}</Text>
            <Text style={styles.statLabel}>Performance</Text>
          </View>
        </View>
      </View>

      {/* Device Connection Status */}
      <View style={styles.deviceContainer}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceTitle}>Device Status</Text>
          <Badge 
            text={isDeviceConnected ? 'Connected' : 'Disconnected'} 
            color={isDeviceConnected ? '#27AE60' : '#E74C3C'} 
            size="small" 
          />
        </View>
        {devices.length > 0 && (
          <View style={styles.deviceList}>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <Text style={styles.deviceName}>{device.type}</Text>
                <Badge 
                  text={device.isConnected ? 'Active' : 'Inactive'} 
                  color={device.isConnected ? '#27AE60' : '#95A5A6'} 
                  size="small" 
                />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Cognitive State Banner */}
      {cognitiveState && (
        <Card style={styles.cognitiveBanner}>
          <View style={styles.cognitiveHeader}>
            <Text style={styles.cognitiveTitle}>Cognitive State</Text>
            <Badge text="Active" color="#9B59B6" size="small" />
          </View>
          <Text style={styles.cognitiveState}>{cognitiveState.state}</Text>
          <ProgressBar 
            progress={cognitiveState.confidence * 100} 
            color="#9B59B6"
          />
          <Text style={styles.cognitiveDescription}>
            Confidence: {Math.round(cognitiveState.confidence * 100)}%
          </Text>
        </Card>
      )}

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
          style={[styles.tab, selectedTab === 'sessions' && styles.activeTab]}
          onPress={() => setSelectedTab('sessions')}
        >
          <Text style={[styles.tabText, selectedTab === 'sessions' && styles.activeTabText]}>
            Sessions ({sessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'devices' && styles.activeTab]}
          onPress={() => setSelectedTab('devices')}
        >
          <Text style={[styles.tabText, selectedTab === 'devices' && styles.activeTabText]}>
            Devices ({devices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'enhancements' && styles.activeTab]}
          onPress={() => setSelectedTab('enhancements')}
        >
          <Text style={[styles.tabText, selectedTab === 'enhancements' && styles.activeTabText]}>
            Enhancements
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <OverviewTab
            profile={profile}
            focusState={focusState}
            mentalFatigue={mentalFatigue}
            performance={performance}
            alerts={alerts}
            predictions={predictions}
            onStartSession={() => setShowSessionModal(true)}
            onConnectDevice={() => setShowDeviceModal(true)}
            onGeneratePlan={handleGeneratePlan}
          />
        )}

        {selectedTab === 'sessions' && (
          <SessionsTab
            sessions={sessions}
            onSessionPress={onSessionPress}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            isInSession={isInSession}
          />
        )}

        {selectedTab === 'devices' && (
          <DevicesTab
            devices={devices}
            onDevicePress={onDevicePress}
            onConnectDevice={handleConnectDevice}
            onDisconnectDevice={disconnectDevice}
            isDeviceConnected={isDeviceConnected}
          />
        )}

        {selectedTab === 'enhancements' && (
          <EnhancementsTab
            protocols={protocols}
            plans={plans}
            enhancements={enhancements}
            onProtocolPress={onProtocolPress}
            onApplyProtocol={handleApplyProtocol}
            isOptimizing={isOptimizing}
          />
        )}
      </ScrollView>

      {/* Session Modal */}
      <Modal
        visible={showSessionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Neuro Session</Text>
            <Text style={styles.modalDescription}>
              Begin a neuro feedback session to optimize your cognitive performance.
            </Text>
            
            <Button
              title="Start Focus Session"
              onPress={() => handleStartSession('focus')}
              style={styles.modalButton}
            />

            <Button
              title="Start Relaxation Session"
              onPress={() => handleStartSession('relaxation')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowSessionModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Device Modal */}
      <Modal
        visible={showDeviceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeviceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect Device</Text>
            <Text style={styles.modalDescription}>
              Connect a neuro device to start monitoring your brain activity.
            </Text>
            
            <Button
              title="Connect EEG Headset"
              onPress={() => handleConnectDevice('eeg-001', 'eeg-headset')}
              style={styles.modalButton}
            />

            <Button
              title="Connect Heart Rate Monitor"
              onPress={() => handleConnectDevice('hrm-001', 'heart-rate-monitor')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowDeviceModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Protocol Modal */}
      <Modal
        visible={showProtocolModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProtocolModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply Enhancement Protocol</Text>
            <Text style={styles.modalDescription}>
              Apply a cognitive enhancement protocol to optimize your performance.
            </Text>
            
            <Button
              title="Focus Enhancement"
              onPress={() => handleApplyProtocol('focus-enhancement')}
              style={styles.modalButton}
            />

            <Button
              title="Energy Boost"
              onPress={() => handleApplyProtocol('energy-boost')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowProtocolModal(false)}
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
  profile, 
  focusState, 
  mentalFatigue, 
  performance, 
  alerts, 
  predictions, 
  onStartSession, 
  onConnectDevice, 
  onGeneratePlan 
}: any) {
  return (
    <View style={styles.tabContent}>
      {/* Performance Metrics */}
      {performance && (
        <Card style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Performance Metrics</Text>
          <View style={styles.performanceMetrics}>
            <View style={styles.performanceMetric}>
              <Text style={styles.performanceLabel}>Overall Score</Text>
              <Text style={styles.performanceValue}>{Math.round(performance.overallScore)}</Text>
            </View>
            <View style={styles.performanceMetric}>
              <Text style={styles.performanceLabel}>Focus Score</Text>
              <Text style={styles.performanceValue}>{Math.round(performance.focusScore)}</Text>
            </View>
            <View style={styles.performanceMetric}>
              <Text style={styles.performanceLabel}>Energy Score</Text>
              <Text style={styles.performanceValue}>{Math.round(performance.energyScore)}</Text>
            </View>
            <View style={styles.performanceMetric}>
              <Text style={styles.performanceLabel}>Cognitive Score</Text>
              <Text style={styles.performanceValue}>{Math.round(performance.cognitiveScore)}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Focus State */}
      {focusState && (
        <Card style={styles.focusCard}>
          <Text style={styles.focusTitle}>Focus State</Text>
          <ProgressBar 
            progress={focusState.level * 100} 
            color="#3498DB"
          />
          <Text style={styles.focusDescription}>
            {focusState.level > 0.7 ? 'High Focus' : 
             focusState.level > 0.4 ? 'Moderate Focus' : 
             'Low Focus'}
          </Text>
        </Card>
      )}

      {/* Mental Fatigue */}
      {mentalFatigue && (
        <Card style={styles.fatigueCard}>
          <Text style={styles.fatigueTitle}>Mental Fatigue</Text>
          <ProgressBar 
            progress={mentalFatigue.level * 100} 
            color={mentalFatigue.level > 0.7 ? '#E74C3C' : mentalFatigue.level > 0.4 ? '#F39C12' : '#27AE60'}
          />
          <Text style={styles.fatigueDescription}>
            {mentalFatigue.level > 0.7 ? 'High Fatigue - Rest Recommended' : 
             mentalFatigue.level > 0.4 ? 'Moderate Fatigue' : 
             'Low Fatigue - Good Energy'}
          </Text>
        </Card>
      )}

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

      {/* Predictions */}
      {predictions && predictions.length > 0 && (
        <Card style={styles.predictionsCard}>
          <Text style={styles.predictionsTitle}>Productivity Predictions</Text>
          {predictions.slice(0, 2).map((prediction: any) => (
            <View key={prediction.id} style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>
                Next {prediction.timeframe}h: {Math.round(prediction.productivityScore * 100)}%
              </Text>
              <Text style={styles.predictionConfidence}>
                Confidence: {Math.round(prediction.confidence * 100)}%
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={onStartSession}>
            <Text style={styles.quickActionIcon}>🧠</Text>
            <Text style={styles.quickActionText}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={onConnectDevice}>
            <Text style={styles.quickActionIcon}>📱</Text>
            <Text style={styles.quickActionText}>Connect Device</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={onGeneratePlan}>
            <Text style={styles.quickActionIcon}>📈</Text>
            <Text style={styles.quickActionText}>Generate Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>🎯</Text>
            <Text style={styles.quickActionText}>Set Goals</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Sessions Tab Component
function SessionsTab({ sessions, onSessionPress, onStartSession, onEndSession, isInSession }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.sessionsHeader}>
        <Text style={styles.sessionsTitle}>Neuro Sessions</Text>
        {!isInSession && (
          <TouchableOpacity style={styles.startButton} onPress={() => onStartSession('focus')}>
            <Text style={styles.startButtonText}>+ Start</Text>
          </TouchableOpacity>
        )}
      </View>

      {sessions.length === 0 ? (
        <EmptyState
          title="No Sessions"
          message="Start your first neuro feedback session to optimize your cognitive performance"
          icon="🧠"
        />
      ) : (
        sessions.map((session: any) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => onSessionPress?.(session)}
            onEnd={() => onEndSession(session.id)}
          />
        ))
      )}
    </View>
  );
}

// Session Card Component
function SessionCard({ session, onPress, onEnd }: any) {
  return (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{session.type}</Text>
        <Badge 
          text={session.isActive ? 'Active' : 'Completed'} 
          color={session.isActive ? '#27AE60' : '#95A5A6'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.sessionDescription}>{session.description}</Text>
      <Text style={styles.sessionDate}>
        Started {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
      </Text>

      <View style={styles.sessionMetrics}>
        <Text style={styles.sessionMetric}>
          Duration: {session.duration} min
        </Text>
        <Text style={styles.sessionMetric}>
          Focus: {Math.round(session.averageFocus * 100)}%
        </Text>
      </View>

      <View style={styles.sessionFooter}>
        <TouchableOpacity style={styles.sessionDetailsButton} onPress={onPress}>
          <Text style={styles.sessionDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        {session.isActive && (
          <TouchableOpacity style={styles.sessionEndButton} onPress={onEnd}>
            <Text style={styles.sessionEndText}>End Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

// Devices Tab Component
function DevicesTab({ devices, onDevicePress, onConnectDevice, onDisconnectDevice, isDeviceConnected }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.devicesHeader}>
        <Text style={styles.devicesTitle}>Neuro Devices</Text>
        {!isDeviceConnected && (
          <TouchableOpacity style={styles.connectButton} onPress={() => onConnectDevice('eeg-001', 'eeg-headset')}>
            <Text style={styles.connectButtonText}>+ Connect</Text>
          </TouchableOpacity>
        )}
      </View>

      {devices.length === 0 ? (
        <EmptyState
          title="No Devices"
          message="Connect a neuro device to start monitoring your brain activity and cognitive performance"
          icon="📱"
        />
      ) : (
        devices.map((device: any) => (
          <DeviceCard
            key={device.id}
            device={device}
            onPress={() => onDevicePress?.(device)}
            onDisconnect={() => onDisconnectDevice(device.id)}
          />
        ))
      )}
    </View>
  );
}

// Device Card Component
function DeviceCard({ device, onPress, onDisconnect }: any) {
  return (
    <Card style={styles.deviceCard}>
      <View style={styles.deviceCardHeader}>
        <Text style={styles.deviceCardTitle}>{device.type}</Text>
        <Badge 
          text={device.isConnected ? 'Connected' : 'Disconnected'} 
          color={device.isConnected ? '#27AE60' : '#E74C3C'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.deviceCardDescription}>{device.description}</Text>
      <Text style={styles.deviceCardDate}>
        {device.isConnected 
          ? `Connected ${formatDistanceToNow(new Date(device.connectedAt), { addSuffix: true })}`
          : 'Not connected'
        }
      </Text>

      <View style={styles.deviceCardFooter}>
        <TouchableOpacity style={styles.deviceDetailsButton} onPress={onPress}>
          <Text style={styles.deviceDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        {device.isConnected && (
          <TouchableOpacity style={styles.deviceDisconnectButton} onPress={onDisconnect}>
            <Text style={styles.deviceDisconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

// Enhancements Tab Component
function EnhancementsTab({ protocols, plans, enhancements, onProtocolPress, onApplyProtocol, isOptimizing }: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.enhancementsHeader}>
        <Text style={styles.enhancementsTitle}>Cognitive Enhancements</Text>
        <Badge 
          text={isOptimizing ? 'Optimizing' : 'Ready'} 
          color={isOptimizing ? '#9B59B6' : '#27AE60'} 
          size="small" 
        />
      </View>

      {/* Protocols */}
      <View style={styles.protocolsContainer}>
        <Text style={styles.protocolsTitle}>Enhancement Protocols</Text>
        {protocols.length === 0 ? (
          <Text style={styles.protocolsEmpty}>No protocols available</Text>
        ) : (
          protocols.slice(0, 3).map((protocol: any) => (
            <TouchableOpacity key={protocol.id} style={styles.protocolItem} onPress={() => onProtocolPress?.(protocol)}>
              <Text style={styles.protocolName}>{protocol.name}</Text>
              <Text style={styles.protocolDescription}>{protocol.description}</Text>
              <TouchableOpacity style={styles.protocolApplyButton} onPress={() => onApplyProtocol(protocol.id)}>
                <Text style={styles.protocolApplyText}>Apply</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        <Text style={styles.plansTitle}>Optimization Plans</Text>
        {plans.length === 0 ? (
          <Text style={styles.plansEmpty}>No plans generated yet</Text>
        ) : (
          plans.slice(0, 2).map((plan: any) => (
            <View key={plan.id} style={styles.planItem}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <Badge 
                text={plan.isActive ? 'Active' : 'Inactive'} 
                color={plan.isActive ? '#27AE60' : '#95A5A6'} 
                size="small" 
              />
            </View>
          ))
        )}
      </View>

      {/* Active Enhancements */}
      <View style={styles.activeEnhancementsContainer}>
        <Text style={styles.activeEnhancementsTitle}>Active Enhancements</Text>
        {enhancements.length === 0 ? (
          <Text style={styles.activeEnhancementsEmpty}>No active enhancements</Text>
        ) : (
          enhancements.map((enhancement: any) => (
            <View key={enhancement.id} style={styles.enhancementItem}>
              <Text style={styles.enhancementName}>{enhancement.name}</Text>
              <Text style={styles.enhancementEffect}>{enhancement.effect}</Text>
              <Text style={styles.enhancementDuration}>
                {enhancement.duration} min remaining
              </Text>
            </View>
          ))
        )}
      </View>
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
    color: '#9B59B6',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  deviceContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  deviceList: {
    gap: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  cognitiveBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  cognitiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cognitiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cognitiveState: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginBottom: 8,
  },
  cognitiveDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
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
    borderBottomColor: '#9B59B6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#9B59B6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  performanceCard: {
    padding: 16,
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  performanceMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceMetric: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9B59B6',
  },
  focusCard: {
    padding: 16,
    marginBottom: 16,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  focusDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
  },
  fatigueCard: {
    padding: 16,
    marginBottom: 16,
  },
  fatigueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  fatigueDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
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
  predictionsCard: {
    padding: 16,
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  predictionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  predictionConfidence: {
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
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  startButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sessionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 8,
  },
  sessionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  sessionDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionEndButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#E74C3C',
    borderRadius: 4,
  },
  sessionEndText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  connectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27AE60',
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceCard: {
    padding: 16,
    marginBottom: 16,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  deviceCardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  deviceCardDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 8,
  },
  deviceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  deviceDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceDisconnectButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#E74C3C',
    borderRadius: 4,
  },
  deviceDisconnectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  enhancementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  enhancementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  protocolsContainer: {
    marginBottom: 24,
  },
  protocolsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  protocolsEmpty: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    padding: 20,
  },
  protocolItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 12,
  },
  protocolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  protocolDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  protocolApplyButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  protocolApplyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  plansContainer: {
    marginBottom: 24,
  },
  plansTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  plansEmpty: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    padding: 20,
  },
  planItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  activeEnhancementsContainer: {
    marginBottom: 16,
  },
  activeEnhancementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  activeEnhancementsEmpty: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    padding: 20,
  },
  enhancementItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 12,
  },
  enhancementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  enhancementEffect: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  enhancementDuration: {
    fontSize: 12,
    color: '#95A5A6',
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
    backgroundColor: '#9B59B6',
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
