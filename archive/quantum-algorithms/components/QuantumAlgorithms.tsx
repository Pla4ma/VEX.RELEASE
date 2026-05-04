/**
 * Quantum Algorithms Component
 * 
 * Main UI component for quantum algorithms features including quantum computing,
 * quantum optimization, quantum machine learning, quantum cryptography,
 * and quantum simulation capabilities.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { useQuantumAlgorithms } from './useQuantumAlgorithms';
import { QuantumAlgorithmsLoading } from './QuantumAlgorithmsLoading';
import { QuantumAlgorithmsError } from './QuantumAlgorithmsError';

const { width } = Dimensions.get('window');

interface QuantumAlgorithmsProps {
  userId: string;
  onAlgorithmPress?: (algorithm: any) => void;
  onHardwarePress?: (hardware: any) => void;
  onJobPress?: (job: any) => void;
  onModelPress?: (model: any) => void;
}

export function QuantumAlgorithms({
  userId,
  onAlgorithmPress,
  onHardwarePress,
  onJobPress,
  onModelPress,
}: QuantumAlgorithmsProps) {
  const {
    algorithms,
    circuits,
    hardware,
    jobs,
    metrics,
    ml_models,
    loading,
    error,
    selectedAlgorithm,
    selectedHardware,
    currentTab,
    showCreateAlgorithm,
    showCreateCircuit,
    showRunJob,
    showResults,
    showHardwareDetails,
    algorithmFilter,
    hardwareFilter,
    statusFilter,
    typeFilter,
    currentPage,
    itemsPerPage,
    initialize,
    refresh,
    createAlgorithm,
    updateAlgorithm,
    deleteAlgorithm,
    runAlgorithm,
    stopAlgorithm,
    createCircuit,
    updateCircuit,
    deleteCircuit,
    optimizeCircuit,
    simulateCircuit,
    getHardware,
    selectHardware,
    getHardwareStatus,
    submitJob,
    cancelJob,
    getJobResults,
    retryJob,
    trainModel,
    predict,
    evaluateModel,
    getMetrics,
    generateReport,
    setSelectedAlgorithm,
    setSelectedHardware,
    setCurrentTab,
    setShowCreateAlgorithm,
    setShowCreateCircuit,
    setShowRunJob,
    setShowResults,
    setShowHardwareDetails,
    setAlgorithmFilter,
    setHardwareFilter,
    setStatusFilter,
    setTypeFilter,
    setCurrentPage,
    setItemsPerPage,
    setError,
    clearError,
  } = useQuantumAlgorithms();

  const [newAlgorithm, setNewAlgorithm] = useState({
    name: '',
    type: 'optimization' as const,
    description: '',
    complexity: 'medium' as const,
    qubits: 10,
    depth: 50,
  });

  const [newCircuit, setNewCircuit] = useState({
    name: '',
    algorithm_id: '',
    qubits: 4,
    depth: 10,
  });

  const [newModel, setNewModel] = useState({
    name: '',
    type: 'qsvm' as const,
    architecture: 'default',
    parameters: 100,
    dataset_size: 1000,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleCreateAlgorithm = async () => {
    try {
      await createAlgorithm(newAlgorithm);
      setNewAlgorithm({
        name: '',
        type: 'optimization',
        description: '',
        complexity: 'medium',
        qubits: 10,
        depth: 50,
      });
    } catch (error) {
      setError(error);
    }
  };

  const handleCreateCircuit = async () => {
    try {
      await createCircuit(newCircuit);
      setNewCircuit({
        name: '',
        algorithm_id: '',
        qubits: 4,
        depth: 10,
      });
    } catch (error) {
      setError(error);
    }
  };

  const handleTrainModel = async () => {
    try {
      await trainModel(newModel);
      setNewModel({
        name: '',
        type: 'qsvm',
        architecture: 'default',
        parameters: 100,
        dataset_size: 1000,
      });
    } catch (error) {
      setError(error);
    }
  };

  const handleRunAlgorithm = async (algorithmId: string) => {
    if (!selectedHardware) {
      setError('Please select hardware first');
      return;
    }
    try {
      await runAlgorithm(algorithmId, selectedHardware.id);
    } catch (error) {
      setError(error);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return '#27AE60';
      case 'medium': return '#F39C12';
      case 'high': return '#E67E22';
      case 'quantum_supremacy': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return '#95A5A6';
      case 'running': return '#3498DB';
      case 'completed': return '#27AE60';
      case 'failed': return '#E74C3C';
      case 'paused': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  const getHardwareStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#27AE60';
      case 'offline': return '#95A5A6';
      case 'maintenance': return '#F39C12';
      case 'busy': return '#E67E22';
      default: return '#95A5A6';
    }
  };

  const filteredAlgorithms = algorithms.filter(algo => {
    const matchesFilter = algo.name.toLowerCase().includes(algorithmFilter.toLowerCase());
    const matchesType = !typeFilter || algo.type === typeFilter;
    const matchesStatus = !statusFilter || algo.status === statusFilter;
    return matchesFilter && matchesType && matchesStatus;
  });

  const filteredHardware = hardware.filter(hw => 
    hw.name.toLowerCase().includes(hardwareFilter.toLowerCase())
  );

  if (loading && algorithms.length === 0) {
    return <QuantumAlgorithmsLoading />;
  }

  if (error) {
    return <QuantumAlgorithmsError error={error} onRetry={refresh} onDismiss={clearError} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🔬 Quantum Algorithms</Text>
          <Text style={styles.headerSubtitle}>Advanced Quantum Computing Solutions</Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{algorithms.length}</Text>
              <Text style={styles.statLabel}>Algorithms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{hardware.filter(hw => hw.status === 'online').length}</Text>
              <Text style={styles.statLabel}>Online Hardware</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jobs.filter(job => job.status === 'running').length}</Text>
              <Text style={styles.statLabel}>Running Jobs</Text>
            </View>
          </View>
        </View>
        <Button
          title="Refresh"
          onPress={refresh}
          variant="secondary"
          style={styles.refreshButton}
        />
      </Card>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { id: 'algorithms', label: 'Algorithms', icon: '🔬' },
          { id: 'circuits', label: 'Circuits', icon: '⚡' },
          { id: 'hardware', label: 'Hardware', icon: '🖥️' },
          { id: 'jobs', label: 'Jobs', icon: '📋' },
          { id: 'ml_models', label: 'ML Models', icon: '🤖' },
          { id: 'metrics', label: 'Metrics', icon: '📊' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              currentTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setCurrentTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              currentTab === tab.id && styles.activeTabLabel,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Algorithms Tab */}
      {currentTab === 'algorithms' && (
        <View style={styles.tabContent}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quantum Algorithms</Text>
              <Button
                title="Create Algorithm"
                onPress={() => setShowCreateAlgorithm(true)}
                variant="primary"
                style={styles.createButton}
              />
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
              <TextInput
                style={styles.filterInput}
                placeholder="Search algorithms..."
                value={algorithmFilter}
                onChangeText={setAlgorithmFilter}
              />
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterChip, !typeFilter && styles.activeFilterChip]}
                  onPress={() => setTypeFilter('')}
                >
                  <Text style={styles.filterChipText}>All Types</Text>
                </TouchableOpacity>
                {['optimization', 'machine_learning', 'cryptography', 'simulation', 'search', 'factoring'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, typeFilter === type && styles.activeFilterChip]}
                    onPress={() => setTypeFilter(type)}
                  >
                    <Text style={styles.filterChipText}>{type.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Algorithm List */}
            {filteredAlgorithms.map((algorithm) => (
              <TouchableOpacity
                key={algorithm.id}
                style={styles.algorithmCard}
                onPress={() => {
                  setSelectedAlgorithm(algorithm);
                  onAlgorithmPress?.(algorithm);
                }}
              >
                <View style={styles.algorithmHeader}>
                  <Text style={styles.algorithmName}>{algorithm.name}</Text>
                  <View style={styles.algorithmBadges}>
                    <Badge text={algorithm.type.replace('_', ' ')} variant="primary" />
                    <Badge 
                      text={algorithm.complexity.replace('_', ' ')} 
                      variant="secondary"
                      style={{ backgroundColor: getComplexityColor(algorithm.complexity) }}
                    />
                  </View>
                </View>
                <Text style={styles.algorithmDescription}>{algorithm.description}</Text>
                <View style={styles.algorithmMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Qubits:</Text>
                    <Text style={styles.metricValue}>{algorithm.qubits}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Depth:</Text>
                    <Text style={styles.metricValue}>{algorithm.depth}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Fidelity:</Text>
                    <Text style={styles.metricValue}>{(algorithm.fidelity * 100).toFixed(1)}%</Text>
                  </View>
                </View>
                <View style={styles.algorithmStatus}>
                  <Badge 
                    text={algorithm.status} 
                    variant="secondary"
                    style={{ backgroundColor: getStatusColor(algorithm.status) }}
                  />
                  {algorithm.status === 'running' && (
                    <ProgressBar 
                      progress={algorithm.progress} 
                      color="#3498DB"
                      style={styles.algorithmProgress}
                    />
                  )}
                </View>
                <View style={styles.algorithmActions}>
                  {algorithm.status === 'idle' && (
                    <Button
                      title="Run"
                      onPress={() => handleRunAlgorithm(algorithm.id)}
                      variant="primary"
                      style={styles.actionButton}
                    />
                  )}
                  {algorithm.status === 'running' && (
                    <Button
                      title="Stop"
                      onPress={() => stopAlgorithm(algorithm.id)}
                      variant="danger"
                      style={styles.actionButton}
                    />
                  )}
                  <Button
                    title="Details"
                    onPress={() => setSelectedAlgorithm(algorithm)}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {/* Circuits Tab */}
      {currentTab === 'circuits' && (
        <View style={styles.tabContent}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quantum Circuits</Text>
              <Button
                title="Create Circuit"
                onPress={() => setShowCreateCircuit(true)}
                variant="primary"
                style={styles.createButton}
              />
            </View>

            {circuits.map((circuit) => (
              <TouchableOpacity
                key={circuit.id}
                style={styles.circuitCard}
                onPress={() => onAlgorithmPress?.(circuit)}
              >
                <View style={styles.circuitHeader}>
                  <Text style={styles.circuitName}>{circuit.name}</Text>
                  {circuit.optimized && (
                    <Badge text="Optimized" variant="success" />
                  )}
                </View>
                <View style={styles.circuitMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Qubits:</Text>
                    <Text style={styles.metricValue}>{circuit.qubits}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Depth:</Text>
                    <Text style={styles.metricValue}>{circuit.depth}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Fidelity:</Text>
                    <Text style={styles.metricValue}>{(circuit.fidelity * 100).toFixed(1)}%</Text>
                  </View>
                </View>
                <View style={styles.circuitActions}>
                  <Button
                    title="Simulate"
                    onPress={() => simulateCircuit(circuit.id)}
                    variant="primary"
                    style={styles.actionButton}
                  />
                  {!circuit.optimized && (
                    <Button
                      title="Optimize"
                      onPress={() => optimizeCircuit(circuit.id)}
                      variant="secondary"
                      style={styles.actionButton}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {/* Hardware Tab */}
      {currentTab === 'hardware' && (
        <View style={styles.tabContent}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quantum Hardware</Text>
              <Button
                title="Refresh Status"
                onPress={getHardware}
                variant="secondary"
                style={styles.createButton}
              />
            </View>

            <TextInput
              style={styles.filterInput}
              placeholder="Search hardware..."
              value={hardwareFilter}
              onChangeText={setHardwareFilter}
            />

            {filteredHardware.map((hw) => (
              <TouchableOpacity
                key={hw.id}
                style={styles.hardwareCard}
                onPress={() => {
                  selectHardware(hw);
                  onHardwarePress?.(hw);
                }}
              >
                <View style={styles.hardwareHeader}>
                  <Text style={styles.hardwareName}>{hw.name}</Text>
                  <Badge 
                    text={hw.status} 
                    variant="secondary"
                    style={{ backgroundColor: getHardwareStatusColor(hw.status) }}
                  />
                </View>
                <Text style={styles.hardwareType}>{hw.type.replace('_', ' ').toUpperCase()}</Text>
                <View style={styles.hardwareMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Qubits:</Text>
                    <Text style={styles.metricValue}>{hw.qubits}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Gate Fidelity:</Text>
                    <Text style={styles.metricValue}>{(hw.gate_fidelity * 100).toFixed(2)}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Coherence:</Text>
                    <Text style={styles.metricValue}>{hw.coherence_time}ms</Text>
                  </View>
                </View>
                {hw.queue_position !== undefined && (
                  <View style={styles.queueInfo}>
                    <Text style={styles.queueText}>Queue Position: {hw.queue_position}</Text>
                    <Text style={styles.queueText}>Est. Wait: {hw.estimated_wait}s</Text>
                  </View>
                )}
                <View style={styles.hardwareActions}>
                  <Button
                    title="Select"
                    onPress={() => selectHardware(hw)}
                    variant={selectedHardware?.id === hw.id ? 'primary' : 'secondary'}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Details"
                    onPress={() => setShowHardwareDetails(true)}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {/* Jobs Tab */}
      {currentTab === 'jobs' && (
        <View style={styles.tabContent}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quantum Jobs</Text>
              <Button
                title="Generate Report"
                onPress={() => generateReport('performance')}
                variant="secondary"
                style={styles.createButton}
              />
            </View>

            {jobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => onJobPress?.(job)}
              >
                <View style={styles.jobHeader}>
                  <Text style={styles.jobId}>Job {job.id}</Text>
                  <Badge 
                    text={job.status} 
                    variant="secondary"
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobAlgorithm}>Algorithm: {job.algorithm_id}</Text>
                  <Text style={styles.jobHardware}>Hardware: {job.hardware_id}</Text>
                  <Text style={styles.jobPriority}>Priority: {job.priority}</Text>
                </View>
                <View style={styles.jobActions}>
                  {job.status === 'queued' && (
                    <Button
                      title="Cancel"
                      onPress={() => cancelJob(job.id)}
                      variant="danger"
                      style={styles.actionButton}
                    />
                  )}
                  {job.status === 'failed' && (
                    <Button
                      title="Retry"
                      onPress={() => retryJob(job.id)}
                      variant="primary"
                      style={styles.actionButton}
                    />
                  )}
                  {job.status === 'completed' && (
                    <Button
                      title="View Results"
                      onPress={() => getJobResults(job.id)}
                      variant="primary"
                      style={styles.actionButton}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {/* ML Models Tab */}
      {currentTab === 'ml_models' && (
        <View style={styles.tabContent}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quantum ML Models</Text>
              <Button
                title="Train Model"
                onPress={() => setShowCreateAlgorithm(true)}
                variant="primary"
                style={styles.createButton}
              />
            </View>

            {ml_models.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={styles.modelCard}
                onPress={() => onModelPress?.(model)}
              >
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{model.name}</Text>
                  <Badge text={model.type.toUpperCase()} variant="primary" />
                </View>
                <Text style={styles.modelArchitecture}>{model.architecture}</Text>
                <View style={styles.modelMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Accuracy:</Text>
                    <Text style={styles.metricValue}>{(model.accuracy * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Parameters:</Text>
                    <Text style={styles.metricValue}>{model.parameters}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Dataset:</Text>
                    <Text style={styles.metricValue}>{model.dataset_size}</Text>
                  </View>
                </View>
                <View style={styles.modelActions}>
                  <Button
                    title="Evaluate"
                    onPress={() => evaluateModel(model.id)}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Predict"
                    onPress={() => {/* TODO: Implement predict */}}
                    variant="primary"
                    style={styles.actionButton}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {/* Metrics Tab */}
      {currentTab === 'metrics' && (
        <View style={styles.tabContent}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quantum Metrics</Text>
              <Button
                title="Refresh"
                onPress={() => getMetrics()}
                variant="secondary"
                style={styles.createButton}
              />
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Average Fidelity</Text>
                <Text style={styles.metricBigValue}>
                  {algorithms.length > 0 
                    ? (algorithms.reduce((sum, algo) => sum + algo.fidelity, 0) / algorithms.length * 100).toFixed(1)
                    : '0'
                  }%
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Success Rate</Text>
                <Text style={styles.metricBigValue}>
                  {jobs.length > 0 
                    ? (jobs.filter(job => job.status === 'completed').length / jobs.length * 100).toFixed(1)
                    : '0'
                  }%
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Qubits</Text>
                <Text style={styles.metricBigValue}>
                  {hardware.reduce((sum, hw) => sum + hw.qubits, 0)}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Active Jobs</Text>
                <Text style={styles.metricBigValue}>
                  {jobs.filter(job => job.status === 'running').length}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Create Algorithm Modal */}
      {showCreateAlgorithm && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Quantum Algorithm</Text>
            <TextInput
              style={styles.input}
              placeholder="Algorithm Name"
              value={newAlgorithm.name}
              onChangeText={(text) => setNewAlgorithm(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newAlgorithm.description}
              onChangeText={(text) => setNewAlgorithm(prev => ({ ...prev, description: text }))}
              multiline
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Qubits"
                value={newAlgorithm.qubits.toString()}
                onChangeText={(text) => setNewAlgorithm(prev => ({ ...prev, qubits: parseInt(text) || 10 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Depth"
                value={newAlgorithm.depth.toString()}
                onChangeText={(text) => setNewAlgorithm(prev => ({ ...prev, depth: parseInt(text) || 50 }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowCreateAlgorithm(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleCreateAlgorithm}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      )}

      {/* Create Circuit Modal */}
      {showCreateCircuit && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Quantum Circuit</Text>
            <TextInput
              style={styles.input}
              placeholder="Circuit Name"
              value={newCircuit.name}
              onChangeText={(text) => setNewCircuit(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Algorithm ID"
              value={newCircuit.algorithm_id}
              onChangeText={(text) => setNewCircuit(prev => ({ ...prev, algorithm_id: text }))}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Qubits"
                value={newCircuit.qubits.toString()}
                onChangeText={(text) => setNewCircuit(prev => ({ ...prev, qubits: parseInt(text) || 4 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Depth"
                value={newCircuit.depth.toString()}
                onChangeText={(text) => setNewCircuit(prev => ({ ...prev, depth: parseInt(text) || 10 }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowCreateCircuit(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleCreateCircuit}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  headerCard: {
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3498DB',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  refreshButton: {
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3498DB',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  createButton: {
    // Additional styling handled by Button component
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  activeFilterChip: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterChipText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  algorithmCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  algorithmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  algorithmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  algorithmBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  algorithmDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  algorithmMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  algorithmStatus: {
    marginBottom: 12,
  },
  algorithmProgress: {
    marginTop: 8,
  },
  algorithmActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  circuitCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  circuitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  circuitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  circuitMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  circuitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  hardwareCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  hardwareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hardwareName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  hardwareType: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  hardwareMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  queueInfo: {
    marginBottom: 12,
  },
  queueText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  hardwareActions: {
    flexDirection: 'row',
    gap: 8,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  jobInfo: {
    marginBottom: 12,
  },
  jobAlgorithm: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  jobHardware: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  jobPriority: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modelCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modelArchitecture: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  modelMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  metricTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
    textAlign: 'center',
  },
  metricBigValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3498DB',
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
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});
