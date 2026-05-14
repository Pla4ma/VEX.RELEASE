export interface ExperienceImprovement {
  area: string;
  current: number; // 0-100
  target: number; // 0-100
  gap: number;
  priority: 'low' | 'medium' | 'high';
  strategies: string[];
  resources: ImprovementResource[];
}

export interface ImprovementResource {
  type: 'tutorial' | 'tool' | 'setting' | 'feature' | 'exercise';
  name: string;
  description: string;
  availability: boolean;
  effectiveness: number; // 0-100
}

// Event Types
export interface SessionStartEvent {
  type: 'session_initiated' | 'session_prepared' | 'session_ready' | 'session_started' | 'preparation_completed' | 'readiness_assessed';
  userId: string;
  sessionId: string;
  startId: string;
  data: Record<string, any>;
  timestamp: Date;
}
