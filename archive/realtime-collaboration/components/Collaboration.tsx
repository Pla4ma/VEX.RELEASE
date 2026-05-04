/**
 * Collaboration Component
 * 
 * Main UI component for realtime collaboration with live video/audio,
 * shared workspaces, AI facilitation, and immersive environments.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useCollaboration } from '../hooks/useCollaboration';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Loading } from '../../../components/states/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationProps {
  userId: string;
  onSessionPress?: (session: any) => void;
  onWorkspacePress?: (workspace: any) => void;
  onParticipantPress?: (participant: any) => void;
}

export function Collaboration({ 
  userId, 
  onSessionPress, 
  onWorkspacePress, 
  onParticipantPress 
}: CollaborationProps) {
  const {
    sessions,
    currentSession,
    workspaces,
    participants,
    videoSessions,
    audioSessions,
    sharedDocuments,
    analytics,
    immersiveEnvironments,
    loading,
    error,
    initialized,
    isReady,
    hasSessions,
    hasCurrentSession,
    hasWorkspaces,
    hasParticipants,
    activeSessions,
    myWorkspaces,
    availableWorkspaces,
    onlineParticipants,
    canStartSession,
    canJoinSession,
    isInImmersiveEnvironment,
    startSession,
    endSession,
    joinSession,
    leaveSession,
    createWorkspace,
    joinWorkspace,
    leaveWorkspace,
    startVideoCall,
    endVideoCall,
    startAudioCall,
    endAudioCall,
    shareDocument,
    updateDocument,
    inviteParticipant,
    getCollaboration,
    enableAIFacilitator,
    disableAIFacilitator,
    enterImmersiveEnvironment,
    exitImmersiveEnvironment,
    refreshSessions,
    clearError,
    retry,
  } = useCollaboration(userId);

  const [selectedTab, setSelectedTab] = useState<'sessions' | 'workspaces' | 'participants' | 'immersive'>('sessions');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Initialize on mount
  React.useEffect(() => {
    if (!initialized) {
      initialize({
        enableVideo: true,
        enableAudio: true,
        enableAIFacilitator: true,
        enableImmersiveEnvironments: true,
        maxParticipants: 50,
        videoQuality: 'hd',
        audioQuality: 'high',
      });
    }
  }, [initialized]);

  const initialize = async (config: any) => {
    console.log('Initializing collaboration with config:', config);
  };

  // Handle session actions
  const handleStartSession = async (type: string = 'COLLABORATION') => {
    const session = await startSession({
      type,
      title: `${type} Session`,
      description: `Real-time ${type.toLowerCase()} session`,
      maxParticipants: 10,
      isPublic: false,
      enableVideo: true,
      enableAudio: true,
      enableAIFacilitator: true,
    });

    if (session) {
      Alert.alert('Success', 'Collaboration session started!');
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

  const handleJoinSession = async (sessionId: string) => {
    const success = await joinSession(sessionId, userId);
    if (success) {
      Alert.alert('Success', 'Joined session successfully!');
    } else {
      Alert.alert('Error', 'Failed to join session');
    }
  };

  // Handle workspace actions
  const handleCreateWorkspace = async (name: string, description: string) => {
    const workspace = await createWorkspace({
      name,
      description,
      ownerId: userId,
      isPublic: false,
      maxMembers: 20,
    });

    if (workspace) {
      Alert.alert('Success', 'Workspace created successfully!');
      setSelectedTab('workspaces');
      setShowWorkspaceModal(false);
    } else {
      Alert.alert('Error', 'Failed to create workspace');
    }
  };

  // Handle video/audio calls
  const handleStartVideoCall = async (participantIds: string[]) => {
    const session = await startVideoCall(participantIds);
    if (session) {
      Alert.alert('Success', 'Video call started!');
    } else {
      Alert.alert('Error', 'Failed to start video call');
    }
  };

  const handleStartAudioCall = async (participantIds: string[]) => {
    const session = await startAudioCall(participantIds);
    if (session) {
      Alert.alert('Success', 'Audio call started!');
    } else {
      Alert.alert('Error', 'Failed to start audio call');
    }
  };

  // Handle AI facilitator
  const handleToggleAIFacilitator = async (sessionId: string, enabled: boolean) => {
    const success = enabled ? await enableAIFacilitator(sessionId) : await disableAIFacilitator(sessionId);
    if (success) {
      Alert.alert('Success', `AI facilitator ${enabled ? 'enabled' : 'disabled'}!`);
    } else {
      Alert.alert('Error', `Failed to ${enabled ? 'enable' : 'disable'} AI facilitator`);
    }
  };

  // Handle immersive environment
  const handleEnterImmersiveEnvironment = async (environmentId: string) => {
    const success = await enterImmersiveEnvironment(environmentId);
    if (success) {
      Alert.alert('Success', 'Entered immersive environment!');
    } else {
      Alert.alert('Error', 'Failed to enter immersive environment');
    }
  };

  // Loading state
  if (loading && !initialized) {
    return <Loading message="Loading Collaboration..." />;
  }

  // Error state
  if (error && !isReady) {
    return (
      <ErrorState
        title="Collaboration Error"
        message={error}
        onRetry={retry}
        onDismiss={clearError}
      />
    );
  }

  // Empty state
  if (!hasSessions && !hasWorkspaces && isReady) {
    return (
      <EmptyState
        title="Welcome to Realtime Collaboration"
        message="Start collaborating with your team in real-time with video, audio, and shared workspaces."
        icon="🤝"
        action={{
          title: "Start Collaboration",
          onPress: () => handleStartSession('COLLABORATION'),
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Realtime Collaboration</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{activeSessions.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{onlineParticipants.length}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{workspaces.length}</Text>
            <Text style={styles.statLabel}>Workspaces</Text>
          </View>
        </View>
      </View>

      {/* Current Session Banner */}
      {hasCurrentSession && (
        <Card style={styles.currentSessionBanner}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>Active Session</Text>
            <Badge text="LIVE" color="#27AE60" size="small" />
          </View>
          <Text style={styles.sessionType}>{currentSession?.type}</Text>
          <Text style={styles.sessionDescription}>{currentSession?.description}</Text>
          <Text style={styles.sessionDuration}>
            Started {formatDistanceToNow(new Date(currentSession?.startedAt || Date.now()), { addSuffix: true })}
          </Text>
          <View style={styles.sessionActions}>
            <Button
              title="End Session"
              onPress={() => handleEndSession(currentSession?.id || '')}
              style={styles.sessionButton}
            />
          </View>
        </Card>
      )}

      {/* Immersive Environment Banner */}
      {isInImmersiveEnvironment && (
        <Card style={styles.immersiveBanner}>
          <View style={styles.immersiveHeader}>
            <Text style={styles.immersiveTitle}>Immersive Environment Active</Text>
            <Badge text="VR" color="#9B59B6" size="small" />
          </View>
          <Button
            title="Exit Environment"
            onPress={exitImmersiveEnvironment}
            variant="secondary"
            style={styles.immersiveButton}
          />
        </Card>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'sessions' && styles.activeTab]}
          onPress={() => setSelectedTab('sessions')}
        >
          <Text style={[styles.tabText, selectedTab === 'sessions' && styles.activeTabText]}>
            Sessions ({sessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'workspaces' && styles.activeTab]}
          onPress={() => setSelectedTab('workspaces')}
        >
          <Text style={[styles.tabText, selectedTab === 'workspaces' && styles.activeTabText]}>
            Workspaces ({workspaces.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'participants' && styles.activeTab]}
          onPress={() => setSelectedTab('participants')}
        >
          <Text style={[styles.tabText, selectedTab === 'participants' && styles.activeTabText]}>
            Participants ({participants.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'immersive' && styles.activeTab]}
          onPress={() => setSelectedTab('immersive')}
        >
          <Text style={[styles.tabText, selectedTab === 'immersive' && styles.activeTabText]}>
            Immersive
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'sessions' && (
          <SessionsTab
            sessions={sessions}
            activeSessions={activeSessions}
            currentSession={currentSession}
            onSessionPress={onSessionPress}
            onStartSession={() => setShowSessionModal(true)}
            onEndSession={handleEndSession}
            onJoinSession={handleJoinSession}
            onStartVideoCall={handleStartVideoCall}
            onStartAudioCall={handleStartAudioCall}
            onToggleAIFacilitator={handleToggleAIFacilitator}
          />
        )}

        {selectedTab === 'workspaces' && (
          <WorkspacesTab
            workspaces={workspaces}
            myWorkspaces={myWorkspaces}
            availableWorkspaces={availableWorkspaces}
            onWorkspacePress={onWorkspacePress}
            onCreateWorkspace={() => setShowWorkspaceModal(true)}
            onJoinWorkspace={joinWorkspace}
            onLeaveWorkspace={leaveWorkspace}
          />
        )}

        {selectedTab === 'participants' && (
          <ParticipantsTab
            participants={participants}
            onlineParticipants={onlineParticipants}
            onParticipantPress={onParticipantPress}
            onStartVideoCall={handleStartVideoCall}
            onStartAudioCall={handleStartAudioCall}
          />
        )}

        {selectedTab === 'immersive' && (
          <ImmersiveTab
            immersiveEnvironments={immersiveEnvironments}
            onEnterEnvironment={handleEnterImmersiveEnvironment}
            onExitEnvironment={exitImmersiveEnvironment}
          />
        )}
      </ScrollView>

      {/* Session Type Modal */}
      <Modal
        visible={showSessionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Collaboration Session</Text>
            <Text style={styles.modalDescription}>Choose the type of collaboration session:</Text>
            
            <View style={styles.sessionTypes}>
              <TouchableOpacity 
                style={styles.sessionTypeOption}
                onPress={() => {
                  handleStartSession('COLLABORATION');
                  setShowSessionModal(false);
                }}
              >
                <Text style={styles.sessionTypeIcon}>🤝</Text>
                <Text style={styles.sessionTypeName}>Collaboration</Text>
                <Text style={styles.sessionTypeDesc}>General collaborative workspace</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sessionTypeOption}
                onPress={() => {
                  handleStartSession('BRAINSTORM');
                  setShowSessionModal(false);
                }}
              >
                <Text style={styles.sessionTypeIcon}>💡</Text>
                <Text style={styles.sessionTypeName}>Brainstorm</Text>
                <Text style={styles.sessionTypeDesc}>Creative ideation session</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sessionTypeOption}
                onPress={() => {
                  handleStartSession('MEETING');
                  setShowSessionModal(false);
                }}
              >
                <Text style={styles.sessionTypeIcon}>📅</Text>
                <Text style={styles.sessionTypeName}>Meeting</Text>
                <Text style={styles.sessionTypeDesc}>Structured team meeting</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowSessionModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              Create a new collaborative workspace for your team.
            </Text>
            
            <Button
              title="Create Workspace"
              onPress={() => handleCreateWorkspace('New Workspace', 'A collaborative workspace')}
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
    </View>
  );
}

