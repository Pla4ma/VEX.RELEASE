/**
 * Realtime Collaboration Hook
 * 
 * React hook for accessing realtime collaboration with live video/audio,
 * shared workspaces, AI facilitation, and immersive environments.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRealTimeCollaborationSystem } from '../../productivity/collaboration/RealTimeCollaborationSystem';
import type { 
  CollaborationSession,
  Workspace,
  Participant,
  CollaborationConfig,
  CollaborationRequest,
  CollaborationResponse,
  VideoSession,
  AudioSession,
  SharedDocument,
  AIFacilitator,
  CollaborationAnalytics,
  ImmersiveEnvironment
} from '../../productivity/collaboration/RealTimeCollaborationSystem';

interface UseCollaborationState {
  sessions: CollaborationSession[];
  currentSession: CollaborationSession | null;
  workspaces: Workspace[];
  participants: Participant[];
  videoSessions: VideoSession[];
  audioSessions: AudioSession[];
  sharedDocuments: SharedDocument[];
  analytics: CollaborationAnalytics[];
  immersiveEnvironments: ImmersiveEnvironment[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  lastUpdated: number | null;
}

interface UseCollaborationActions {
  initialize: (config: CollaborationConfig) => Promise<void>;
  startSession: (request: CollaborationRequest) => Promise<CollaborationSession | null>;
  endSession: (sessionId: string) => Promise<boolean>;
  joinSession: (sessionId: string, participantId: string) => Promise<boolean>;
  leaveSession: (sessionId: string, participantId: string) => Promise<boolean>;
  createWorkspace: (workspaceData: Partial<Workspace>) => Promise<Workspace | null>;
  joinWorkspace: (workspaceId: string) => Promise<boolean>;
  leaveWorkspace: (workspaceId: string) => Promise<boolean>;
  startVideoCall: (participantIds: string[]) => Promise<VideoSession | null>;
  endVideoCall: (sessionId: string) => Promise<boolean>;
  startAudioCall: (participantIds: string[]) => Promise<AudioSession | null>;
  endAudioCall: (sessionId: string) => Promise<boolean>;
  shareDocument: (documentData: Partial<SharedDocument>) => Promise<SharedDocument | null>;
  updateDocument: (documentId: string, content: any) => Promise<boolean>;
  inviteParticipant: (sessionId: string, participantEmail: string) => Promise<boolean>;
  getCollaboration: (request: CollaborationRequest) => Promise<CollaborationResponse | null>;
  enableAIFacilitator: (sessionId: string) => Promise<boolean>;
  disableAIFacilitator: (sessionId: string) => Promise<boolean>;
  enterImmersiveEnvironment: (environmentId: string) => Promise<boolean>;
  exitImmersiveEnvironment: () => Promise<boolean>;
  refreshSessions: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

interface UseCollaborationReturn extends UseCollaborationState, UseCollaborationActions {
  isReady: boolean;
  hasSessions: boolean;
  hasCurrentSession: boolean;
  hasWorkspaces: boolean;
  hasParticipants: boolean;
  activeSessions: CollaborationSession[];
  myWorkspaces: Workspace[];
  availableWorkspaces: Workspace[];
  onlineParticipants: Participant[];
  canStartSession: boolean;
  canJoinSession: boolean;
  isInImmersiveEnvironment: boolean;
}

export function useCollaboration(userId: string): UseCollaborationReturn {
  const [state, setState] = useState<UseCollaborationState>({
    sessions: [],
    currentSession: null,
    workspaces: [],
    participants: [],
    videoSessions: [],
    audioSessions: [],
    sharedDocuments: [],
    analytics: [],
    immersiveEnvironments: [],
    loading: false,
    error: null,
    initialized: false,
    lastUpdated: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize collaboration system
  const initialize = useCallback(async (config: CollaborationConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getRealTimeCollaborationSystem(userId);
      await system.initialize(config);
      
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        lastUpdated: Date.now(),
      }));
      
      // Load initial data
      await Promise.all([
        refreshSessions(),
        refreshWorkspaces(),
        refreshParticipants(),
      ]);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize collaboration',
      }));
    }
  }, [userId]);

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const system = getRealTimeCollaborationSystem(userId);
      const [
        sessions,
        currentSession,
        videoSessions,
        audioSessions,
        sharedDocuments,
        analytics,
      ] = await Promise.all([
        system.getSessions(),
        system.getCurrentSession(),
        system.getVideoSessions(),
        system.getAudioSessions(),
        system.getSharedDocuments(),
        system.getAnalytics(),
      ]);
      
      setState(prev => ({
        ...prev,
        sessions,
        currentSession,
        videoSessions,
        audioSessions,
        sharedDocuments,
        analytics,
        loading: false,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh sessions',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh workspaces
  const refreshWorkspaces = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const workspaces = await system.getWorkspaces();
      
      setState(prev => ({
        ...prev,
        workspaces,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh workspaces',
      }));
    }
  }, [userId, state.initialized]);

  // Refresh participants
  const refreshParticipants = useCallback(async () => {
    if (!state.initialized) return;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const participants = await system.getParticipants();
      
      setState(prev => ({
        ...prev,
        participants,
        lastUpdated: Date.now(),
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh participants',
      }));
    }
  }, [userId, state.initialized]);

  // Start collaboration session
  const startSession = useCallback(async (request: CollaborationRequest): Promise<CollaborationSession | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const session = await system.startSession(request);
      
      if (session) {
        setState(prev => ({
          ...prev,
          currentSession: session,
          sessions: [...prev.sessions, session],
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start session',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // End collaboration session
  const endSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.endSession(sessionId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          currentSession: prev.currentSession?.id === sessionId ? null : prev.currentSession,
          sessions: prev.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, status: 'ENDED', endedAt: Date.now() }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end session',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Join session
  const joinSession = useCallback(async (sessionId: string, participantId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.joinSession(sessionId, participantId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, participants: [...session.participants, { id: participantId, joinedAt: Date.now() }] }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to join session',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Leave session
  const leaveSession = useCallback(async (sessionId: string, participantId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.leaveSession(sessionId, participantId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, participants: session.participants.filter(p => p.id !== participantId) }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to leave session',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Create workspace
  const createWorkspace = useCallback(async (workspaceData: Partial<Workspace>): Promise<Workspace | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const workspace = await system.createWorkspace(workspaceData);
      
      if (workspace) {
        setState(prev => ({
          ...prev,
          workspaces: [...prev.workspaces, workspace],
          lastUpdated: Date.now(),
        }));
      }
      
      return workspace;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create workspace',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Join workspace
  const joinWorkspace = useCallback(async (workspaceId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.joinWorkspace(workspaceId);
      
      if (success) {
        await refreshWorkspaces();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to join workspace',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshWorkspaces]);

  // Leave workspace
  const leaveWorkspace = useCallback(async (workspaceId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.leaveWorkspace(workspaceId);
      
      if (success) {
        await refreshWorkspaces();
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to leave workspace',
      }));
      return false;
    }
  }, [userId, state.initialized, refreshWorkspaces]);

  // Start video call
  const startVideoCall = useCallback(async (participantIds: string[]): Promise<VideoSession | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const session = await system.startVideoCall(participantIds);
      
      if (session) {
        setState(prev => ({
          ...prev,
          videoSessions: [...prev.videoSessions, session],
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start video call',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // End video call
  const endVideoCall = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.endVideoCall(sessionId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          videoSessions: prev.videoSessions.map(session => 
            session.id === sessionId 
              ? { ...session, status: 'ENDED', endedAt: Date.now() }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end video call',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Start audio call
  const startAudioCall = useCallback(async (participantIds: string[]): Promise<AudioSession | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const session = await system.startAudioCall(participantIds);
      
      if (session) {
        setState(prev => ({
          ...prev,
          audioSessions: [...prev.audioSessions, session],
          lastUpdated: Date.now(),
        }));
      }
      
      return session;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start audio call',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // End audio call
  const endAudioCall = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.endAudioCall(sessionId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          audioSessions: prev.audioSessions.map(session => 
            session.id === sessionId 
              ? { ...session, status: 'ENDED', endedAt: Date.now() }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end audio call',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Share document
  const shareDocument = useCallback(async (documentData: Partial<SharedDocument>): Promise<SharedDocument | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const document = await system.shareDocument(documentData);
      
      if (document) {
        setState(prev => ({
          ...prev,
          sharedDocuments: [...prev.sharedDocuments, document],
          lastUpdated: Date.now(),
        }));
      }
      
      return document;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to share document',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Update document
  const updateDocument = useCallback(async (documentId: string, content: any): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.updateDocument(documentId, content);
      
      if (success) {
        setState(prev => ({
          ...prev,
          sharedDocuments: prev.sharedDocuments.map(doc => 
            doc.id === documentId 
              ? { ...doc, content, lastModified: Date.now() }
              : doc
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update document',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Invite participant
  const inviteParticipant = useCallback(async (sessionId: string, participantEmail: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.inviteParticipant(sessionId, participantEmail);
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to invite participant',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Get collaboration
  const getCollaboration = useCallback(async (request: CollaborationRequest): Promise<CollaborationResponse | null> => {
    if (!state.initialized) return null;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const response = await system.getCollaboration(request);
      
      return response;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get collaboration',
      }));
      return null;
    }
  }, [userId, state.initialized]);

  // Enable AI facilitator
  const enableAIFacilitator = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.enableAIFacilitator(sessionId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, aiFacilitator: { enabled: true, joinedAt: Date.now() } }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable AI facilitator',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Disable AI facilitator
  const disableAIFacilitator = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.disableAIFacilitator(sessionId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, aiFacilitator: { enabled: false } }
              : session
          ),
          lastUpdated: Date.now(),
        }));
      }
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disable AI facilitator',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Enter immersive environment
  const enterImmersiveEnvironment = useCallback(async (environmentId: string): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.enterImmersiveEnvironment(environmentId);
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enter immersive environment',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Exit immersive environment
  const exitImmersiveEnvironment = useCallback(async (): Promise<boolean> => {
    if (!state.initialized) return false;
    
    try {
      const system = getRealTimeCollaborationSystem(userId);
      const success = await system.exitImmersiveEnvironment();
      
      return success;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to exit immersive environment',
      }));
      return false;
    }
  }, [userId, state.initialized]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Retry operation
  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setState(prev => ({
        ...prev,
        error: 'Maximum retry attempts exceeded',
      }));
      return;
    }
    
    setRetryCount(prev => prev + 1);
    clearError();
    
    // Retry the last failed operation
    if (state.initialized) {
      await Promise.all([
        refreshSessions(),
        refreshWorkspaces(),
        refreshParticipants(),
      ]);
    }
  }, [retryCount, maxRetries, state.initialized, refreshSessions, refreshWorkspaces, refreshParticipants, clearError]);

  // Computed values
  const isReady = useMemo(() => state.initialized && !state.loading && !state.error, [state.initialized, state.loading, state.error]);
  const hasSessions = useMemo(() => state.sessions.length > 0, [state.sessions.length]);
  const hasCurrentSession = useMemo(() => state.currentSession !== null, [state.currentSession]);
  const hasWorkspaces = useMemo(() => state.workspaces.length > 0, [state.workspaces.length]);
  const hasParticipants = useMemo(() => state.participants.length > 0, [state.participants.length]);

  const activeSessions = useMemo(() => 
    state.sessions.filter(session => session.status === 'ACTIVE'),
    [state.sessions]
  );

  const myWorkspaces = useMemo(() => 
    state.workspaces.filter(workspace => workspace.ownerId === userId),
    [state.workspaces, userId]
  );

  const availableWorkspaces = useMemo(() => 
    state.workspaces.filter(workspace => workspace.ownerId !== userId && workspace.isPublic),
    [state.workspaces, userId]
  );

  const onlineParticipants = useMemo(() => 
    state.participants.filter(participant => participant.isOnline),
    [state.participants]
  );

  const canStartSession = useMemo(() => state.initialized && !state.currentSession, [state.initialized, state.currentSession]);
  const canJoinSession = useMemo(() => state.initialized && !state.currentSession, [state.initialized, state.currentSession]);
  const isInImmersiveEnvironment = useMemo(() => state.immersiveEnvironments.some(env => env.isActive), [state.immersiveEnvironments]);

  // Auto-refresh data periodically
  useEffect(() => {
    if (!state.initialized) return;
    
    const interval = setInterval(() => {
      refreshSessions();
      refreshParticipants();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.initialized, refreshSessions, refreshParticipants]);

  // Reset retry count on successful operation
  useEffect(() => {
    if (state.error === null && retryCount > 0) {
      setRetryCount(0);
    }
  }, [state.error, retryCount]);

  return {
    ...state,
    initialize,
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
  };
}
