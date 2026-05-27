export interface DetectedPattern {
  patternType: string;
  description: string;
  confidence: number;
  evidence: string[];
  recommendation?: string;
}

export interface BehaviorAnalytics {
  userId: string;
  timestamp: number;
  signalsCount: number;
  patternsDetected: number;
  confidenceLevel: string;
  dominantChronotype?: "morning" | "evening" | "variable";
  consistencyScore: number;
  engagementScore: number;
}
