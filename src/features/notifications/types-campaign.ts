export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: CampaignTarget;
  schedule: CampaignSchedule;
  budget: CampaignBudget;
  status: CampaignStatus;
  metrics: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignTarget {
  users?: string[];
  segments?: string[];
  filters: TargetFilter[];
  excludeUsers?: string[];
}

export interface TargetFilter {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: unknown;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  sendTimes?: string[];
}

export interface CampaignBudget {
  maxNotifications: number;
  maxCost?: number;
  costPerNotification?: number;
  currency?: string;
}

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  cost: number;
  ctr: number;
  deliveryRate: number;
  readRate: number;
}
