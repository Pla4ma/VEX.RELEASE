/**
 * Quantum Algorithms Empty Component
 * 
 * Empty state component for quantum algorithms data, displaying dynamic messages,
 * action prompts, quick tips, feature highlights, supported quantum hardware,
 * benefits, and getting started guides.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';

interface QuantumAlgorithmsEmptyProps {
  type?: 'algorithms' | 'circuits' | 'hardware' | 'jobs' | 'ml_models' | 'metrics';
  onAction?: (actionId: string) => void;
}

export function QuantumAlgorithmsEmpty({
  type = 'algorithms',
  onAction,
}: QuantumAlgorithmsEmptyProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const getEmptyContent = () => {
    const content = {
      algorithms: {
        icon: '🔬',
        title: 'No Quantum Algorithms',
        message: 'Start by creating your first quantum algorithm to harness the power of quantum computing',
        actions: [
          { id: 'create_algorithm', title: 'Create Algorithm', description: 'Design a new quantum algorithm' },
          { id: 'import_algorithm', title: 'Import Algorithm', description: 'Import from quantum library' },
          { id: 'browse_templates', title: 'Browse Templates', description: 'Use pre-built quantum algorithms' },
        ],
      },
      circuits: {
        icon: '⚡',
        title: 'No Quantum Circuits',
        message: 'Design quantum circuits to implement your quantum algorithms',
        actions: [
          { id: 'create_circuit', title: 'Create Circuit', description: 'Build a new quantum circuit' },
          { id: 'visualize_circuit', title: 'Visualize', description: 'Design circuits visually' },
          { id: 'import_circuit', title: 'Import Circuit', description: 'Import QASM or other formats' },
        ],
      },
      hardware: {
        icon: '🖥️',
        title: 'No Quantum Hardware',
        message: 'Connect to quantum hardware providers to run your algorithms',
        actions: [
          { id: 'connect_hardware', title: 'Connect Hardware', description: 'Connect to quantum computers' },
          { id: 'browse_providers', title: 'Browse Providers', description: 'Explore quantum providers' },
          { id: 'simulator_mode', title: 'Use Simulator', description: 'Start with quantum simulator' },
        ],
      },
      jobs: {
        icon: '📋',
        title: 'No Quantum Jobs',
        message: 'Submit quantum jobs to execute algorithms on quantum hardware',
        actions: [
          { id: 'submit_job', title: 'Submit Job', description: 'Run quantum algorithm' },
          { id: 'queue_status', title: 'Check Queue', description: 'View job queue status' },
          { id: 'job_history', title: 'Job History', description: 'View past executions' },
        ],
      },
      ml_models: {
        icon: '🤖',
        title: 'No Quantum ML Models',
        message: 'Train quantum machine learning models for enhanced performance',
        actions: [
          { id: 'train_model', title: 'Train Model', description: 'Train quantum ML model' },
          { id: 'quantum_dataset', title: 'Prepare Data', description: 'Prepare quantum dataset' },
          { id: 'model_templates', title: 'Model Templates', description: 'Use quantum ML templates' },
        ],
      },
      metrics: {
        icon: '📊',
        title: 'No Quantum Metrics',
        message: 'Track performance metrics for your quantum algorithms and hardware',
        actions: [
          { id: 'setup_monitoring', title: 'Setup Monitoring', description: 'Configure quantum metrics' },
          { id: 'generate_report', title: 'Generate Report', description: 'Create performance report' },
          { id: 'benchmark_suite', title: 'Run Benchmarks', description: 'Execute quantum benchmarks' },
        ],
      },
    };

    return content[type] || content.algorithms;
  };

  const getQuickTips = () => {
    return [
      'Start with simple quantum algorithms like Grover\'s search or Deutsch-Jozsa',
      'Use quantum simulators before running on real hardware to save costs',
      'Consider quantum error correction for reliable results',
      'Optimize your quantum circuits for minimal depth and gate count',
      'Monitor quantum hardware queue times for efficient scheduling',
    ];
  };

  const getFeatureHighlights = () => {
    return [
      {
        name: 'Quantum Speedup',
        description: 'Achieve exponential speedup for certain computational problems',
        icon: '⚡',
      },
      {
        name: 'Quantum Supremacy',
        description: 'Demonstrate quantum advantage over classical computing',
        icon: '🏆',
      },
      {
        name: 'Quantum Entanglement',
        description: 'Utilize quantum correlations for enhanced computing power',
        icon: '🔗',
      },
      {
        name: 'Quantum Parallelism',
        description: 'Process multiple quantum states simultaneously',
        icon: '🔄',
      },
    ];
  };

  const getSupportedHardware = () => {
    return [
      { name: 'IBM Quantum', type: 'Superconducting', qubits: '433', status: 'Available' },
      { name: 'Google Sycamore', type: 'Superconducting', qubits: '54', status: 'Available' },
      { name: 'IonQ Harmony', type: 'Trapped Ion', qubits: '32', status: 'Available' },
      { name: 'Rigetti Aspen', type: 'Superconducting', qubits: '80', status: 'Available' },
      { name: 'Microsoft Azure', type: 'Hybrid', qubits: 'Various', status: 'Available' },
    ];
  };

  const getBenefits = () => {
    return [
      'Solve optimization problems exponentially faster',
      'Enhance machine learning with quantum algorithms',
      'Break cryptographic systems with quantum computing',
      'Simulate quantum systems with perfect accuracy',
      'Achieve computational advantages in specific domains',
    ];
  };

  const getGettingStartedSteps = () => {
    return [
      { step: 1, title: 'Learn Quantum Basics', description: 'Understand qubits, superposition, and entanglement' },
      { step: 2, title: 'Choose Algorithm', description: 'Select the right quantum algorithm for your problem' },
      { step: 3, title: 'Design Circuit', description: 'Create quantum circuit using gates and operations' },
      { step: 4, title: 'Test Simulation', description: 'Run on quantum simulator before real hardware' },
      { step: 5, title: 'Execute on Hardware', description: 'Submit job to quantum computer for execution' },
    ];
  };

  const content = getEmptyContent();
  const tips = getQuickTips();
  const highlights = getFeatureHighlights();
  const hardware = getSupportedHardware();
  const benefits = getBenefits();
  const steps = getGettingStartedSteps();

  const handleActionPress = (actionId: string) => {
    setSelectedAction(actionId);
    onAction?.(actionId);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Empty State Card */}
      <Card style={styles.mainCard}>
        <View style={styles.emptyHeader}>
          <Text style={styles.emptyIcon}>{content.icon}</Text>
          <Text style={styles.emptyTitle}>{content.title}</Text>
        </View>
        <Text style={styles.emptyMessage}>{content.message}</Text>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {content.actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                selectedAction === action.id && styles.selectedActionCard,
              ]}
              onPress={() => handleActionPress(action.id)}
            >
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
              <View style={styles.actionArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Quick Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Quantum Computing Tips</Text>
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
        <Text style={styles.highlightsTitle}>🚀 Quantum Computing Features</Text>
        <View style={styles.highlightsList}>
          {highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>{highlight.icon}</Text>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightName}>{highlight.name}</Text>
                <Text style={styles.highlightDescription}>{highlight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Supported Hardware */}
      <Card style={styles.hardwareCard}>
        <Text style={styles.hardwareTitle}>🖥️ Supported Quantum Hardware</Text>
        <View style={styles.hardwareList}>
          {hardware.map((item, index) => (
            <View key={index} style={styles.hardwareItem}>
              <View style={styles.hardwareInfo}>
                <Text style={styles.hardwareName}>{item.name}</Text>
                <Text style={styles.hardwareType}>{item.type}</Text>
              </View>
              <View style={styles.hardwareSpecs}>
                <Text style={styles.hardwareQubits}>{item.qubits} qubits</Text>
                <Badge text={item.status} variant="success" />
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Benefits */}
      <Card style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>🎯 Quantum Computing Benefits</Text>
        <View style={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Getting Started Guide */}
      <Card style={styles.guideCard}>
        <Text style={styles.guideTitle}>📚 Getting Started Guide</Text>
        <View style={styles.guideSteps}>
          {steps.map((step) => (
            <View key={step.step} style={styles.guideStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Success Metrics */}
      <Card style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>📈 Expected Success Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>1000x</Text>
            <Text style={styles.metricLabel}>Speedup for specific problems</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>99.9%</Text>
            <Text style={styles.metricLabel}>Quantum gate fidelity</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>433</Text>
            <Text style={styles.metricLabel}>Maximum qubits available</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>24/7</Text>
            <Text style={styles.metricLabel}>Quantum hardware access</Text>
          </View>
        </View>
      </Card>

      {/* Encouragement */}
      <Card style={styles.encouragementCard}>
        <Text style={styles.encouragementTitle}>🌟 Ready to Quantum Leap?</Text>
        <Text style={styles.encouragementText}>
          Join the quantum revolution and start solving problems that were impossible with classical computing. 
          The future of computing is quantum, and you can be part of it today!
        </Text>
        <Button
          title="Start Your Quantum Journey"
          onPress={() => handleActionPress('create_algorithm')}
          variant="primary"
          style={styles.encouragementButton}
        />
      </Card>
    </ScrollView>
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
  emptyHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedActionCard: {
    borderColor: '#3498DB',
    backgroundColor: '#EBF5FB',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  actionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 2,
  },
  actionArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: '#3498DB',
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
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
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  highlightsCard: {
    padding: 16,
    marginBottom: 16,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  highlightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  highlightContent: {
    flex: 1,
  },
  highlightName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  hardwareCard: {
    padding: 16,
    marginBottom: 16,
  },
  hardwareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  hardwareList: {
    gap: 8,
  },
  hardwareItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  hardwareInfo: {
    flex: 1,
  },
  hardwareName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  hardwareType: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  hardwareSpecs: {
    alignItems: 'flex-end',
    gap: 4,
  },
  hardwareQubits: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '500',
  },
  benefitsCard: {
    padding: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    padding: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  guideCard: {
    padding: 16,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  guideSteps: {
    gap: 12,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  metricsCard: {
    padding: 16,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 18,
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
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3498DB',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  encouragementCard: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  encouragementButton: {
    // Additional styling handled by Button component
  },
});
