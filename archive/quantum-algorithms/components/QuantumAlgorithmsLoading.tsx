/**
 * Quantum Algorithms Loading Component
 * 
 * Loading states for quantum algorithms operations with animated indicators,
 * progress feedback, loading steps, skeleton UI, quantum tips, feature highlights,
 * data source status, and system integration status.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

const { width } = Dimensions.get('window');

interface QuantumAlgorithmsLoadingProps {
  operation?: 'initialization' | 'algorithm_creation' | 'circuit_simulation' | 'hardware_connection' | 'job_execution' | 'model_training' | 'data_sync' | 'optimization';
  progress?: number;
  message?: string;
}

export function QuantumAlgorithmsLoading({
  operation = 'initialization',
  progress = 0,
  message,
}: QuantumAlgorithmsLoadingProps) {
  const [rotationAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(-20));
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Rotation animation for quantum icon
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 360,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Slide animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % getLoadingSteps().length);
    }, 2000);

    return () => {
      rotationAnimation.stop();
      pulseAnimation.stop();
      clearInterval(stepInterval);
    };
  }, []);

  const getLoadingSteps = () => {
    const steps = {
      initialization: [
        'Initializing quantum computing environment...',
        'Connecting to quantum hardware providers...',
        'Loading quantum algorithm library...',
        'Calibrating quantum processors...',
        'Establishing quantum entanglement channels...',
      ],
      algorithm_creation: [
        'Validating quantum algorithm parameters...',
        'Checking quantum circuit compatibility...',
        'Optimizing gate sequences...',
        'Calculating quantum complexity...',
        'Preparing quantum execution environment...',
      ],
      circuit_simulation: [
        'Building quantum circuit model...',
        'Initializing qubit states...',
        'Applying quantum gates...',
        'Measuring quantum states...',
        'Analyzing quantum interference patterns...',
      ],
      hardware_connection: [
        'Scanning available quantum hardware...',
        'Establishing quantum connection...',
        'Calibrating quantum processors...',
        'Validating quantum gate fidelity...',
        'Preparing quantum execution queue...',
      ],
      job_execution: [
        'Queueing quantum job...',
        'Allocating quantum resources...',
        'Executing quantum algorithm...',
        'Monitoring quantum coherence...',
        'Collecting quantum measurement results...',
      ],
      model_training: [
        'Initializing quantum neural network...',
        'Preparing quantum training data...',
        'Training quantum model parameters...',
        'Optimizing quantum circuit depth...',
        'Validating quantum model accuracy...',
      ],
      data_sync: [
        'Synchronizing quantum data...',
        'Updating quantum state database...',
        'Validating quantum measurement integrity...',
        'Compressing quantum data streams...',
        'Finalizing quantum synchronization...',
      ],
      optimization: [
        'Analyzing quantum optimization landscape...',
        'Applying quantum gradient descent...',
        'Exploring quantum solution space...',
        'Refining quantum parameters...',
        'Converging to optimal quantum solution...',
      ],
    };

    return steps[operation] || steps.initialization;
  };

  const getQuantumTips = () => {
    return [
      'Quantum computers use qubits that can exist in superposition',
      'Quantum entanglement allows instant correlation between distant qubits',
      'Quantum algorithms can solve certain problems exponentially faster',
      'Quantum error correction is essential for reliable quantum computing',
      'Quantum supremacy demonstrates advantage over classical computers',
    ];
  };

  const getFeatureHighlights = () => {
    return [
      { name: 'Quantum Optimization', description: 'Solve complex optimization problems using quantum algorithms' },
      { name: 'Quantum Machine Learning', description: 'Enhance ML models with quantum computing capabilities' },
      { name: 'Quantum Cryptography', description: 'Secure communications using quantum key distribution' },
      { name: 'Quantum Simulation', description: 'Simulate quantum systems with unprecedented accuracy' },
    ];
  };

  const getDataSourceStatus = () => {
    return [
      { name: 'IBM Quantum', status: 'connected', latency: '45ms' },
      { name: 'Google Quantum AI', status: 'connected', latency: '32ms' },
      { name: 'IonQ', status: 'connected', latency: '28ms' },
      { name: 'Rigetti Computing', status: 'connecting', latency: '--' },
      { name: 'Microsoft Azure Quantum', status: 'connected', latency: '51ms' },
    ];
  };

  const getSystemIntegrationStatus = () => {
    return [
      { system: 'Quantum SDK', status: 'active', version: '2.1.0' },
      { system: 'Circuit Compiler', status: 'active', version: '1.8.3' },
      { system: 'Error Correction', status: 'active', version: '3.2.1' },
      { system: 'Quantum Simulator', status: 'active', version: '4.0.2' },
      { system: 'Hardware Interface', status: 'active', version: '2.5.0' },
    ];
  };

  const steps = getLoadingSteps();
  const tips = getQuantumTips();
  const highlights = getFeatureHighlights();
  const dataSources = getDataSourceStatus();
  const integrations = getSystemIntegrationStatus();

  return (
    <View style={styles.container}>
      {/* Main Loading Card */}
      <Card style={styles.mainCard}>
        <View style={styles.loadingHeader}>
          <Animated.View
            style={[
              styles.quantumIconContainer,
              {
                transform: [
                  { rotate: rotationAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <Text style={styles.quantumIcon}>⚛️</Text>
          </Animated.View>
          <View style={styles.loadingTitleContainer}>
            <Text style={styles.loadingTitle}>Quantum Computing</Text>
            <Badge text={operation.replace('_', ' ')} variant="primary" />
          </View>
        </View>

        <Animated.View
          style={[
            styles.loadingContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.loadingMessage}>
            {message || steps[currentStep]}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              color="#3498DB"
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(progress)}% Complete
            </Text>
          </View>

          {/* Loading Steps */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Quantum Processing Steps:</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[
                  styles.stepIndicator,
                  index === currentStep && styles.activeStep,
                  index < currentStep && styles.completedStep,
                ]}>
                  {index < currentStep ? '✓' : index + 1}
                </View>
                <Text style={[
                  styles.stepText,
                  index === currentStep && styles.activeStepText,
                  index < currentStep && styles.completedStepText,
                ]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </Card>

      {/* Quantum Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Quantum Computing Insights</Text>
        <View style={styles.tipsList}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Feature Highlights */}
      <Card style={styles.highlightsCard}>
        <Text style={styles.highlightsTitle}>🚀 Quantum Capabilities</Text>
        <View style={styles.highlightsList}>
          {highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Text style={styles.highlightName}>{highlight.name}</Text>
              <Text style={styles.highlightDescription}>{highlight.description}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Data Source Status */}
      <Card style={styles.dataSourcesCard}>
        <Text style={styles.dataSourcesTitle}>🔌 Quantum Hardware Connections</Text>
        <View style={styles.dataSourcesList}>
          {dataSources.map((source, index) => (
            <View key={index} style={styles.dataSourceItem}>
              <Text style={styles.dataSourceName}>{source.name}</Text>
              <View style={styles.dataSourceStatus}>
                <Badge 
                  text={source.status} 
                  variant={source.status === 'connected' ? 'success' : 'warning'}
                />
                <Text style={styles.dataSourceLatency}>{source.latency}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* System Integration Status */}
      <Card style={styles.integrationCard}>
        <Text style={styles.integrationTitle}>🔧 System Integration</Text>
        <View style={styles.integrationList}>
          {integrations.map((integration, index) => (
            <View key={index} style={styles.integrationItem}>
              <Text style={styles.integrationName}>{integration.system}</Text>
              <View style={styles.integrationStatus}>
                <Badge 
                  text={integration.status} 
                  variant={integration.status === 'active' ? 'success' : 'danger'}
                />
                <Text style={styles.integrationVersion}>{integration.version}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Processing Metrics */}
      <Card style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>📊 Quantum Processing Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>127</Text>
            <Text style={styles.metricLabel}>Available Qubits</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>99.9%</Text>
            <Text style={styles.metricLabel}>Gate Fidelity</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>2.1ms</Text>
            <Text style={styles.metricLabel}>Gate Time</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>150ms</Text>
            <Text style={styles.metricLabel}>Coherence Time</Text>
          </View>
        </View>
      </Card>

      {/* Safety Information */}
      <Card style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>⚠️ Quantum Safety Guidelines</Text>
        <View style={styles.safetyList}>
          <View style={styles.safetyItem}>
            <Text style={styles.safetyText}>• Ensure proper quantum error correction</Text>
          </View>
          <View style={styles.safetyItem}>
            <Text style={styles.safetyText}>• Monitor quantum decoherence rates</Text>
          </View>
          <View style={styles.safetyItem}>
            <Text style={styles.safetyText}>• Validate quantum measurement results</Text>
          </View>
          <View style={styles.safetyItem}>
            <Text style={styles.safetyText}>• Maintain quantum hardware calibration</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  mainCard: {
    padding: 20,
    marginBottom: 16,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantumIconContainer: {
    marginRight: 16,
  },
  quantumIcon: {
    fontSize: 48,
  },
  loadingTitleContainer: {
    flex: 1,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  loadingContent: {
    gap: 16,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '500',
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E1E8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeStep: {
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
  },
  completedStep: {
    backgroundColor: '#27AE60',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#7F8C8D',
  },
  activeStepText: {
    color: '#3498DB',
    fontWeight: '500',
  },
  completedStepText: {
    color: '#27AE60',
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    padding: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  highlightsCard: {
    padding: 16,
    marginBottom: 16,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    padding: 8,
  },
  highlightName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  dataSourcesCard: {
    padding: 16,
    marginBottom: 16,
  },
  dataSourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  dataSourcesList: {
    gap: 8,
  },
  dataSourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  dataSourceName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  dataSourceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataSourceLatency: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  integrationCard: {
    padding: 16,
    marginBottom: 16,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  integrationList: {
    gap: 8,
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  integrationName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  integrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  integrationVersion: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  metricsCard: {
    padding: 16,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  safetyCard: {
    padding: 16,
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  safetyList: {
    gap: 4,
  },
  safetyItem: {
    padding: 4,
  },
  safetyText: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
});
