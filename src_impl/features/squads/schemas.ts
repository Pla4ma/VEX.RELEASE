import { z } from 'zod';
export const SquadRoleSchema = z.enum(['FOUNDER', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST']);
export const JoinRequirementSchema = z.enum(['OPEN', 'APPROVAL', 'INVITE_ONLY', 'LEVEL_REQ']);
export const InviteStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED']);
export const JoinRequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
export const SquadSessionStatusSchema = z.enum(['SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']);
export const ParticipantStatusSchema = z.enum(['INVITED', 'JOINED', 'ACTIVE', 'PAUSED', 'LEFT', 'COMPLETED']);
export const SquadChallengeTypeSchema = z.enum(['TOTAL_FOCUS_TIME', 'SESSION_COUNT', 'CONCURRENT_SESSIONS', 'BOSS_DAMAGE', 'STREAK_MAINTAIN']);
export const SquadChallengeStatusSchema = z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED']);
export const SquadActivityTypeSchema = z.enum(['MEMBER_JOINED', 'MEMBER_LEFT', 'MEMBER_KICKED', 'ROLE_CHANGED', 'SESSION_STARTED', 'SESSION_COMPLETED', 'CHALLENGE_COMPLETED', 'BOSS_DEFEATED', 'SYNERGY_LEVEL_UP', 'SETTINGS_CHANGED', 'INVITE_SENT']);
export const SynergyActivityTypeSchema = z.enum(['SESSION_COMPLETE', 'SESSION_TOGETHER', 'BOSS_DAMAGE', 'CHALLENGE_PROGRESS', 'DAILY_LOGIN', 'STREAK_MILESTONE', 'INVITE_ACCEPTED']);
export const SquadPermissionSchema = z.enum(['VIEW_SQUAD', 'INVITE_MEMBERS', 'KICK_MEMBERS', 'MANAGE_ROLES', 'EDIT_SQUAD', 'DELETE_SQUAD', 'START_SESSION', 'MANAGE_CHALLENGE', 'MANAGE_BOSS', 'VIEW_ANALYTICS', 'PIN_MESSAGES', 'MODERATE_CHAT', 'USE_SYERGY_BOOST']);
export const SquadErrorCodeSchema = z.enum(['SQUAD_NOT_FOUND', 'SQUAD_FULL', 'ALREADY_MEMBER', 'NOT_MEMBER', 'INSUFFICIENT_PERMISSIONS', 'INVITE_NOT_FOUND', 'INVITE_EXPIRED', 'INVITE_ALREADY_USED', 'CANNOT_INVITE_SELF', 'USER_NOT_FOUND', 'ROLE_NOT_FOUND', 'CANNOT_KICK_FOUNDER', 'CANNOT_LEAVE_AS_FOUNDER', 'FOUNDER_TRANSFER_REQUIRED', 'INVALID_ROLE_HIERARCHY', 'REQUEST_NOT_FOUND', 'SESSION_NOT_FOUND', 'SESSION_FULL', 'SESSION_ALREADY_STARTED', 'DUPLICATE_MEMBERSHIP', 'RATE_LIMITED', 'NETWORK_ERROR', 'UNKNOWN_ERROR']);
export const SquadSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(3).max(50),
    description: z.string().max(500).nullable(),
    avatarUrl: z.string().url().nullable(),
    bannerUrl: z.string().url().nullable(),
    memberCount: z.number().int().min(1).max(100),
    maxMembers: z.number().int().min(2).max(50).default(10),
    totalFocusTime: z.number().min(0).default(0),
    completedSessions: z.number().int().min(0).default(0),
    focusMultiplier: z.number().min(1).max(2).default(1),
    multiplierLastUpdated: z.number(),
    synergyLevel: z.number().int().min(1).max(10).default(1),
    activeChallengeId: z.string().uuid().nullable(),
    challengeProgress: z.number().min(0).max(100).default(0),
    activeBossId: z.string().uuid().nullable(),
    bossHealthRemaining: z.number().min(0).nullable(),
    isPublic: z.boolean().default(true),
    joinRequirements: JoinRequirementSchema.default('APPROVAL'),
    createdAt: z.number(),
    updatedAt: z.number(),
    createdBy: z.string().uuid(),
  })
  .strict();
