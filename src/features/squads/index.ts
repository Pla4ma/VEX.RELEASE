/**
 * Squads Feature - Public API
 */

// Types
export type {
  Squad,
  SquadSummary,
  SquadRole,
  JoinRequirement,
  SquadMember,
  SquadMemberDetail,
  SquadPermission,
  SquadInvite,
  SquadInviteDetail,
  InviteStatus,
  SquadJoinRequest,
  SquadJoinRequestDetail,
  JoinRequestStatus,
  SquadSession,
  SquadSessionStatus,
  SquadSessionParticipant,
  ParticipantStatus,
  SquadSynergy,
  SynergyActivity,
  SquadChallenge,
  SquadChallengeStatus,
  SquadActivity,
  SquadActivityType,
  CreateSquadInput,
  UpdateSquadInput,
  InviteToSquadInput,
  RespondToInviteInput,
  JoinSquadInput,
  LeaveSquadInput,
  KickMemberInput,
  UpdateMemberRoleInput,
  StartSquadSessionInput,
  JoinSquadSessionInput,
  SquadError,
  SquadErrorCode,
} from './schemas';

// Schemas (for validation)
export {
  SquadSchema,
  SquadRoleSchema,
  SquadMemberSchema,
  SquadInviteSchema,
  CreateSquadInputSchema,
  UpdateSquadInputSchema,
} from './schemas';

// Service functions
export {
  createSquad,
  updateSquad,
  deleteSquad,
  inviteToSquad,
  respondToInvite,
  leaveSquad,
  kickMember,
  updateMemberRole,
  getSquadById,
  getSquadMembers,
  getSquadMember,
  getUserSquads,
  getPublicSquads,
  getSquadInvitesForUser,
  startSquadSession,
  hasPermission,
  canManageRole,
  getRolePermissions,
} from './service';

// Hooks
export {
  useUserSquads,
  useSquad,
  useSquadMembers,
  useSquadInvites,
  usePublicSquads,
  useCreateSquad,
  useUpdateSquad,
  useDeleteSquad,
  useInviteToSquad,
  useRespondToInvite,
  useLeaveSquad,
  useKickMember,
  useUpdateMemberRole,
  useStartSquadSession,
  useSquadPermissions,
  useSquadWarLeaderboardLive,
} from './hooks';

export type {
  SquadWar,
  SquadWarMemberStatus,
} from './squad-war-types';

export {
  SquadRepository,
  squadRepository,
  SquadRepositoryError,
} from './repository/index';

export {
  getActiveSquadWar,
  subscribeToSquadWar,
  recordWarDamage,
} from './squad-war-repository';

export {
  loadActiveSquadWar,
  watchActiveSquadWar,
  submitSquadWarDamage,
} from './squad-war-service';

export { SquadWarHUD } from './components/squad-war-hud';
export { DailyLeaderboard } from './components/DailyLeaderboard';
export { SquadMissionCard } from './components/SquadMissionCard';
export {
  calculateContributionScore,
  getDefendingMessage,
  getRankChangeMessage,
  getRankTitle,
} from './competitive-types';
export {
  getDailyContributions,
  getSquadMissions,
  updateUserContribution,
  type DailyContributionEntry,
} from './competitive-service';

// Phase 9 - Squad Invite Flow
export {
  acceptSquadInvite,
  advanceOnboardingStep,
  createSquadInvite,
  createSquadInviteNotification,
  createSquadOnboarding,
  declineSquadInvite,
  generateSquadInviteLink,
  getInviteExpirationMessage,
  getOnboardingStepMessage,
  getPendingSquadInvites,
  isSquadInviteExpired,
  validateSquadInviteCode,
} from './invite-flow';

export type {
  SquadInviteStatus,
  OnboardingStep,
  SquadOnboardingState,
} from './invite-flow';

// Phase 5.1 - Squad System Simplification
// Re-export with simplified suffix to avoid conflicts with legacy system
export {
  createSquad as createSimplifiedSquad,
  joinSquad as joinSimplifiedSquad,
  leaveSquad as leaveSimplifiedSquad,
  recordMemberActivity,
  resetWeeklyProgress,
  getActivityFeed,
  recordBossDamageActivity,
  startSquadBoss,
  damageSquadBoss,
  discoverPublicSquads,
  getUserSquads as getUserSimplifiedSquads,
  getSquad as getSimplifiedSquad,
  getSquadSummary,
  type SimplifiedSquad,
  type SquadMember as SimplifiedSquadMember,
  type WeeklyGoal,
  type SquadStreak,
  type SquadActivity as SimplifiedSquadActivity,
  type SquadBossEncounter,
} from './SimplifiedSquadSystem';
