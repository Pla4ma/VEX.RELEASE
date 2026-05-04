/**
 * Social System - Main Export
 *
 * Complete social feature module including:
 * - Domain models and validation schemas
 * - Service logic with error handling and retry
 * - Repository with offline support
 * - UI components and hooks
 * - Analytics integration
 */

// Schemas and Types
export * from './schemas';
export * from './types';

// Services
export {
  SocialService,
  getSocialService,
  createSocialService,
} from './SocialServiceEnhanced';

// Repository
export {
  SocialRepository,
  getSocialRepository,
  categorizeError,
  withRetry,
} from './repository-enhanced';

// Legacy exports for backward compatibility
export {
  createPost,
  getFeed,
  getSquadFeed,
  reactToPost,
  removeReaction,
  getReactionCounts,
  getPost,
  autoCreateSessionCompletePost,
  initializeSocialService,
  cleanupSocialService,
  type SocialPost,
} from './SocialService';

// Analytics
export {
  trackSocialEvent,
  trackPostCreated,
  trackPostViewed,
  trackReactionAdded,
  trackReactionRemoved,
  trackFriendRequestSent,
  trackFriendRequestAccepted,
  trackProfileViewed,
  trackFeedRefreshed,
  trackFeedLoadMore,
  trackSocialError,
  trackOfflineModeActivated,
  trackDegradedModeActivated,
  SocialAnalytics,
} from './analytics';

// UI Components
export {
  SocialLoadingState,
  SocialErrorState,
  SocialEmptyState,
} from './components';
