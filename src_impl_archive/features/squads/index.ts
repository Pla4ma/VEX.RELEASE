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
} from './hooks';

export {
  SquadRepository,
  squadRepository,
  SquadRepositoryError,
} from './repository/index';
export { SquadMissionCard } from './components/SquadMissionCard';
// Competitive features - temporarily disabled due to missing modules
// export {
//   calculateContributionScore,
//   getDefendingMessage,
//   getRankChangeMessage,
//   getRankTitle,
// } from './competitive-types';
// export {
//   getDailyContributions,
//   getSquadMissions,
//   updateUserContribution,
//   type DailyContributionEntry,
// } from './competitive-service';

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


