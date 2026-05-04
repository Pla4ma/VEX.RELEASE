export interface RetentionIntervention {
  id: string;
  userId: string;
  kind: 'COMEBACK' | 'STREAK_RISK' | 'SESSION_REINFORCEMENT';
  message: string;
  createdAt: number;
}