export const SquadSummarySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().url().nullable(),
    memberCount: z.number().int(),
    maxMembers: z.number().int(),
    focusMultiplier: z.number(),
    synergyLevel: z.number().int(),
    isPublic: z.boolean(),
    isMember: z.boolean(),
    userRole: SquadRoleSchema.nullable(),
  })
  .strict();
export const SquadMemberSchema = z
  .object({
    squadId: z.string().uuid(),
    userId: z.string().uuid(),
    role: SquadRoleSchema,
    joinedAt: z.number(),
    lastActiveAt: z.number(),
    isActive: z.boolean().default(true),
    contributionScore: z.number().min(0).default(0),
    sessionsCompleted: z.number().int().min(0).default(0),
    totalFocusTime: z.number().min(0).default(0),
    lastContributionAt: z.number().nullable(),
    permissions: z.array(SquadPermissionSchema).default([]),
  })
  .strict();
export const SquadMemberDetailSchema = SquadMemberSchema.extend({
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
  level: z.number().int().min(1),
  currentStreak: z.number().int().min(0),
  isOnline: z.boolean(),
  lastSeenAt: z.number(),
}).strict();
export const SquadInviteSchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    invitedBy: z.string().uuid(),
    invitedUserId: z.string().uuid(),
    status: InviteStatusSchema.default('PENDING'),
    roleOffered: SquadRoleSchema.default('MEMBER'),
    message: z.string().max(200).nullable(),
    expiresAt: z.number(),
    createdAt: z.number(),
    respondedAt: z.number().nullable(),
  })
  .strict();
export const SquadInviteDetailSchema = SquadInviteSchema.extend({
  squadName: z.string(),
  squadAvatarUrl: z.string().url().nullable(),
  squadMemberCount: z.number().int(),
  inviterName: z.string(),
  inviterAvatarUrl: z.string().url().nullable(),
}).strict();
export const SquadJoinRequestSchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    userId: z.string().uuid(),
    status: JoinRequestStatusSchema.default('PENDING'),
    message: z.string().max(200).nullable(),
    createdAt: z.number(),
    reviewedAt: z.number().nullable(),
    reviewedBy: z.string().uuid().nullable(),
  })
  .strict();
export const SquadJoinRequestDetailSchema = SquadJoinRequestSchema.extend({
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
  level: z.number().int(),
  currentStreak: z.number().int(),
}).strict();
export const SquadSessionParticipantSchema = z
  .object({
    userId: z.string().uuid(),
    joinedAt: z.number(),
    status: ParticipantStatusSchema,
    focusTime: z.number().min(0).default(0),
    joinedSessionId: z.string().uuid().nullable(),
  })
  .strict();
export const SquadSessionSchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    duration: z.number().int().min(60).max(7200),
    category: z.string().min(1).max(50),
    status: SquadSessionStatusSchema,
    startedAt: z.number().nullable(),
    endsAt: z.number().nullable(),
    completedAt: z.number().nullable(),
    participants: z.array(SquadSessionParticipantSchema),
    maxParticipants: z.number().int().min(2).max(20).default(10),
    totalFocusTime: z.number().min(0).default(0),
    synergyBonus: z.number().min(0).default(0),
  })
  .strict();
export const SquadSynergySchema = z
  .object({
    squadId: z.string().uuid(),
    level: z.number().int().min(1).max(10).default(1),
    currentPoints: z.number().min(0).default(0),
    pointsToNextLevel: z.number().min(0).default(100),
    focusMultiplierBonus: z.number().min(0).default(0),
    dailyPoints: z.number().min(0).default(0),
    dailyPointsCap: z.number().min(0).default(100),
    lastResetAt: z.number(),
  })
  .strict();
export const SynergyActivitySchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    userId: z.string().uuid(),
    type: SynergyActivityTypeSchema,
    points: z.number().int(),
    description: z.string(),
    createdAt: z.number(),
  })
  .strict();
export const SquadChallengeSchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    type: SquadChallengeTypeSchema,
    targetValue: z.number().min(1),
    currentValue: z.number().min(0).default(0),
    status: SquadChallengeStatusSchema,
    startsAt: z.number(),
    endsAt: z.number(),
    completedAt: z.number().nullable(),
    rewardType: z.enum(['XP', 'COINS', 'GEMS', 'SYERGY_POINTS']),
    rewardAmount: z.number().min(0),
  })
  .strict();
