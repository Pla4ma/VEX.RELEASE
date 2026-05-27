export interface PendingAction {
  id: string;
  type: "session" | "purchase" | "sync" | "upload";
  priority: "high" | "medium" | "low";
  description: string;
  timestamp: number;
  retryCount: number;
}

export interface GroupedPendingActions {
  high: PendingAction[];
  medium: PendingAction[];
  low: PendingAction[];
}
