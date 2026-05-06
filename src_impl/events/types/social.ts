/**
 * Social Events
 */

export interface SocialEventDefinitions {
  'social:gift_currency': {
    fromUserId: string;
    toUserId: string;
    currency: 'COINS' | 'GEMS' | 'SEASONAL';
    amount: number;
  };
  'social:post_auto': {
    userId: string;
    type: 'level_up';
    content: string;
    metadata: Record<string, unknown>;
  };
  'social:share': { userId: string };
  'social:post_created': { post: unknown; userId: string };
  'social:reaction_added': { userId: string; postId: string; reaction: string };
  'social:reaction_removed': { userId: string; postId: string };
  'social:friend_request_sent': {
    fromUserId: string;
    toUserId: string;
    relationship: unknown;
  };
  'social:friend-request-received': {
    fromUserId: string;
    toUserId: string;
    relationship: unknown;
  };
  'social:friend-request-accepted': {
    fromUserId: string;
    toUserId: string;
  };
  'social:friend-removed': {
    fromUserId: string;
    toUserId: string;
  };
  'social:activity-created': { userId: string; activityType: string; data: Record<string, unknown> };
  'social:activity-liked': { userId: string; postId?: string; itemId?: string; reaction?: string; timestamp?: number };
  'social:activity-commented': { userId: string; postId: string; commentId: string };
  'social:message-received': { userId: string; senderId: string; messageId: string };
  'social:message-sent': { userId: string; conversationId: string; messageId: string };
  'social:messages-read': { userId: string; conversationId: string };
  'social:victory-card-shared': { userId: string; cardType: string };
  'social:referral-completed': { referrerId: string; referredId: string };
  'social:error_occurred': {
    userId: string;
    error: unknown;
    recoverable: boolean;
    context: string;
  };
  'social:offline_mode_activated': { userId: string; queueSize: number };
  'social:degraded_mode_activated': { userId: string; reason: string };
  'social:state_changed': { userId: string; state: unknown };
  'challenge:friend_challenge': {
    fromUserId: string;
    toUserId: string;
    challengeType: string;
    createdAt: number;
  };
  'notification:schedule': {
    userId: string;
    type: string;
    title: string;
    body: string;
    scheduledFor?: number;
    priority?: string;
    data?: Record<string, unknown>;
  };
  'social:squad_activity': {
    userId: string;
    squadId: string;
    activity: {
      type: string;
      duration: number;
      xpEarned: number;
    };
  };
  'social:guild_activity': {
    userId: string;
    guildId: string;
    activity: {
      type: string;
      duration: number;
      xpEarned: number;
    };
  };
  'social:activity': {
    userId: string;
    activityType: string;
    visibility: 'PRIVATE' | 'FRIENDS' | 'SQUAD' | 'PUBLIC';
    data: Record<string, unknown>;
  };
  'social:feed_post': {
    userId: string;
    type: string;
    content: string;
    metadata: Record<string, unknown>;
  };
}
