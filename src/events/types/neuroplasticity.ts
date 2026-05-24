/**
 * Neuroplasticity Trainer Event Definitions
 *
 * Events for the Neuroplasticity Trainer (NPT) - actual brain training
 * backed by peer-reviewed cognitive science.
 */

export interface NeuroplasticityEventDefinitions {
  'NEUROPLASTICITY_PROFILE_CREATED': {
    userId: string;
    adhdSubtype: string;
    priorityDomains: string[];
    baselineLevel: number;
  };

  'TRAINING_SESSION_COMPLETED': {
    userId: string;
    domain: string;
    accuracy: number;
    xpEarned: number;
    levelUp: boolean;
    overallLevel: number;
  };

  'INTERVENTION_COMPLETED': {
    userId: string;
    interventionId: string;
    completed: boolean;
    effectiveness: number;
  };

  'COGNITIVE_ASSESSMENT_COMPLETED': {
    userId: string;
    overallImprovement: number;
    assessmentCount: number;
  };
  'session:break_started': { userId: string; sessionId: string; breakDuration: number };
  'session:distraction_detected': { userId: string; sessionId: string; distractionType: string };
  'session:frustration_detected': { userId: string; sessionId: string; frustrationLevel: number };
  'biofeedback:update': { userId: string; sessionId: string; data: { hrv: number; heartRate: number; coherence: number; skinConductance?: number } };
  'NPT_INTERVENTION_AVAILABLE': { userId: string; sessionId?: string; interventionId?: string; intervention?: unknown; domain?: string; breakDuration?: number; distractionType?: string; frustrationLevel?: number; trigger?: string };
  'NPT_TRAINING_BONUS': { userId: string; sessionId?: string; xpBonus?: number; baseXp?: number; totalXp?: number; xpMultiplier?: number; coinBonus?: number; gemBonus?: number; overallLevel?: number; domain?: string };
  'NPT_BIOFEEDBACK_INTERVENTION': { userId: string; sessionId?: string; interventionId?: string; intervention?: unknown; stressLevel?: string; biofeedback?: unknown };
}
