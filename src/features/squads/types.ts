/**
 * Squads Feature - Domain Types
 *
 * Dependencies:
 * - Users (membership, invites)
 * - Sessions (squad sessions, shared focus)
 * - Progression (squad XP multipliers)
 * - Boss (shared boss encounters)
 * - Feed (squad activity sharing)
 * - Analytics (squad metrics)
 * - Notifications (invite, role change alerts)
 */

// ============================================================================
// Core Squad Types
// ============================================================================

export interface Squad {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;

  // Stats
  memberCount: number;
  maxMembers: number;
  totalFocusTime: number;
  completedSessions: number;

  // Multiplier mechanics
  focusMultiplier: number;
  multiplierLastUpdated: number;
  synergyLevel: number;

  // Shared features
  activeChallengeId: string | null;
  challengeProgress: number;
  activeBossId: string | null;
  bossHealthRemaining: number | null;

  // Settings
  isPublic: boolean;
  joinRequirements: JoinRequirement;

  // Metadata
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface SquadSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberCount: number;
  maxMembers: number;
  focusMultiplier: number;
  synergyLevel: number;
  isPublic: boolean;
  isMember: boolean;
  userRole: SquadRole | null;
}

export type SquadRole = 'FOUNDER' | 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'GUEST';

export type JoinRequirement = 'OPEN' | 'APPROVAL' | 'INVITE_ONLY' | 'LEVEL_REQ';

// ============================================================================
// Squad Member Types
// ============================================================================

export interface SquadMember {
  squadId: string;
  userId: string;
  role: SquadRole;

  // Membership state
  joinedAt: number;
  lastActiveAt: number;
  isActive: boolean;

  // Contribution tracking
  contributionScore: number;
  sessionsCompleted: number;
  totalFocusTime: number;
  lastContributionAt: number | null;

  // Permissions (cached for quick access)
  permissions: SquadPermission[];
}

export interface SquadMemberDetail extends SquadMember {
  // Joined user data
  displayName: string;
  avatarUrl: string | null;
  level: number;
  currentStreak: number;
  isOnline: boolean;
  lastSeenAt: number;
}

export type SquadPermission =
  | 'VIEW_SQUAD'
  | 'INVITE_MEMBERS'
  | 'KICK_MEMBERS'
  | 'MANAGE_ROLES'
  | 'EDIT_SQUAD'
  | 'DELETE_SQUAD'
  | 'START_SESSION'
  | 'MANAGE_CHALLENGE'
  | 'MANAGE_BOSS'
  | 'VIEW_ANALYTICS'
  | 'PIN_MESSAGES'
  | 'MODERATE_CHAT'
  | 'USE_SYERGY_BOOST';

// ============================================================================
// Squad Invite Types
// ============================================================================

export interface SquadInvite {
  id: string;
  squadId: string;

  // Inviter/invitee
  invitedBy: string;
  invitedUserId: string;

  // Invite state
  status: InviteStatus;
  roleOffered: SquadRole;
  message: string | null;

  // Expiration
  expiresAt: number;

  // Timestamps
  createdAt: number;
  respondedAt: number | null;
}

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED';

export interface SquadInviteDetail extends SquadInvite {
  // Squad info
  squadName: string;
  squadAvatarUrl: string | null;
  squadMemberCount: number;

  // Inviter info
  inviterName: string;
  inviterAvatarUrl: string | null;
}

// ============================================================================
// Squad Join Request Types
// ============================================================================

export interface SquadJoinRequest {
  id: string;
  squadId: string;
  userId: string;

  // Request state
  status: JoinRequestStatus;
  message: string | null;

  // Timestamps
  createdAt: number;
  reviewedAt: number | null;
  reviewedBy: string | null;
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface SquadJoinRequestDetail extends SquadJoinRequest {
  // Requester info
  displayName: string;
  avatarUrl: string | null;
  level: number;
  currentStreak: number;
}

// ============================================================================
// Squad Session Types
// ============================================================================

export interface SquadSession {
  id: string;
  squadId: string;

  // Session config
  name: string;
  description: string | null;
  duration: number;
  category: string;

  // State
  status: SquadSessionStatus;
  startedAt: number | null;
  endsAt: number | null;
  completedAt: number | null;

  // Participants
  participants: SquadSessionParticipant[];
  maxParticipants: number;

  // Results
  totalFocusTime: number;
  synergyBonus: number;
}

export type SquadSessionStatus = 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface SquadSessionParticipant {
  userId: string;
  joinedAt: number;
  status: ParticipantStatus;
  focusTime: number;
  joinedSessionId: string | null;
}

export type ParticipantStatus = 'INVITED' | 'JOINED' | 'ACTIVE' | 'PAUSED' | 'LEFT' | 'COMPLETED';

// ============================================================================
// Squad Synergy Types
// ============================================================================

export interface SquadSynergy {
  squadId: string;
  level: number;
  currentPoints: number;
  pointsToNextLevel: number;

