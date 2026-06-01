import type {
  NotificationType,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from './types-core';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  defaultTitle: string;
  defaultMessage: string;
  variables: TemplateVariable[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  ttl: number;
  throttling: ThrottlingSettings;
  localization: Record<string, LocalizedTemplate>;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  required: boolean;
  defaultValue?: unknown;
  description: string;
}

export interface LocalizedTemplate {
  title: string;
  message: string;
  variables?: Record<string, string>;
}

export interface ThrottlingSettings {
  enabled: boolean;
  maxPerHour: number;
  maxPerDay: number;
  cooldownPeriod: number;
  groupBy: string[];
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: unknown;
  logicalOperator?: 'and' | 'or';
}

export interface RuleAction {
  type: 'send' | 'schedule' | 'transform' | 'filter' | 'route' | 'suppress';
  parameters: Record<string, unknown>;
}
