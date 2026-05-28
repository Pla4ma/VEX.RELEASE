import type { BaseModel } from "./user";

export interface Notification extends BaseModel {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  image?: string;
  actionUrl?: string;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  deliveredAt?: string;
}

export type NotificationType =
  | "system"
  | "achievement"
  | "squad"
  | "economy"
  | "social"
  | "content"
  | "security";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface ActivityFeedItem extends BaseModel {
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  relatedEntities: RelatedEntity[];
}

export type ActivityType =
  | "joined"
  | "created"
  | "updated"
  | "completed"
  | "achieved"
  | "earned"
  | "shared"
  | "commented"
  | "liked";

export interface RelatedEntity {
  type: string;
  id: string;
  name: string;
  image?: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  filters: AppliedFilter[];
  suggestions?: string[];
  didYouMean?: string;
}

export interface AppliedFilter {
  key: string;
  value: unknown;
  operator: string;
}