  // Multiplier from synergy
  focusMultiplierBonus: number;

  // Daily tracking
  dailyPoints: number;
  dailyPointsCap: number;
  lastResetAt: number;
}

export interface SynergyActivity {
  id: string;
  squadId: string;
  userId: string;
  type: SynergyActivityType;
  points: number;
  description: string;
  createdAt: number;
}

export type SynergyActivityType =
  | 'SESSION_COMPLETE'
  | 'SESSION_TOGETHER'
  | 'BOSS_DAMAGE'
  | 'CHALLENGE_PROGRESS'
  | 'DAILY_LOGIN'
  | 'STREAK_MILESTONE'
  | 'INVITE_ACCEPTED';

// ============================================================================
// Squad Challenge Types
// ============================================================================

export interface SquadChallenge {
  id: string;
  squadId: string;

  // Challenge details
  title: string;
  description: string;
  type: SquadChallengeType;
  targetValue: number;
  currentValue: number;

  // State
  status: SquadChallengeStatus;

  // Time
  startsAt: number;
  endsAt: number;
  completedAt: number | null;

  // Rewards
  rewardType: 'XP' | 'COINS' | 'GEMS' | 'SYERGY_POINTS';
  rewardAmount: number;
}

export type SquadChallengeType =
  | 'TOTAL_FOCUS_TIME'
  | 'SESSION_COUNT'
  | 'CONCURRENT_SESSIONS'
  | 'BOSS_DAMAGE'
  | 'STREAK_MAINTAIN';

export type SquadChallengeStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// ============================================================================
// Squad Activity Types
// ============================================================================

export interface SquadActivity {
  id: string;
  squadId: string;
  userId: string;
  type: SquadActivityType;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: number;
}

export type SquadActivityType =
  | 'MEMBER_JOINED'
  | 'MEMBER_LEFT'
  | 'MEMBER_KICKED'
  | 'ROLE_CHANGED'
  | 'SESSION_STARTED'
  | 'SESSION_COMPLETED'
  | 'CHALLENGE_COMPLETED'
  | 'BOSS_DEFEATED'
  | 'SYNERGY_LEVEL_UP'
  | 'SETTINGS_CHANGED'
  | 'INVITE_SENT';

// ============================================================================
// Service Input Types
// ============================================================================

export interface CreateSquadInput {
  name: string;
  description: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  joinRequirements: JoinRequirement;
  maxMembers: number;
}

export interface UpdateSquadInput {
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  isPublic: boolean | null;
  joinRequirements: JoinRequirement | null;
  maxMembers: number | null;
}

export interface InviteToSquadInput {
  squadId: string;
  invitedUserId: string;
  roleOffered: SquadRole;
  message: string | null;
  expiresInHours: number;
}

export interface RespondToInviteInput {
  inviteId: string;
  accept: boolean;
}

export interface JoinSquadInput {
  squadId: string;
  message: string | null;
}

export interface LeaveSquadInput {
  squadId: string;
  newFounderId: string | null;
}

export interface KickMemberInput {
  squadId: string;
  memberUserId: string;
  reason: string | null;
}

export interface UpdateMemberRoleInput {
  squadId: string;
  memberUserId: string;
  newRole: SquadRole;
}

export interface StartSquadSessionInput {
  squadId: string;
  name: string;
  description: string | null;
  duration: number;
  category: string;
  maxParticipants: number;
}

export interface JoinSquadSessionInput {
  sessionId: string;
  userId: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type SquadErrorCode =
  | 'SQUAD_NOT_FOUND'
  | 'SQUAD_FULL'
  | 'ALREADY_MEMBER'
  | 'NOT_MEMBER'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'INVITE_NOT_FOUND'
  | 'INVITE_EXPIRED'
  | 'INVITE_ALREADY_USED'
  | 'CANNOT_INVITE_SELF'
  | 'USER_NOT_FOUND'
  | 'ROLE_NOT_FOUND'
  | 'CANNOT_KICK_FOUNDER'
  | 'CANNOT_LEAVE_AS_FOUNDER'
  | 'FOUNDER_TRANSFER_REQUIRED'
  | 'INVALID_ROLE_HIERARCHY'
  | 'REQUEST_NOT_FOUND'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_FULL'
  | 'SESSION_ALREADY_STARTED'
  | 'DUPLICATE_MEMBERSHIP'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface SquadError {
  code: SquadErrorCode;
  message: string;
  context: Record<string, unknown>;
}