export const SquadActivitySchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    userId: z.string().uuid(),
    type: SquadActivityTypeSchema,
    content: z.string().max(500),
    metadata: z.record(z.unknown()).nullable(),
    createdAt: z.number(),
  })
  .strict();
export const SquadWarStatusSchema = z.enum(['active', 'victory', 'defeat', 'expired']);
export const SquadWarMemberStatusSchema = z
  .object({
    userId: z.string().uuid(),
    displayName: z.string().min(1),
    isCurrentlyFocusing: z.boolean(),
    sessionStartedAt: z.number().nullable(),
    damageContributed: z.number().min(0),
    lastSeenAt: z.number().min(0),
  })
  .strict();
export const SquadWarSchema = z
  .object({
    id: z.string().uuid(),
    squadId: z.string().uuid(),
    opponentSquadId: z.string().uuid().nullable(),
    bossName: z.string().min(1),
    bossMaxHealth: z.number().int().positive(),
    bossCurrentHealth: z.number().int().min(0),
    weekStartsAt: z.string().datetime(),
    weekEndsAt: z.string().datetime(),
    members: z.array(SquadWarMemberStatusSchema),
    status: SquadWarStatusSchema,
    rewardMultiplier: z.number().positive(),
  })
  .strict();
export const SquadWeeklyGoalSchema = z
  .object({
    squadId: z.string().uuid(),
    targetMinutes: z.number().int().min(0),
    currentMinutes: z.number().int().min(0).default(0),
    weekStart: z.number(),
    resetDay: z.number().int().min(0).max(6),
    completedAt: z.number().nullable(),
  })
  .strict();
export const RecordSquadWarDamageInputSchema = z
  .object({
    squadId: z.string().uuid(),
    userId: z.string().uuid(),
    damage: z.number().int().min(0),
    sessionId: z.string().uuid(),
  })
  .strict();
export const SquadStatsSchema = z
  .object({
    squadId: z.string().uuid(),
    totalSessions: z.number().int().min(0),
    totalFocusMinutes: z.number().int().min(0),
    totalBossDamage: z.number().int().min(0),
    averageSessionQuality: z.number().min(0).max(100).nullable(),
    topContributor: z
      .object({
        userId: z.string().uuid(),
        displayName: z.string(),
        focusMinutes: z.number().int().min(0),
      })
      .nullable(),
    activeStreak: z.number().int().min(0),
    lastUpdatedAt: z.number(),
  })
  .strict();
export const CreateSquadInputSchema = z
  .object({
    name: z.string().min(3).max(50),
    description: z.string().max(500).nullable().default(null),
    avatarUrl: z.string().url().nullable().default(null),
    isPublic: z.boolean().default(true),
    joinRequirements: JoinRequirementSchema.default('APPROVAL'),
    maxMembers: z.number().int().min(2).max(50).default(10),
  })
  .strict();
export const UpdateSquadInputSchema = z
  .object({
    name: z.string().min(3).max(50).nullable(),
    description: z.string().max(500).nullable(),
    avatarUrl: z.string().url().nullable(),
    bannerUrl: z.string().url().nullable(),
    isPublic: z.boolean().nullable(),
    joinRequirements: JoinRequirementSchema.nullable(),
    maxMembers: z.number().int().min(2).max(50).nullable(),
  })
  .strict();
export const InviteToSquadInputSchema = z
  .object({
    squadId: z.string().uuid(),
    invitedUserId: z.string().uuid(),
    roleOffered: SquadRoleSchema.default('MEMBER'),
    message: z.string().max(200).nullable().default(null),
    expiresInHours: z.number().int().min(1).max(168).default(48),
  })
  .strict();
export const RespondToInviteInputSchema = z.object({ inviteId: z.string().uuid(), accept: z.boolean() }).strict();
export const JoinSquadInputSchema = z
  .object({
    squadId: z.string().uuid(),
    message: z.string().max(200).nullable().default(null),
  })
  .strict();
export const LeaveSquadInputSchema = z
  .object({
    squadId: z.string().uuid(),
    newFounderId: z.string().uuid().nullable().default(null),
  })
  .strict();
export const KickMemberInputSchema = z
  .object({
    squadId: z.string().uuid(),
    memberUserId: z.string().uuid(),
    reason: z.string().max(200).nullable().default(null),
  })
  .strict();
