/**
 * Services Export
 *
 * Shared services for the VEX application.
 */

export * from './auth';
export * from './supabaseAuth';
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
} from './realtime';

// Advanced Services
export * from './AdvancedMaterialsService';
export * from './ArtificialIntelligenceService';
export * from './BiometricAuthenticationService';
export * from './BiotechnologyService';
export * from './BlockchainService';
export * from './CloudComputingService';
export * from './CyberSecurityService';
export * from './DataAnalyticsService';
export * from './DigitalTwinService';
export * from './EdgeComputingService';
export * from './EnvironmentalScienceService';
export * from './HolographicDisplayService';
export * from './InternetOfThingsService';
export * from './MedicalResearchService';
export * from './NanotechnologyService';
export * from './NeuralInterfaceService';
export * from './QuantumComputingService';
export * from './RoboticsAutomationService';
export * from './RoboticsService';
export * from './SpaceExplorationService';
export * from './VirtualRealityService';
