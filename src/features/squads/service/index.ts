/**
 * Squads Service
 *
 * Split into domain-specific modules for maintainability.
 * All exports maintain backward compatibility with original service.ts
 */

// Constants and utilities
export {
  MAX_SQUAD_MEMBERS,
  DEFAULT_SQUAD_SIZE,
  SYNERGY_POINTS_PER_LEVEL,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from './constants';

// Error handling
export { createError } from './errors';

// Permissions
export { getRolePermissions, hasPermission, canManageRole } from './permissions';

// Synergy
export { initializeSquadSynergy, addSynergyPoints, getSquadSynergy } from './synergy';

// Activity logging
export { logSquadActivity, getSquadActivity } from './activity';

// Queries
export {
  getSquadById,
  getSquadSummary,
  getSquadMembers,
  getSquadMember,
  getSquadMemberDetails,
  getUserInvites,
  getUserJoinRequests,
  getSquadInvites,
  getSquadJoinRequests,
  getSquadStats,
  searchSquads,
  getUserSquads,
  getRecommendedSquads,
} from './queries';

// Re-export core functions from original service.ts
// These will be extracted in a future pass:
// - createSquad
// - updateSquad
// - inviteToSquad
// - respondToInvite
// - joinSquad
// - leaveSquad
// - kickMember
// - updateMemberRole
// - startSquadSession