export const UpdateMemberRoleInputSchema = z
  .object({
    squadId: z.string().uuid(),
    memberUserId: z.string().uuid(),
    newRole: SquadRoleSchema,
  })
  .strict();
export const StartSquadSessionInputSchema = z
  .object({
    squadId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable().default(null),
    duration: z.number().int().min(60).max(7200),
    category: z.string().min(1).max(50),
    maxParticipants: z.number().int().min(2).max(20).default(10),
  })
  .strict();
export const JoinSquadSessionInputSchema = z.object({ sessionId: z.string().uuid(), userId: z.string().uuid() }).strict();
export const SquadErrorSchema = z
  .object({
    code: SquadErrorCodeSchema,
    message: z.string(),
    context: z.record(z.unknown()).default({}),
  })
  .strict();
export type Squad = z.infer<typeof SquadSchema>;
export type SquadSummary = z.infer<typeof SquadSummarySchema>;
export type SquadRole = z.infer<typeof SquadRoleSchema>;
export type JoinRequirement = z.infer<typeof JoinRequirementSchema>;
export type SquadMember = z.infer<typeof SquadMemberSchema>;
export type SquadMemberDetail = z.infer<typeof SquadMemberDetailSchema>;
export type SquadPermission = z.infer<typeof SquadPermissionSchema>;
export type SquadInvite = z.infer<typeof SquadInviteSchema>;
export type SquadInviteDetail = z.infer<typeof SquadInviteDetailSchema>;
export type InviteStatus = z.infer<typeof InviteStatusSchema>;
export type SquadJoinRequest = z.infer<typeof SquadJoinRequestSchema>;
export type SquadJoinRequestDetail = z.infer<typeof SquadJoinRequestDetailSchema>;
export type JoinRequestStatus = z.infer<typeof JoinRequestStatusSchema>;
export type SquadSession = z.infer<typeof SquadSessionSchema>;
export type SquadSessionStatus = z.infer<typeof SquadSessionStatusSchema>;
export type SquadSessionParticipant = z.infer<typeof SquadSessionParticipantSchema>;
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;
export type SquadSynergy = z.infer<typeof SquadSynergySchema>;
export type SynergyActivity = z.infer<typeof SynergyActivitySchema>;
export type SynergyActivityType = z.infer<typeof SynergyActivityTypeSchema>;
export type SquadChallenge = z.infer<typeof SquadChallengeSchema>;
export type SquadChallengeType = z.infer<typeof SquadChallengeTypeSchema>;
export type SquadChallengeStatus = z.infer<typeof SquadChallengeStatusSchema>;
export type SquadActivity = z.infer<typeof SquadActivitySchema>;
export type SquadActivityType = z.infer<typeof SquadActivitySchema>;
export type SquadStats = z.infer<typeof SquadStatsSchema>;
export type SquadWarStatus = z.infer<typeof SquadWarStatusSchema>;
export type SquadWarMemberStatus = z.infer<typeof SquadWarMemberStatusSchema>;
export type SquadWar = z.infer<typeof SquadWarSchema>;
export type SquadError = z.infer<typeof SquadErrorSchema>;
export type SquadErrorCode = z.infer<typeof SquadErrorCodeSchema>;
export type CreateSquadInput = z.infer<typeof CreateSquadInputSchema>;
export type UpdateSquadInput = z.infer<typeof UpdateSquadInputSchema>;
export type InviteToSquadInput = z.infer<typeof InviteToSquadInputSchema>;
export type RespondToInviteInput = z.infer<typeof RespondToInviteInputSchema>;
export type JoinSquadInput = z.infer<typeof JoinSquadInputSchema>;
export type LeaveSquadInput = z.infer<typeof LeaveSquadInputSchema>;
export type KickMemberInput = z.infer<typeof KickMemberInputSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInputSchema>;
export type StartSquadSessionInput = z.infer<typeof StartSquadSessionInputSchema>;
export type JoinSquadSessionInput = z.infer<typeof JoinSquadSessionInputSchema>;
export type SquadWeeklyGoal = z.infer<typeof SquadWeeklyGoalSchema>;
export type RecordSquadWarDamageInput = z.infer<typeof RecordSquadWarDamageInputSchema>;
