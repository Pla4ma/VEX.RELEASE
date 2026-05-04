/**
 * Quantum Algorithms Error Component
 * 
 * Error handling component for quantum algorithms operations, providing detailed
 * messages, retry functionality, suggestions, troubleshooting steps, and quantum-specific tips.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface QuantumAlgorithmsErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  errorType?: 'algorithm_creation' | 'circuit_simulation' | 'hardware_connection' | 'job_execution' | 'model_training' | 'data_sync' | 'optimization' | 'calibration' | 'authentication' | 'network' | 'unknown';
  retryCount?: number;
  maxRetries?: number;
}

export function QuantumAlgorithmsError({
  error,
  onRetry,
  onDismiss,
  errorType = 'unknown',
  retryCount = 0,
  maxRetries = 3,
}: QuantumAlgorithmsErrorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getErrorContent = () => {
    const content = {
      algorithm_creation: {
        title: 'Algorithm Creation Failed',
        message: 'Unable to create quantum algorithm',
        suggestions: [
          'Check algorithm parameters and quantum circuit design',
          'Verify quantum gate compatibility with target hardware',
          'Ensure quantum complexity is within hardware limits',
          'Validate quantum algorithm implementation',
        ],
        technicalDetails: [
          'Quantum circuit depth exceeds hardware capabilities',
          'Invalid quantum gate sequence detected',
          'Insufficient quantum resources available',
          'Quantum algorithm validation failed',
        ],
        troubleshooting: [
          'Reduce circuit depth or use quantum error correction',
          'Check quantum hardware specifications and constraints',
          'Verify quantum gate library compatibility',
          'Consider using quantum circuit optimization',
        ],
        quantumTips: [
          'Start with simpler quantum algorithms and gradually increase complexity',
          'Use quantum simulators for testing before real hardware',
          'Consider quantum compilation for hardware-specific optimization',
          'Monitor quantum resource requirements during development',
        ],
      },
      circuit_simulation: {
        title: 'Circuit Simulation Failed',
        message: 'Unable to simulate quantum circuit',
        suggestions: [
          'Check quantum circuit design and gate sequences',
          'Verify qubit initialization and measurement',
          'Ensure quantum simulator is properly configured',
          'Check for quantum decoherence issues',
        ],
        technicalDetails: [
          'Quantum circuit simulation timeout',
          'Insufficient memory for quantum state simulation',
          'Invalid quantum gate parameters',
          'Quantum measurement configuration error',
        ],
        troubleshooting: [
          'Reduce number of qubits in simulation',
          'Use approximate quantum simulation methods',
          'Check quantum simulator resource limits',
          'Verify quantum gate implementations',
        ],
        quantumTips: [
          'Large quantum circuits require significant computational resources',
          'Consider using tensor network methods for large systems',
          'Quantum noise modeling can affect simulation accuracy',
          'Use quantum circuit decomposition for complex algorithms',
        ],
      },
      hardware_connection: {
        title: 'Hardware Connection Failed',
        message: 'Unable to connect to quantum hardware',
        suggestions: [
          'Check quantum hardware availability and status',
          'Verify network connectivity to quantum providers',
          'Ensure authentication credentials are valid',
          'Check quantum hardware queue status',
        ],
        technicalDetails: [
          'Quantum hardware API authentication failed',
          'Network connectivity to quantum provider lost',
          'Quantum hardware currently unavailable',
          'Quantum hardware queue at maximum capacity',
        ],
        troubleshooting: [
          'Check quantum hardware provider status page',
          'Verify API keys and authentication tokens',
          'Test network connectivity to quantum services',
          'Consider alternative quantum hardware providers',
        ],
        quantumTips: [
          'Quantum hardware has limited availability and scheduling',
          'Different quantum providers have different API requirements',
          'Quantum hardware calibration can affect availability',
          'Queue times vary significantly between providers',
        ],
      },
      job_execution: {
        title: 'Job Execution Failed',
        message: 'Unable to execute quantum job',
        suggestions: [
          'Check quantum job parameters and configuration',
          'Verify quantum hardware availability',
          'Ensure quantum circuit is compatible with target hardware',
          'Check quantum job queue status',
        ],
        technicalDetails: [
          'Quantum job rejected by hardware scheduler',
          'Quantum circuit exceeds hardware capabilities',
          'Quantum job execution timeout',
          'Quantum hardware error during execution',
        ],
        troubleshooting: [
          'Reduce quantum circuit complexity',
          'Check quantum hardware specifications',
          'Verify quantum job submission format',
          'Monitor quantum job queue and scheduling',
        ],
        quantumTips: [
          'Quantum jobs can take significant time to complete',
          'Hardware-specific constraints affect job execution',
          'Quantum error rates impact job success',
          'Job priority affects scheduling and execution time',
        ],
      },
      model_training: {
        title: 'Model Training Failed',
        message: 'Unable to train quantum machine learning model',
        suggestions: [
          'Check quantum model architecture and parameters',
          'Verify training data format and preprocessing',
          'Ensure quantum hardware resources are sufficient',
          'Check quantum training algorithm configuration',
        ],
        technicalDetails: [
          'Quantum model architecture incompatible with hardware',
          'Insufficient quantum training data',
          'Quantum training algorithm convergence failed',
          'Quantum resource exhaustion during training',
        ],
        troubleshooting: [
          'Simplify quantum model architecture',
          'Increase quantum training data quality',
          'Adjust quantum training hyperparameters',
          'Use quantum-classical hybrid training',
        ],
        quantumTips: [
          'Quantum ML models require careful hyperparameter tuning',
          'Quantum training data must be properly encoded',
          'Quantum feature maps significantly affect performance',
          'Quantum advantage depends on problem structure',
        ],
      },
      data_sync: {
        title: 'Data Synchronization Failed',
        message: 'Unable to synchronize quantum data',
        suggestions: [
          'Check network connectivity and bandwidth',
          'Verify quantum data format and integrity',
          'Ensure sufficient storage space for quantum data',
          'Check quantum data compression settings',
        ],
        technicalDetails: [
          'Quantum data transmission timeout',
          'Quantum data corruption detected',
          'Insufficient storage for quantum states',
          'Quantum data compression failed',
        ],
        troubleshooting: [
          'Check network connection stability',
          'Verify quantum data integrity checksums',
          'Increase available storage capacity',
          'Adjust quantum data compression parameters',
        ],
        quantumTips: [
          'Quantum data can be large due to state vector representation',
          'Quantum data compression preserves essential information',
          'Network bandwidth affects quantum data transfer speed',
          'Quantum data integrity is crucial for accurate results',
        ],
      },
      optimization: {
        title: 'Quantum Optimization Failed',
        message: 'Unable to perform quantum optimization',
        suggestions: [
          'Check optimization problem formulation',
          'Verify quantum optimization algorithm parameters',
          'Ensure objective function is properly encoded',
          'Check convergence criteria and tolerances',
        ],
        technicalDetails: [
          'Quantum optimization algorithm failed to converge',
          'Invalid objective function encoding',
          'Insufficient quantum resources for optimization',
          'Quantum optimization landscape analysis failed',
        ],
        troubleshooting: [
          'Adjust quantum optimization parameters',
          'Reformulate optimization problem for quantum',
          'Increase quantum optimization iterations',
          'Use hybrid quantum-classical optimization',
        ],
        quantumTips: [
          'Quantum optimization requires careful problem encoding',
          'Convergence criteria affect optimization quality',
          'Quantum advantage depends on problem structure',
          'Hybrid approaches often provide best results',
        ],
      },
      calibration: {
        title: 'Quantum Calibration Failed',
        message: 'Unable to calibrate quantum system',
        suggestions: [
          'Check quantum hardware calibration procedures',
          'Verify calibration parameters and tolerances',
          'Ensure quantum hardware is in proper state',
          'Check environmental conditions affecting calibration',
        ],
        technicalDetails: [
          'Quantum gate calibration failed',
          'Qubit calibration out of tolerance',
          'Quantum measurement calibration error',
          'Environmental interference detected',
        ],
        troubleshooting: [
          'Allow quantum hardware to stabilize',
          'Check environmental conditions',
          'Verify calibration procedures',
          'Contact quantum hardware provider',
        ],
        quantumTips: [
          'Quantum calibration is essential for accurate results',
          'Environmental factors affect quantum hardware performance',
          'Regular calibration maintains quantum hardware quality',
          'Calibration procedures vary between hardware types',
        ],
      },
      authentication: {
        title: 'Authentication Failed',
        message: 'Unable to authenticate with quantum services',
        suggestions: [
          'Check API keys and authentication tokens',
          'Verify quantum service account permissions',
          'Ensure authentication credentials are current',
          'Check quantum service subscription status',
        ],
        technicalDetails: [
          'Invalid API key or authentication token',
          'Insufficient permissions for quantum operations',
          'Authentication token expired',
          'Quantum service account suspended',
        ],
        troubleshooting: [
          'Regenerate API keys and tokens',
          'Check account permissions and subscriptions',
          'Verify authentication endpoint URLs',
          'Contact quantum service provider support',
        ],
        quantumTips: [
          'Quantum services require valid authentication',
          'API keys have expiration dates and usage limits',
          'Different quantum providers use different auth methods',
          'Account permissions affect available quantum resources',
        ],
      },
      network: {
        title: 'Network Connection Failed',
        message: 'Unable to connect to quantum network',
        suggestions: [
          'Check internet connectivity and firewall settings',
          'Verify quantum service endpoint URLs',
          'Ensure DNS resolution is working properly',
          'Check network latency and bandwidth',
        ],
        technicalDetails: [
          'Network timeout connecting to quantum services',
          'DNS resolution failed for quantum endpoints',
          'Firewall blocking quantum service connections',
          'Insufficient network bandwidth for quantum operations',
        ],
        troubleshooting: [
          'Test network connectivity to quantum services',
          'Check firewall and security settings',
          'Verify DNS configuration',
          'Contact network administrator if needed',
        ],
        quantumTips: [
          'Quantum services require stable internet connections',
          'Network latency affects quantum job submission',
          'Firewall rules may block quantum service access',
          'Quantum operations can be bandwidth-intensive',
        ],
      },
      unknown: {
        title: 'Unknown Error Occurred',
        message: 'An unexpected error occurred in quantum operations',
        suggestions: [
          'Try refreshing the quantum algorithms interface',
          'Check quantum service status for known issues',
          'Restart the quantum application if needed',
          'Contact support if the issue persists',
        ],
        technicalDetails: [
          'Unexpected quantum system error',
          'Quantum service internal error',
          'Quantum hardware unknown failure',
          'Quantum algorithm execution error',
        ],
        troubleshooting: [
          'Check quantum service status page',
          'Review recent quantum operations for patterns',
          'Restart quantum application and services',
          'Report issue to quantum service provider',
        ],
        quantumTips: [
          'Quantum systems can have unexpected failures',
          'Service status pages provide outage information',
          'Regular maintenance can prevent some issues',
          'Error logs help diagnose quantum problems',
        ],
      },
    };

    return content[errorType] || content.unknown;
  };

  const content = getErrorContent();
  const canRetry = retryCount < maxRetries;
  const retryProgress = (retryCount / maxRetries) * 100;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return content.message;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Error Card */}
      <Card style={styles.mainCard}>
        <View style={styles.errorHeader}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <View style={styles.errorTitleContainer}>
            <Text style={styles.errorTitle}>{content.title}</Text>
            <Badge text={errorType.replace('_', ' ')} variant="danger" />
          </View>
        </View>

        <Text style={styles.errorMessage}>{getErrorMessage()}</Text>

        {/* Retry Progress */}
        {maxRetries > 0 && (
          <View style={styles.retryProgressContainer}>
            <Text style={styles.retryProgressTitle}>Retry Progress</Text>
            <ProgressBar 
              progress={retryProgress} 
              color={canRetry ? '#F39C12' : '#E74C3C'}
            />
            <Text style={styles.retryProgressText}>
              Attempt {retryCount + 1} of {maxRetries}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canRetry && onRetry && (
            <Button
              title="Retry"
              onPress={onRetry}
              variant="primary"
              style={styles.retryButton}
            />
          )}
          {onDismiss && (
            <Button
              title="Dismiss"
              onPress={onDismiss}
              variant="secondary"
              style={styles.dismissButton}
            />
          )}
        </View>
      </Card>

      {/* Suggestions */}
      <Card style={styles.suggestionsCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('suggestions')}
        >
          <Text style={styles.sectionTitle}>💡 Suggestions</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'suggestions' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'suggestions' && (
          <View style={styles.suggestionsList}>
            {content.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Technical Details */}
      <Card style={styles.technicalCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('technical')}
        >
          <Text style={styles.sectionTitle}>🔧 Technical Details</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'technical' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'technical' && (
          <View style={styles.technicalList}>
            {content.technicalDetails.map((detail, index) => (
              <View key={index} style={styles.technicalItem}>
                <Text style={styles.technicalText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Troubleshooting */}
      <Card style={styles.troubleshootingCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('troubleshooting')}
        >
          <Text style={styles.sectionTitle}>🔍 Troubleshooting</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'troubleshooting' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'troubleshooting' && (
          <View style={styles.troubleshootingList}>
            {content.troubleshooting.map((step, index) => (
              <View key={index} style={styles.troubleshootingItem}>
                <Text style={styles.troubleshootingText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Quantum Tips */}
      <Card style={styles.tipsCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('tips')}
        >
          <Text style={styles.sectionTitle}>⚛️ Quantum Tips</Text>
          <Text style={styles.expandIcon}>
            {expandedSection === 'tips' ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {expandedSection === 'tips' && (
          <View style={styles.tipsList}>
            {content.quantumTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* System Status */}
      <Card style={styles.statusCard}>
        <Text style={styles.statusTitle}>🖥️ System Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Quantum Services:</Text>
            <Badge text="Checking..." variant="warning" />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Hardware Status:</Text>
            <Badge text="Limited" variant="warning" />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Network:</Text>
            <Badge text="Connected" variant="success" />
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Authentication:</Text>
            <Badge text="Valid" variant="success" />
          </View>
        </View>
      </Card>

      {/* Support Options */}
      <Card style={styles.supportCard}>
        <Text style={styles.supportTitle}>📞 Support Options</Text>
        <View style={styles.supportOptions}>
          <Button
            title="View Documentation"
            onPress={() => {}}
            variant="secondary"
            style={styles.supportButton}
          />
          <Button
            title="Contact Support"
            onPress={() => {}}
            variant="secondary"
            style={styles.supportButton}
          />
          <Button
            title="Report Issue"
            onPress={() => {}}
            variant="secondary"
            style={styles.supportButton}
          />
        </View>
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
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  errorTitleContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryProgressContainer: {
    marginBottom: 20,
  },
  retryProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  retryProgressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
  },
  dismissButton: {
    flex: 1,
  },
  suggestionsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  expandIcon: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    padding: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  technicalCard: {
    padding: 16,
    marginBottom: 16,
  },
  technicalList: {
    gap: 8,
  },
  technicalItem: {
    padding: 8,
  },
  technicalText: {
    fontSize: 13,
    color: '#7F8C8D',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  troubleshootingCard: {
    padding: 16,
    marginBottom: 16,
  },
  troubleshootingList: {
    gap: 8,
  },
  troubleshootingItem: {
    padding: 8,
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  tipsCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    padding: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#3498DB',
    lineHeight: 20,
  },
  statusCard: {
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  supportCard: {
    padding: 16,
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  supportOptions: {
    gap: 8,
  },
  supportButton: {
    marginBottom: 8,
  },
});
