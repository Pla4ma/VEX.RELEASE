/**
 * Squads — Cooperative focus system
 *
 * Simplified: create, join, focus together, get synergy bonus.
 * Realtime presence shows who's focusing now.
 */

// Service
export {
  createSquad, getSquad, joinSquad, leaveSquad,
  getMemberSquad, getSquadMembers, updateMemberActivity,
  createSquadSession, joinSquadSession, completeSquadSession,
} from './service';

// Realtime sessions
export {
  subscribeToSquadPresence, trackPresence, untrackPresence,
} from './squad-sessions';

// Types
export type {
  Squad, SquadMember, SquadSession, SquadSessionStatus,
  CreateSquadInput, CreateSquadSessionInput,
} from './types';

export { SQUAD_LIMITS } from './types';

// Schemas
export { CreateSquadInputSchema, CreateSquadSessionInputSchema } from './schemas';
