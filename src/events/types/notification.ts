/**
 * Notification Events
 */

export interface NotificationEventDefinitions {
  'notification:receive': { id: string; type: string; data: unknown };
  'notification:tap': { id: string; type: string };
  'notification:dismiss': { id: string };
  'notification:in_app_banner': {
    message: string;
    type: string;
    data?: Record<string, unknown>;
  };
  'notification:send': {
    userId?: string;
    type: string;
    title: string;
    body: string;
    priority?: string;
    data?: Record<string, unknown>;
  };
  'notifications:send-campaign': {
    campaignId: string;
    userIds: string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  'notification:sent': {
    notificationId: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    timestamp: number;
  };
  'notifications:squad_broadcast': {
    squadId: string;
    type: string;
    data: {
      challengeId: string;
      progress: number;
      target: number;
      percentComplete: number;
    };
  };
}
