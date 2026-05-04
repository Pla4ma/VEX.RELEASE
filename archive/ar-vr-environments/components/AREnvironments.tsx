/**
 * AR/VR Environments Component
 * 
 * Main UI component for AR/VR environments with immersive experiences,
 * virtual workspaces, 3D visualizations, and mixed reality productivity.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useAREnvironments } from '../hooks/useAREnvironments';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

interface AREnvironmentsProps {
  userId: string;
  onWorkspacePress?: (workspace: any) => void;
  onExperiencePress?: (experience: any) => void;
  onCollaborationPress?: (space: any) => void;
}

export function AREnvironments({ 
  userId, 
  onWorkspacePress, 
  onExperiencePress, 
  onCollaborationPress 
}: AREnvironmentsProps) {
  const {
    profile,
    virtualWorkspaces,
    immersiveExperiences,
    mixedRealityEnvironments,
    arVisualizations,
    vrProductivitySpaces,
    interfaces3D,
    spatialComputing,
    hapticFeedback,
    gestureControl,
    voiceInterface,
    eyeTracking,
    motionCapture,
    collaborationSpaces,
    presentationModes,
    trainingEnvironments,
    simulationSpaces,
    sessions,
    virtualObjects,
    spatialAnchors,
    metrics,
    performanceOptimization,
    deviceCompatibility,
    calibrationData,
    trackingState,
    renderingQuality,
    audioSpatialization,
    analytics,
    userPresence,
    interactionHistory,
    arSettings,
    vrSettings,
    loading,
    error,
    initialized,
    isReady,
    hasProfile,
    hasWorkspaces,
    hasExperiences,
    hasDevices,
    canCreateWorkspace,
    canStartExperience,
    isCreatingWorkspace,
    totalWorkspaces,
    totalExperiences,
    activeCollaborationSpaces,
    overallPerformance,
    trackingAccuracy,
    renderingFPS,
    initialize,
    createWorkspace,
    startImmersiveExperience,
    enableMixedReality,
    createARVisualization,
    setupVRProductivitySpace,
    create3DInterface,
    enableSpatialComputing,
    configureHaptics,
    enableGestureControl,
    setupVoiceInterface,
    enableEyeTracking,
    enableMotionCapture,
    createCollaborationSpace,
    setupPresentationMode,
    createTrainingEnvironment,
    createSimulationSpace,
    addVirtualObject,
    createSpatialAnchor,
    updateMetrics,
    optimizePerformance,
    calibrateDevice,
    updateSettings,
    clearError,
    retry,
  } = useAREnvironments(userId);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'workspaces' | 'experiences' | 'collaboration' | 'devices'>('overview');
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableAR: true,
        enableVR: true,
        enableMixedReality: true,
        enableSpatialComputing: true,
        supportedDevices: ['hololens', 'magic-leap', 'oculus-quest', 'htc-vive'],
        trackingAccuracy: 'high',
        renderingQuality: 'ultra',
        hapticFeedback: true,
        gestureControl: true,
        voiceInterface: true,
        eyeTracking: true,
        motionCapture: true,
        spatialAudio: true,
        collaborationEnabled: true,
        presentationMode: true,
        trainingMode: true,
        simulationMode: true,
      });
    }
  }, [initialized]);

  // Handle workspace creation
  const handleCreateWorkspace = async (workspaceType: string) => {
    const workspace = await createWorkspace(workspaceType, {
      name: `New ${workspaceType} Workspace`,
      description: 'Virtual workspace for productivity',
      size: 'medium',
      environment: 'office',
      collaboration: true,
      tools: ['whiteboard', '3d-models', 'documents'],
    });
    if (workspace) {
      Alert.alert('Success', 'Workspace created successfully!');
      setSelectedTab('workspaces');
    } else {
      Alert.alert('Error', 'Failed to create workspace');
    }
  };

  const handleStartExperience = async (experienceType: string) => {
    const experience = await startImmersiveExperience(experienceType, {
      name: `New ${experienceType} Experience`,
      description: 'Immersive AR/VR experience',
      duration: '30min',
      intensity: 'medium',
      interaction: 'full',
    });
    if (experience) {
      Alert.alert('Success', 'Experience started successfully!');
      setSelectedTab('experiences');
    } else {
      Alert.alert('Error', 'Failed to start experience');
    }
  };

  const handleEnableDevice = async (deviceType: string) => {
    let success = false;
    
    switch (deviceType) {
      case 'spatial-computing':
        const computing = await enableSpatialComputing('room-scale');
        success = !!computing;
        break;
      case 'haptics':
        const haptics = await configureHaptics('full-body', { intensity: 0.7 });
        success = !!haptics;
        break;
      case 'gesture':
        const gesture = await enableGestureControl('hand-tracking');
        success = !!gesture;
        break;
      case 'voice':
        const voice = await setupVoiceInterface('natural-language');
        success = !!voice;
        break;
      case 'eye-tracking':
        const eye = await enableEyeTracking('binocular');
        success = !!eye;
        break;
      case 'motion-capture':
        const motion = await enableMotionCapture('full-body');
        success = !!motion;
        break;
    }
    
    if (success) {
      Alert.alert('Success', `${deviceType} enabled successfully!`);
    } else {
      Alert.alert('Error', `Failed to enable ${deviceType}`);
    }
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading message="Loading AR/VR Environments..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="AR/VR Environments Error"
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
        title="Welcome to AR/VR Environments"
        message="Experience immersive productivity with augmented and virtual reality."
        icon="🥽"
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
        <Text style={styles.title}>AR/VR Environments</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalWorkspaces}</Text>
            <Text style={styles.statLabel}>Workspaces</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalExperiences}</Text>
            <Text style={styles.statLabel}>Experiences</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{activeCollaborationSpaces}</Text>
            <Text style={styles.statLabel}>Collaboration</Text>
          </View>
        </View>
      </View>

      {/* Performance Overview */}
      <View style={styles.performanceContainer}>
        <View style={styles.performanceHeader}>
          <Text style={styles.performanceTitle}>System Performance</Text>
          <Badge text={overallPerformance > 80 ? 'Excellent' : overallPerformance > 60 ? 'Good' : 'Needs Optimization'} color={overallPerformance > 80 ? '#27AE60' : overallPerformance > 60 ? '#F39C12' : '#E74C3C'} size="small" />
        </View>
        <ProgressBar progress={overallPerformance} color="#9B59B6" />
        <Text style={styles.performanceDescription}>
          Overall Performance: {Math.round(overallPerformance)}%
        </Text>
      </View>

      {/* Tracking and Rendering */}
      <View style={styles.trackingContainer}>
        <View style={styles.trackingItems}>
          <View style={styles.trackingItem}>
            <Text style={styles.trackingLabel}>Tracking Accuracy</Text>
            <ProgressBar progress={trackingAccuracy} color="#3498DB" />
            <Text style={styles.trackingValue}>{Math.round(trackingAccuracy)}%</Text>
          </View>
          <View style={styles.trackingItem}>
            <Text style={styles.trackingLabel}>Rendering FPS</Text>
            <ProgressBar progress={(renderingFPS / 120) * 100} color="#27AE60" />
            <Text style={styles.trackingValue}>{renderingFPS} FPS</Text>
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
          style={[styles.tab, selectedTab === 'workspaces' && styles.activeTab]}
          onPress={() => setSelectedTab('workspaces')}
        >
          <Text style={[styles.tabText, selectedTab === 'workspaces' && styles.activeTabText]}>
            Workspaces ({totalWorkspaces})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'experiences' && styles.activeTab]}
          onPress={() => setSelectedTab('experiences')}
        >
          <Text style={[styles.tabText, selectedTab === 'experiences' && styles.activeTabText]}>
            Experiences ({totalExperiences})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'collaboration' && styles.activeTab]}
          onPress={() => setSelectedTab('collaboration')}
        >
          <Text style={[styles.tabText, selectedTab === 'collaboration' && styles.activeTabText]}>
            Collaboration ({activeCollaborationSpaces})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'devices' && styles.activeTab]}
          onPress={() => setSelectedTab('devices')}
        >
          <Text style={[styles.tabText, selectedTab === 'devices' && styles.activeTabText]}>
            Devices
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <OverviewTab
            spatialComputing={spatialComputing}
            hapticFeedback={hapticFeedback}
            gestureControl={gestureControl}
            voiceInterface={voiceInterface}
            eyeTracking={eyeTracking}
            motionCapture={motionCapture}
            metrics={metrics}
            deviceCompatibility={deviceCompatibility}
            onCreateWorkspace={() => setShowWorkspaceModal(true)}
            onStartExperience={() => setShowExperienceModal(true)}
            onConfigureDevices={() => setShowDeviceModal(true)}
          />
        )}

        {selectedTab === 'workspaces' && (
          <WorkspacesTab
            virtualWorkspaces={virtualWorkspaces}
            vrProductivitySpaces={vrProductivitySpaces}
            onWorkspacePress={onWorkspacePress}
            canCreateWorkspace={canCreateWorkspace}
            isCreatingWorkspace={isCreatingWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
          />
        )}

        {selectedTab === 'experiences' && (
          <ExperiencesTab
            immersiveExperiences={immersiveExperiences}
            mixedRealityEnvironments={mixedRealityEnvironments}
            arVisualizations={arVisualizations}
            onExperiencePress={onExperiencePress}
            canStartExperience={canStartExperience}
            onStartExperience={handleStartExperience}
          />
        )}

        {selectedTab === 'collaboration' && (
          <CollaborationTab
            collaborationSpaces={collaborationSpaces}
            presentationModes={presentationModes}
            onCollaborationPress={onCollaborationPress}
            onCreateCollaborationSpace={createCollaborationSpace}
            onSetupPresentationMode={setupPresentationMode}
          />
        )}

        {selectedTab === 'devices' && (
          <DevicesTab
            deviceCompatibility={deviceCompatibility}
            trackingState={trackingState}
            renderingQuality={renderingQuality}
            audioSpatialization={audioSpatialization}
            calibrationData={calibrationData}
            onEnableDevice={handleEnableDevice}
            onCalibrateDevice={calibrateDevice}
            onOptimizePerformance={optimizePerformance}
          />
        )}
      </ScrollView>

      {/* Workspace Creation Modal */}
      <Modal
        visible={showWorkspaceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWorkspaceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Workspace</Text>
            <Text style={styles.modalDescription}>
              Choose the type of virtual workspace to create.
            </Text>
            
            <Button
              title="Office Workspace"
              onPress={() => handleCreateWorkspace('office')}
              style={styles.modalButton}
            />

            <Button
              title="Creative Studio"
              onPress={() => handleCreateWorkspace('creative')}
              style={styles.modalButton}
            />

            <Button
              title="Training Room"
              onPress={() => handleCreateWorkspace('training')}
              style={styles.modalButton}
            />

            <Button
              title="Meeting Space"
              onPress={() => handleCreateWorkspace('meeting')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowWorkspaceModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Experience Modal */}
      <Modal
        visible={showExperienceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExperienceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Experience</Text>
            <Text style={styles.modalDescription}>
              Choose an immersive AR/VR experience.
            </Text>
            
            <Button
              title="Productivity Focus"
              onPress={() => handleStartExperience('productivity')}
              style={styles.modalButton}
            />

            <Button
              title="Creative Visualization"
              onPress={() => handleStartExperience('creative')}
              style={styles.modalButton}
            />

            <Button
              title="Training Simulation"
              onPress={() => handleStartExperience('training')}
              style={styles.modalButton}
            />

            <Button
              title="Collaboration Space"
              onPress={() => handleStartExperience('collaboration')}
              style={styles.modalButton}
            />

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowExperienceModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Device Configuration Modal */}
      <Modal
        visible={showDeviceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeviceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Devices</Text>
            <Text style={styles.modalDescription}>
              Enable and configure AR/VR devices and features.
            </Text>
            
            <Button
              title="Enable Spatial Computing"
              onPress={() => handleEnableDevice('spatial-computing')}
              style={styles.modalButton}
            />

            <Button
              title="Configure Haptics"
              onPress={() => handleEnableDevice('haptics')}
              style={styles.modalButton}
            />

            <Button
              title="Enable Gesture Control"
              onPress={() => handleEnableDevice('gesture')}
              style={styles.modalButton}
            />

            <Button
              title="Setup Voice Interface"
              onPress={() => handleEnableDevice('voice')}
              style={styles.modalButton}
            />

            <Button
              title="Enable Eye Tracking"
              onPress={() => handleEnableDevice('eye-tracking')}
              style={styles.modalButton}
            />

            <Button
              title="Enable Motion Capture"
              onPress={() => handleEnableDevice('motion-capture')}
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
    </View>
  );
}

// Overview Tab Component
function OverviewTab({ 
  spatialComputing, 
  hapticFeedback, 
  gestureControl, 
  voiceInterface, 
  eyeTracking, 
  motionCapture, 
  metrics, 
  deviceCompatibility, 
  onCreateWorkspace, 
  onStartExperience, 
  onConfigureDevices 
}: any) {
  return (
    <View style={styles.tabContent}>
      {/* Device Status */}
      {deviceCompatibility && (
        <Card style={styles.deviceCard}>
          <Text style={styles.deviceTitle}>Device Compatibility</Text>
          <View style={styles.deviceStatus}>
            <Text style={styles.deviceStatusText}>
              {deviceCompatibility.supportedDevices.length} devices supported
            </Text>
            <Text style={styles.deviceStatusText}>
              Current device: {deviceCompatibility.currentDevice || 'None detected'}
            </Text>
          </View>
        </Card>
      )}

      {/* Active Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Active Features</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌐</Text>
            <Text style={styles.featureName}>Spatial Computing</Text>
            <Text style={styles.featureStatus}>{spatialComputing ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✋</Text>
            <Text style={styles.featureName}>Gesture Control</Text>
            <Text style={styles.featureStatus}>{gestureControl ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎤</Text>
            <Text style={styles.featureName}>Voice Interface</Text>
            <Text style={styles.featureStatus}>{voiceInterface ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👁️</Text>
            <Text style={styles.featureName}>Eye Tracking</Text>
            <Text style={styles.featureStatus}>{eyeTracking ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
      </View>

      {/* System Metrics */}
      {metrics && (
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>System Metrics</Text>
          <View style={styles.metricsItems}>
            <Text style={styles.metricsItem}>
              CPU Usage: {Math.round(metrics.cpuUsage)}%
            </Text>
            <Text style={styles.metricsItem}>
              Memory Usage: {Math.round(metrics.memoryUsage)}%
            </Text>
            <Text style={styles.metricsItem}>
              GPU Usage: {Math.round(metrics.gpuUsage)}%
            </Text>
            <Text style={styles.metricsItem}>
              Battery Level: {Math.round(metrics.batteryLevel)}%
            </Text>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={onCreateWorkspace}>
            <Text style={styles.quickActionIcon}>🏢</Text>
            <Text style={styles.quickActionText}>Create Workspace</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={onStartExperience}>
            <Text style={styles.quickActionIcon}>🥽</Text>
            <Text style={styles.quickActionText}>Start Experience</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={onConfigureDevices}>
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Configure Devices</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Workspaces Tab Component
function WorkspacesTab({ 
  virtualWorkspaces, 
  vrProductivitySpaces, 
  onWorkspacePress, 
  canCreateWorkspace, 
  isCreatingWorkspace, 
  onCreateWorkspace 
}: any) {
  const allWorkspaces = [...virtualWorkspaces, ...vrProductivitySpaces];

  return (
    <View style={styles.tabContent}>
      <View style={styles.workspacesHeader}>
        <Text style={styles.workspacesTitle}>Virtual Workspaces</Text>
        <TouchableOpacity 
          style={[styles.createButton, !canCreateWorkspace && styles.disabledButton]}
          onPress={() => onCreateWorkspace('office')}
          disabled={!canCreateWorkspace || isCreatingWorkspace}
        >
          <Text style={styles.createButtonText}>
            {isCreatingWorkspace ? 'Creating...' : '+ Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {allWorkspaces.length === 0 ? (
        <EmptyState
          title="No Workspaces"
          message="Create your first virtual workspace to start immersive productivity"
          icon="🏢"
        />
      ) : (
        allWorkspaces.map((workspace: any) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            onPress={() => onWorkspacePress?.(workspace)}
          />
        ))
      )}
    </View>
  );
}

// Workspace Card Component
function WorkspaceCard({ workspace, onPress }: any) {
  return (
    <Card style={styles.workspaceCard}>
      <View style={styles.workspaceHeader}>
        <Text style={styles.workspaceName}>{workspace.name}</Text>
        <Badge 
          text={workspace.type} 
          color="#9B59B6" 
          size="small" 
        />
      </View>
      
      <Text style={styles.workspaceDescription}>{workspace.description}</Text>
      
      <View style={styles.workspaceMetrics}>
        <Text style={styles.workspaceMetric}>
          Size: {workspace.size}
        </Text>
        <Text style={styles.workspaceMetric}>
          Environment: {workspace.environment}
        </Text>
        <Text style={styles.workspaceMetric}>
          Collaboration: {workspace.collaboration ? 'Enabled' : 'Disabled'}
        </Text>
      </View>

      <View style={styles.workspaceFooter}>
        <TouchableOpacity style={styles.workspaceDetailsButton} onPress={onPress}>
          <Text style={styles.workspaceDetailsText}>Enter Workspace</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Experiences Tab Component
function ExperiencesTab({ 
  immersiveExperiences, 
  mixedRealityEnvironments, 
  arVisualizations, 
  onExperiencePress, 
  canStartExperience, 
  onStartExperience 
}: any) {
  const allExperiences = [...immersiveExperiences, ...mixedRealityEnvironments, ...arVisualizations];

  return (
    <View style={styles.tabContent}>
      <View style={styles.experiencesHeader}>
        <Text style={styles.experiencesTitle}>Immersive Experiences</Text>
        <TouchableOpacity 
          style={[styles.createButton, !canStartExperience && styles.disabledButton]}
          onPress={() => onStartExperience('productivity')}
          disabled={!canStartExperience}
        >
          <Text style={styles.createButtonText}>+ Start</Text>
        </TouchableOpacity>
      </View>

      {allExperiences.length === 0 ? (
        <EmptyState
          title="No Experiences"
          message="Start your first immersive AR/VR experience"
          icon="🥽"
        />
      ) : (
        allExperiences.map((experience: any) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            onPress={() => onExperiencePress?.(experience)}
          />
        ))
      )}
    </View>
  );
}

// Experience Card Component
function ExperienceCard({ experience, onPress }: any) {
  return (
    <Card style={styles.experienceCard}>
      <View style={styles.experienceHeader}>
        <Text style={styles.experienceName}>{experience.name}</Text>
        <Badge 
          text={experience.type} 
          color="#3498DB" 
          size="small" 
        />
      </View>
      
      <Text style={styles.experienceDescription}>{experience.description}</Text>
      
      <View style={styles.experienceMetrics}>
        <Text style={styles.experienceMetric}>
          Duration: {experience.duration}
        </Text>
        <Text style={styles.experienceMetric}>
          Intensity: {experience.intensity}
        </Text>
        <Text style={styles.experienceMetric}>
          Interaction: {experience.interaction}
        </Text>
      </View>

      <View style={styles.experienceFooter}>
        <TouchableOpacity style={styles.experienceDetailsButton} onPress={onPress}>
          <Text style={styles.experienceDetailsText}>Start Experience</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Collaboration Tab Component
function CollaborationTab({ 
  collaborationSpaces, 
  presentationModes, 
  onCollaborationPress, 
  onCreateCollaborationSpace, 
  onSetupPresentationMode 
}: any) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.collaborationHeader}>
        <Text style={styles.collaborationTitle}>Collaboration Spaces</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => onCreateCollaborationSpace('meeting', { name: 'New Meeting Space' })}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {collaborationSpaces.length === 0 ? (
        <EmptyState
          title="No Collaboration Spaces"
          message="Create your first collaboration space for immersive teamwork"
          icon="👥"
        />
      ) : (
        collaborationSpaces.map((space: any) => (
          <CollaborationCard
            key={space.id}
            space={space}
            onPress={() => onCollaborationPress?.(space)}
          />
        ))
      )}
    </View>
  );
}

// Collaboration Card Component
function CollaborationCard({ space, onPress }: any) {
  return (
    <Card style={styles.collaborationCard}>
      <View style={styles.collaborationHeader}>
        <Text style={styles.collaborationName}>{space.name}</Text>
        <Badge 
          text={space.active ? 'Active' : 'Inactive'} 
          color={space.active ? '#27AE60' : '#95A5A6'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.collaborationDescription}>{space.description}</Text>
      
      <View style={styles.collaborationMetrics}>
        <Text style={styles.collaborationMetric}>
          Participants: {space.participants?.length || 0}
        </Text>
        <Text style={styles.collaborationMetric}>
          Type: {space.type}
        </Text>
        <Text style={styles.collaborationMetric}>
          Capacity: {space.capacity}
        </Text>
      </View>

      <View style={styles.collaborationFooter}>
        <TouchableOpacity style={styles.collaborationDetailsButton} onPress={onPress}>
          <Text style={styles.collaborationDetailsText}>Join Space</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Devices Tab Component
function DevicesTab({ 
  deviceCompatibility, 
  trackingState, 
  renderingQuality, 
  audioSpatialization, 
  calibrationData, 
  onEnableDevice, 
  onCalibrateDevice, 
  onOptimizePerformance 
}: any) {
  return (
    <View style={styles.tabContent}>
      {/* Device Compatibility */}
      {deviceCompatibility && (
        <Card style={styles.deviceInfoCard}>
          <Text style={styles.deviceInfoTitle}>Device Information</Text>
          <View style={styles.deviceInfoItems}>
            <Text style={styles.deviceInfoItem}>
              Current Device: {deviceCompatibility.currentDevice || 'None detected'}
            </Text>
            <Text style={styles.deviceInfoItem}>
              Supported Devices: {deviceCompatibility.supportedDevices.join(', ')}
            </Text>
            <Text style={styles.deviceInfoItem}>
              Compatibility: {deviceCompatibility.compatibility}
            </Text>
          </View>
        </Card>
      )}

      {/* Tracking State */}
      {trackingState && (
        <Card style={styles.trackingInfoCard}>
          <Text style={styles.trackingInfoTitle}>Tracking Status</Text>
          <View style={styles.trackingInfoItems}>
            <Text style={styles.trackingInfoItem}>
              Status: {trackingState.status}
            </Text>
            <Text style={styles.trackingInfoItem}>
              Accuracy: {Math.round(trackingState.accuracy * 100)}%
            </Text>
            <Text style={styles.trackingInfoItem}>
              Latency: {trackingState.latency}ms
            </Text>
          </View>
        </Card>
      )}

      {/* Rendering Quality */}
      {renderingQuality && (
        <Card style={styles.renderingInfoCard}>
          <Text style={styles.renderingInfoTitle}>Rendering Performance</Text>
          <View style={styles.renderingInfoItems}>
            <Text style={styles.renderingInfoItem}>
              FPS: {renderingQuality.fps}
            </Text>
            <Text style={styles.renderingInfoItem}>
              Resolution: {renderingQuality.resolution}
            </Text>
            <Text style={styles.renderingInfoItem}>
              Quality: {renderingQuality.quality}
            </Text>
          </View>
        </Card>
      )}

      {/* Device Actions */}
      <View style={styles.deviceActionsContainer}>
        <Text style={styles.deviceActionsTitle}>Device Actions</Text>
        <View style={styles.deviceActionsGrid}>
          <TouchableOpacity style={styles.deviceActionButton} onPress={() => onEnableDevice('spatial-computing')}>
            <Text style={styles.deviceActionIcon}>🌐</Text>
            <Text style={styles.deviceActionText}>Spatial Computing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deviceActionButton} onPress={() => onEnableDevice('haptics')}>
            <Text style={styles.deviceActionIcon}>✋</Text>
            <Text style={styles.deviceActionText}>Haptics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deviceActionButton} onPress={() => onEnableDevice('gesture')}>
            <Text style={styles.deviceActionIcon}>👋</Text>
            <Text style={styles.deviceActionText}>Gestures</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deviceActionButton} onPress={() => onEnableDevice('voice')}>
            <Text style={styles.deviceActionIcon}>🎤</Text>
            <Text style={styles.deviceActionText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deviceActionButton} onPress={() => onEnableDevice('eye-tracking')}>
            <Text style={styles.deviceActionIcon}>👁️</Text>
            <Text style={styles.deviceActionText}>Eye Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deviceActionButton} onPress={() => onEnableDevice('motion-capture')}>
            <Text style={styles.deviceActionIcon}>🏃</Text>
            <Text style={styles.deviceActionText}>Motion Capture</Text>
          </TouchableOpacity>
        </View>
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
  trackingContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  trackingItems: {
    gap: 16,
  },
  trackingItem: {
    gap: 8,
  },
  trackingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  trackingValue: {
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
  deviceCard: {
    padding: 20,
    marginBottom: 16,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  deviceStatus: {
    gap: 8,
  },
  deviceStatusText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureStatus: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  metricsCard: {
    padding: 20,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  metricsItems: {
    gap: 8,
  },
  metricsItem: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  quickActionsContainer: {
    marginTop: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
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
  workspacesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workspacesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  workspaceCard: {
    padding: 16,
    marginBottom: 16,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  workspaceDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  workspaceMetrics: {
    gap: 4,
    marginBottom: 12,
  },
  workspaceMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  workspaceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workspaceDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 4,
  },
  workspaceDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  experiencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  experiencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  experienceCard: {
    padding: 16,
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  experienceDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  experienceMetrics: {
    gap: 4,
    marginBottom: 12,
  },
  experienceMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  experienceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  experienceDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  experienceDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collaborationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  collaborationCard: {
    padding: 16,
    marginBottom: 16,
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collaborationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  collaborationDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  collaborationMetrics: {
    gap: 4,
    marginBottom: 12,
  },
  collaborationMetric: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  collaborationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collaborationDetailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  collaborationDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceInfoCard: {
    padding: 20,
    marginBottom: 16,
  },
  deviceInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  deviceInfoItems: {
    gap: 8,
  },
  deviceInfoItem: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  trackingInfoCard: {
    padding: 20,
    marginBottom: 16,
  },
  trackingInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  trackingInfoItems: {
    gap: 8,
  },
  trackingInfoItem: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  renderingInfoCard: {
    padding: 20,
    marginBottom: 16,
  },
  renderingInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  renderingInfoItems: {
    gap: 8,
  },
  renderingInfoItem: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  deviceActionsContainer: {
    marginTop: 16,
  },
  deviceActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  deviceActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceActionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  deviceActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
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