// Sessions Tab Component
function SessionsTab({ 
  sessions, 
  activeSessions, 
  currentSession, 
  onSessionPress, 
  onStartSession, 
  onEndSession, 
  onJoinSession, 
  onStartVideoCall, 
  onStartAudioCall, 
  onToggleAIFacilitator 
}: any) {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

  const filteredSessions = useMemo(() => {
    switch (filter) {
      case 'active':
        return activeSessions;
      case 'ended':
        return sessions.filter(session => session.status === 'ENDED');
      default:
        return sessions;
    }
  }, [filter, sessions, activeSessions]);

  return (
    <View style={styles.tabContent}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'ended'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({filterType === 'all' ? sessions.length : filterType === 'active' ? activeSessions.length : sessions.filter(s => s.status === 'ENDED').length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          title={`No ${filter} sessions`}
          message={filter === 'all' ? 'Start your first collaboration session' : `No ${filter} sessions available`}
          icon="🤝"
          action={filter === 'all' ? {
            title: "Start Session",
            onPress: onStartSession,
          } : undefined}
        />
      ) : (
        filteredSessions.map((session: any) => (
          <SessionCard
            key={session.id}
            session={session}
            isCurrent={currentSession?.id === session.id}
            onPress={() => onSessionPress?.(session)}
            onEnd={() => onEndSession(session.id)}
            onJoin={() => onJoinSession(session.id)}
            onStartVideo={() => onStartVideoCall([session.participants?.map((p: any) => p.id) || []])}
            onStartAudio={() => onStartAudioCall([session.participants?.map((p: any) => p.id) || []])}
            onToggleAI={() => onToggleAIFacilitator(session.id, !session.aiFacilitator?.enabled)}
          />
        ))
      )}
    </View>
  );
}

