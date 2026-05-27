/**
 * Services Export
 *
 * Shared services for the VEX application.
 */

export * from "./supabaseAuth";
export {
  initializePresence,
  updatePresence,
  subscribeToSquadPresence,
  subscribeToActivity,
  subscribeToFeedChanges,
  subscribeToSquadChanges,
  subscribeToGuildQuests,
  broadcastActivity,
  cleanupRealtime,
  getActiveChannelCount,
  type PresenceStatus,
  type UserPresence,
  type SquadPresence,
  type BroadcastMessage,
} from "./realtime";
