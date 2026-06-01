import { BaseNotificationEvent } from './notification-event-types-core';

export interface NotificationCampaignCreatedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_created';
  data: {
    campaignId: string;
    name: string;
    description: string;
    templateId: string;
    targetAudience: {
      users?: string[];
      segments?: string[];
      filters: unknown[];
      excludeUsers?: string[];
    };
    schedule: {
      type: string;
      startDate?: Date;
      endDate?: Date;
      timezone: string;
      frequency?: string;
      sendTimes?: string[];
    };
    budget: {
      maxNotifications: number;
      maxCost?: number;
      costPerNotification?: number;
      currency?: string;
    };
    status: string;
    createdBy: string;
  };
}
export interface NotificationCampaignStartedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_started';
  data: {
    campaignId: string;
    startedAt: Date;
    targetCount: number;
    estimatedDuration: number;
    channels: string[];
    budget: { maxNotifications: number; maxCost?: number };
  };
}
export interface NotificationCampaignCompletedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_completed';
  data: {
    campaignId: string;
    completedAt: Date;
    metrics: {
      sent: number;
      delivered: number;
      read: number;
      clicked: number;
      failed: number;
      cost: number;
      ctr: number;
      deliveryRate: number;
      readRate: number;
    };
    performance: { efficiency: number; effectiveness: number; roi: number };
    issues: string[];
    recommendations: string[];
  };
}
export interface NotificationCampaignPausedEvent extends BaseNotificationEvent {
  type: 'notification_campaign_paused';
  data: {
    campaignId: string;
    pausedAt: Date;
    reason: string;
    pausedBy: string;
    progress: { sent: number; total: number; percentage: number };
    resumeAt?: Date;
  };
}
export interface NotificationRuleTriggeredEvent extends BaseNotificationEvent {
  type: 'notification_rule_triggered';
  data: {
    ruleId: string;
    ruleName: string;
    triggeredAt: Date;
    conditions: {
      field: string;
      operator: string;
      value: unknown;
      satisfied: boolean;
    }[];
    actions: {
      type: string;
      parameters: Record<string, unknown>;
      executed: boolean;
    }[];
    context: {
      userId: string;
      triggerData: Record<string, unknown>;
      environment: Record<string, unknown>;
    };
  };
}
export interface NotificationRuleCreatedEvent extends BaseNotificationEvent {
  type: 'notification_rule_created';
  data: {
    ruleId: string;
    name: string;
    description: string;
    conditions: unknown[];
    actions: unknown[];
    priority: number;
    enabled: boolean;
    createdBy: string;
    createdAt: Date;
  };
}
export interface NotificationRuleUpdatedEvent extends BaseNotificationEvent {
  type: 'notification_rule_updated';
  data: {
    ruleId: string;
    changes: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
      reason: string;
    }[];
    updatedBy: string;
    updatedAt: Date;
  };
}