// Session Card Component
function SessionCard({ 
  session, 
  isCurrent, 
  onPress, 
  onEnd, 
  onJoin, 
  onStartVideo, 
  onStartAudio, 
  onToggleAI 
}: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#27AE60';
      case 'ENDED': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  return (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Badge text={session.status} color={getStatusColor(session.status)} size="small" />
      </View>
      
      <Text style={styles.sessionDescription}>{session.description}</Text>
      <Text style={styles.sessionDuration}>
        Started {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
      </Text>

      <View style={styles.sessionInfo}>
        <Text style={styles.sessionInfoText}>
          {session.participants?.length || 0} participants
        </Text>
        {session.aiFacilitator?.enabled && (
          <Badge text="AI Assistant" color="#9B59B6" size="small" />
        )}
      </View>

      <View style={styles.sessionFooter}>
        <TouchableOpacity style={styles.sessionDetailsButton} onPress={onPress}>
          <Text style={styles.sessionDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        <View style={styles.sessionActions}>
          {session.status === 'ACTIVE' && (
            <>
              <TouchableOpacity style={styles.sessionActionButton} onPress={onStartVideo}>
                <Text style={styles.sessionActionText}>📹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sessionActionButton} onPress={onStartAudio}>
                <Text style={styles.sessionActionText}>🎤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sessionActionButton} onPress={onToggleAI}>
                <Text style={styles.sessionActionText}>🤖</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sessionActionButton, styles.endButton]} onPress={onEnd}>
                <Text style={styles.sessionActionText}>End</Text>
              </TouchableOpacity>
            </>
          )}
          {session.status === 'ENDED' && isCurrent && (
            <TouchableOpacity style={styles.sessionActionButton} onPress={onJoin}>
              <Text style={styles.sessionActionText}>Rejoin</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

// Workspaces Tab Component
function WorkspacesTab({ 
  workspaces, 
  myWorkspaces, 
  availableWorkspaces, 
  onWorkspacePress, 
  onCreateWorkspace, 
  onJoinWorkspace, 
  onLeaveWorkspace 
}: any) {
  const [filter, setFilter] = useState<'all' | 'mine' | 'available'>('all');

  const filteredWorkspaces = useMemo(() => {
    switch (filter) {
      case 'mine':
        return myWorkspaces;
      case 'available':
        return availableWorkspaces;
      default:
        return workspaces;
    }
  }, [filter, workspaces, myWorkspaces, availableWorkspaces]);

  return (
    <View style={styles.tabContent}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'mine', 'available'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({filterType === 'all' ? workspaces.length : filterType === 'mine' ? myWorkspaces.length : availableWorkspaces.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Workspaces List */}
      {filteredWorkspaces.length === 0 ? (
        <EmptyState
          title={`No ${filter} workspaces`}
          message={filter === 'all' ? 'Create or join workspaces to collaborate' : `No ${filter} workspaces available`}
          icon="🏢"
          action={filter === 'all' ? {
            title: "Create Workspace",
            onPress: onCreateWorkspace,
          } : undefined}
        />
      ) : (
        filteredWorkspaces.map((workspace: any) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            onPress={() => onWorkspacePress?.(workspace)}
            onJoin={() => onJoinWorkspace(workspace.id)}
            onLeave={() => onLeaveWorkspace(workspace.id)}
          />
        ))
      )}
    </View>
  );
}

// Workspace Card Component
function WorkspaceCard({ workspace, onPress, onJoin, onLeave }: any) {
  return (
    <Card style={styles.workspaceCard}>
      <View style={styles.workspaceHeader}>
        <Text style={styles.workspaceTitle}>{workspace.name}</Text>
        <Badge text={workspace.isPublic ? 'Public' : 'Private'} color={workspace.isPublic ? '#3498DB' : '#95A5A6'} size="small" />
      </View>
      
      <Text style={styles.workspaceDescription}>{workspace.description}</Text>
      
      <View style={styles.workspaceInfo}>
        <Text style={styles.workspaceInfoText}>
          {workspace.members?.length || 0} members
        </Text>
        <Text style={styles.workspaceInfoText}>
          Max {workspace.maxMembers} members
        </Text>
      </View>

      <View style={styles.workspaceFooter}>
        <TouchableOpacity style={styles.workspaceDetailsButton} onPress={onPress}>
          <Text style={styles.workspaceDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        <View style={styles.workspaceActions}>
          {workspace.isMember ? (
            <TouchableOpacity style={styles.workspaceActionButton} onPress={onLeave}>
              <Text style={styles.workspaceActionText}>Leave</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.workspaceActionButton} onPress={onJoin}>
              <Text style={styles.workspaceActionText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

// Participants Tab Component
function ParticipantsTab({ 
  participants, 
  onlineParticipants, 
  onParticipantPress, 
  onStartVideoCall, 
  onStartAudioCall 
}: any) {
  const [filter, setFilter] = useState<'all' | 'online'>('all');

  const filteredParticipants = useMemo(() => {
    switch (filter) {
      case 'online':
        return onlineParticipants;
      default:
        return participants;
    }
  }, [filter, participants, onlineParticipants]);

  return (
    <View style={styles.tabContent}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'online'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilter]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({filterType === 'all' ? participants.length : onlineParticipants.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <EmptyState
          title={`No ${filter} participants`}
          message={filter === 'all' ? 'No participants available' : 'No participants online'}
          icon="👥"
        />
      ) : (
        filteredWorkspaces.map((participant: any) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            onPress={() => onParticipantPress?.(participant)}
            onStartVideo={() => onStartVideoCall([participant.id])}
            onStartAudio={() => onStartAudioCall([participant.id])}
          />
        ))
      )}
    </View>
  );
}

// Participant Card Component
function ParticipantCard({ participant, onPress, onStartVideo, onStartAudio }: any) {
  return (
    <Card style={styles.participantCard}>
      <View style={styles.participantHeader}>
        <Text style={styles.participantName}>{participant.name}</Text>
        <Badge 
          text={participant.isOnline ? 'Online' : 'Offline'} 
          color={participant.isOnline ? '#27AE60' : '#95A5A6'} 
          size="small" 
        />
      </View>
      
      <Text style={styles.participantEmail}>{participant.email}</Text>
      
      <View style={styles.participantInfo}>
        <Text style={styles.participantInfoText}>
          Status: {participant.status}
        </Text>
        <Text style={styles.participantInfoText}>
          Last seen: {formatDistanceToNow(new Date(participant.lastSeen), { addSuffix: true })}
        </Text>
      </View>

      <View style={styles.participantActions}>
        <TouchableOpacity style={styles.participantActionButton} onPress={onStartVideo}>
          <Text style={styles.participantActionText}>📹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.participantActionButton} onPress={onStartAudio}>
          <Text style={styles.participantActionText}>🎤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.participantActionButton} onPress={onPress}>
          <Text style={styles.participantActionText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// Immersive Tab Component
function ImmersiveTab({ immersiveEnvironments, onEnterEnvironment, onExitEnvironment }: any) {
  return (
    <View style={styles.tabContent}>
      <Card style={styles.immersiveHeader}>
        <Text style={styles.immersiveHeaderTitle}>Immersive Environments</Text>
        <Text style={styles.immersiveHeaderDescription}>
          Enter virtual reality environments for enhanced collaboration.
        </Text>
      </Card>

      {immersiveEnvironments.length === 0 ? (
        <EmptyState
          title="No Immersive Environments"
          message="Immersive environments provide VR/AR collaboration experiences"
          icon="🥽"
        />
      ) : (
        immersiveEnvironments.map((environment: any) => (
          <Card key={environment.id} style={styles.immersiveCard}>
            <Text style={styles.immersiveCardTitle}>{environment.name}</Text>
            <Text style={styles.immersiveCardDescription}>{environment.description}</Text>
            <View style={styles.immersiveCardInfo}>
              <Text style={styles.immersiveCardInfoText}>
                Type: {environment.type}
              </Text>
              <Text style={styles.immersiveCardInfoText}>
                Capacity: {environment.maxParticipants}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.immersiveCardButton}
              onPress={() => onEnterEnvironment(environment.id)}
            >
              <Text style={styles.immersiveCardButtonText}>Enter Environment</Text>
            </TouchableOpacity>
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
  currentSessionBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sessionType: {
    fontSize: 16,
    color: '#27AE60',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionButton: {
    flex: 1,
  },
  immersiveBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  immersiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  immersiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  immersiveButton: {
    backgroundColor: '#9B59B6',
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
  sessionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  sessionInfoText: {
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
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  sessionDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#95A5A6',
    borderRadius: 4,
  },
  endButton: {
    backgroundColor: '#E74C3C',
  },
  sessionActionText: {
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
  workspaceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  workspaceDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  workspaceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workspaceInfoText: {
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
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  workspaceDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  workspaceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  workspaceActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  workspaceActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  participantCard: {
    padding: 16,
    marginBottom: 16,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  participantEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  participantInfo: {
    marginBottom: 12,
  },
  participantInfoText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  participantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  participantActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  participantActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  immersiveHeader: {
    padding: 20,
    marginBottom: 16,
  },
  immersiveHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  immersiveHeaderDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  immersiveCard: {
    padding: 16,
    marginBottom: 16,
  },
  immersiveCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  immersiveCardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  immersiveCardInfo: {
    marginBottom: 12,
  },
  immersiveCardInfoText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  immersiveCardButton: {
    padding: 12,
    backgroundColor: '#9B59B6',
    borderRadius: 6,
    alignItems: 'center',
  },
  immersiveCardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  sessionTypes: {
    marginBottom: 20,
  },
  sessionTypeOption: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sessionTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  sessionTypeDesc: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
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
