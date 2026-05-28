export type VoiceTone =
  | "ENCOURAGING"
  | "STERN"
  | "PLAYFUL"
  | "WISE"
  | "COMPETITIVE"
  | "GENTLE";

export type CoachStyle =
  | "CHEERLEADER"
  | "DRILL_SERGEANT"
  | "FRIEND"
  | "MENTOR"
  | "RIVAL"
  | "MINDFUL";

export type MessageCategory =
  | "STREAK_RISK"
  | "SESSION_SUGGESTION"
  | "MILESTONE_HYPE"
  | "COMEBACK_SUPPORT"
  | "POST_FAILURE"
  | "PROGRESS_REMINDER"
  | "DIFFICULTY_ADJUST"
  | "CHALLENGE_PROMPT"
  | "MOTIVATION_BOOST"
  | "BREAK_SUGGESTION"
  | "OVERLOAD_WARNING";

export type ConditionType =
  | "STREAK_DAYS"
  | "STREAK_RISK_LEVEL"
  | "SESSIONS_TODAY"
  | "SESSIONS_WEEK"
  | "LAST_SESSION_HOURS"
  | "CURRENT_LEVEL"
  | "TIME_OF_DAY"
  | "DAY_OF_WEEK"
  | "DAYS_INACTIVE"
  | "HAS_ACTIVE_BOSS"
  | "IS_PREMIUM"
  | "PREFERRED_SESSION_TIME"
  | "AVERAGE_SESSION_QUALITY"
  | "FAILED_SESSIONS_RECENT";

export type MessageStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "DISMISSED"
  | "EXPIRED";

export type DeliveryMethod = "IN_APP" | "PUSH" | "BOTH" | "DEFERRED";

export interface CoachPersona {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  voiceTone: VoiceTone;
  style: CoachStyle;
  catchphrase: string;
  defaultEnabled: boolean;
}

export interface MessageCondition {
  type: ConditionType;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "in" | "between";
  value: unknown;
  field?: string;
}

export interface CoachMessageTemplate {
  id: string;
  personaId: string;
  category: MessageCategory;
  subcategory: string;
  priority: number;
  content: string;
  conditions: MessageCondition[];
  variations: string[];
  cooldownHours: number;
}

export interface CoachMessage {
  id: string;
  userId: string;
  personaId: string;
  category: MessageCategory;
  content: string;
  deliveryMethod: DeliveryMethod;
  priority: number;
  status: MessageStatus;
  createdAt: number;
  scheduledFor: number | null;
  deliveredAt: number | null;
  readAt: number | null;
  dismissedAt: number | null;
  actionTaken: string | null;
  actionTakenAt: number | null;
}

export interface CoachHistory {
  userId: string;
  messages: CoachMessage[];
  totalMessages: number;
  responseRate: number;
  preferredCategories: MessageCategory[];
  mutedCategories: MessageCategory[];
  lastMessageAt: number;
}
