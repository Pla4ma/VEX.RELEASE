/**
 * Real-time Collaboration - Domain Types
 */

export interface CollaborationSession {
  id: string;
  name: string;
  description?: string;
  type: 'meeting' | 'workshop' | 'brainstorm' | 'review' | 'presentation' | 'tutorial';
  status: 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  hostId: string;
  participants: CollaborationParticipant[];
  settings: CollaborationSettings;
  content: CollaborationContent;
  schedule: {
    startTime: Date;
    endTime?: Date;
    duration?: number; // minutes
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
    };
  };
  permissions: CollaborationPermissions;
  analytics: CollaborationAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationParticipant {
  id: string;
  userId: string;
  sessionId: string;
  role: 'host' | 'moderator' | 'participant' | 'observer';
  status: 'online' | 'offline' | 'away' | 'busy';
  joinedAt: Date;
  lastSeen: Date;
  permissions: {
    canSpeak: boolean;
    canShare: boolean;
    canRecord: boolean;
    canModerate: boolean;
    canAnnotate: boolean;
  };
  media: {
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenShareEnabled: boolean;
    deviceInfo?: {
      microphone?: string;
      camera?: string;
      browser?: string;
      os?: string;
    };
  };
  location?: {
    timezone: string;
    region?: string;
  };
}

export interface CollaborationSettings {
  maxParticipants: number;
  allowRecording: boolean;
  requireApproval: boolean;
  waitingRoom: boolean;
  password?: string;
  features: {
    chat: boolean;
    screenShare: boolean;
    whiteboard: boolean;
    fileShare: boolean;
    polls: boolean;
    breakoutRooms: boolean;
    recording: boolean;
    transcription: boolean;
    annotations: boolean;
  };
  quality: {
    videoQuality: 'auto' | '720p' | '1080p' | '4k';
    audioQuality: 'standard' | 'high' | 'ultra';
    bandwidthLimit?: number; // kbps
  };
  moderation: {
    allowHandRaise: boolean;
    allowReactions: boolean;
    profanityFilter: boolean;
    autoModeration: boolean;
  };
}

export interface CollaborationContent {
  agenda: CollaborationAgenda[];
  documents: SharedDocument[];
  whiteboard: WhiteboardState;
  chat: ChatMessage[];
  polls: CollaborationPoll[];
  recordings: Recording[];
  annotations: Annotation[];
}

export interface CollaborationAgenda {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  presenter?: string;
  order: number;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  resources: ResourceLink[];
  notes?: string;
}

export interface SharedDocument {
  id: string;
  name: string;
  type: 'document' | 'presentation' | 'spreadsheet' | 'image' | 'video' | 'other';
  url: string;
  size: number; // bytes
  uploadedBy: string;
  uploadedAt: Date;
  permissions: {
    canView: string[];
    canEdit: string[];
    canDownload: string[];
  };
  version: number;
  lastModified: Date;
}

export interface WhiteboardState {
  id: string;
  elements: WhiteboardElement[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  background: {
    type: 'color' | 'grid' | 'image';
    value: string;
  };
  permissions: {
    canDraw: string[];
    canErase: string[];
    canAddElements: string[];
  };
  lastModified: Date;
}

export interface WhiteboardElement {
  id: string;
  type: 'text' | 'shape' | 'line' | 'arrow' | 'image' | 'drawing';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    fontSize?: number;
    fontFamily?: string;
  };
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  type: 'text' | 'file' | 'reaction' | 'system';
  timestamp: Date;
  reactions?: MessageReaction[];
  replyTo?: string;
  attachments?: MessageAttachment[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  thumbnail?: string;
}

export interface CollaborationPoll {
  id: string;
  sessionId: string;
  question: string;
  type: 'single' | 'multiple' | 'rating' | 'open';
  options: PollOption[];
  settings: {
    anonymous: boolean;
    allowMultiple: boolean;
    showResults: 'immediately' | 'after_vote' | 'when_closed';
    endTime?: Date;
  };
  responses: PollResponse[];
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'closed' | 'archived';
}

export interface PollOption {
  id: string;
  text: string;
  order: number;
  votes: number;
  percentage?: number;
}

export interface PollResponse {
  userId: string;
  optionIds: string[];
  timestamp: Date;
  rating?: number; // for rating polls
  comment?: string; // for open polls
}

export interface Recording {
  id: string;
  sessionId: string;
  name: string;
  type: 'audio' | 'video' | 'screen' | 'full';
  url: string;
  duration: number; // seconds
  size: number; // bytes
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: string;
  thumbnail?: string;
  permissions: {
    canView: string[];
    canDownload: string[];
    canShare: string[];
  };
  metadata: {
    startTime: Date;
    endTime: Date;
    participants: string[];
    chapters?: RecordingChapter[];
  };
  createdAt: Date;
  processedAt?: Date;
}

export interface RecordingChapter {
  id: string;
  title: string;
  description?: string;
  startTime: number; // seconds
  endTime: number; // seconds
  thumbnail?: string;
  tags: string[];
}

export interface Annotation {
  id: string;
  sessionId: string;
  userId: string;
  target: {
    type: 'document' | 'whiteboard' | 'screen' | 'video';
    targetId: string;
    position: { x: number; y: number };
  };
  content: {
    type: 'text' | 'drawing' | 'highlight' | 'shape';
    data: any;
  };
  style: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
  };
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
  createdAt: Date;
  lastModified: Date;
}

export interface CollaborationPermissions {
  sessionId: string;
  roles: {
    [roleName: string]: {
      canJoin: boolean;
      canSpeak: boolean;
      canShare: boolean;
      canRecord: boolean;
      canModerate: boolean;
      canAnnotate: boolean;
      canManageParticipants: boolean;
      canManageSettings: boolean;
    };
  };
  participantOverrides: {
    [userId: string]: Partial<CollaborationPermissions['roles'][string]>;
  };
}

export interface CollaborationAnalytics {
  sessionId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    participantCount: number;
    averageDuration: number;
    engagementScore: number;
    interactionCount: number;
    contentShared: number;
    messagesCount: number;
    pollsCount: number;
    recordingsCount: number;
    annotationsCount: number;
  };
  participantMetrics: Array<{
    userId: string;
    joinTime: Date;
    leaveTime?: Date;
    duration: number;
    interactions: number;
    contributions: number;
    engagementScore: number;
  }>;
  qualityMetrics: {
    averageVideoQuality: number;
    averageAudioQuality: number;
    connectionStability: number;
    latency: number;
    packetLoss: number;
  };
  createdAt: Date;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'document' | 'video' | 'website' | 'tool' | 'other';
  description?: string;
  tags: string[];
}

export interface RealtimeConnection {
  id: string;
  userId: string;
  sessionId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  quality: {
    latency: number;
    bandwidth: number;
    packetLoss: number;
    jitter: number;
  };
  media: {
    audio: {
      enabled: boolean;
      quality: number;
      bitrate: number;
    };
    video: {
      enabled: boolean;
      quality: number;
      resolution: string;
      bitrate: number;
    };
    screen: {
      enabled: boolean;
      quality: number;
      resolution: string;
      bitrate: number;
    };
  };
  lastHeartbeat: Date;
  createdAt: Date;
}

export interface CollaborationNotification {
  id: string;
  userId: string;
  sessionId: string;
  type: 'session_starting' | 'session_ended' | 'participant_joined' | 'participant_left' | 'message' | 'poll_created' | 'recording_started' | 'recording_stopped' | 'annotation_added';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
}
