/**
 * Neuroplasticity Trainer (NPT)
 *
 * Revolutionary retention through actual brain change.
 * Not gamification - actual neuroplasticity training backed by peer-reviewed science.
 *
 * @priority critical
 * @retention-target identity transformation through measurable brain change
 * @scientific-backing neuroplasticity CBT-for-ADHD working-memory-training
 */

export { NeuroplasticityTrainer } from './NeuroplasticityTrainer';
export { NeuroplasticityReadinessCard } from './components/NeuroplasticityReadinessCard';

export type {
  CognitiveDomain,
  DomainProgress,
  CognitiveProfile,
  MicroIntervention,
  TrainingSession,
  TrainingExercise,
} from './NeuroplasticityTrainer';

// Re-export constants as variables for test compatibility
export const NPT_CONFIG = {
  OPTIMAL_SESSION_FREQUENCY: 1,
  MAX_DAILY_TRAINING_MINUTES: 15,
  PROGRESSION_THRESHOLD: 0.85,
  ATTENTION_SPAN_BASELINE: 15,
  MAX_ATTENTION_SPAN_TARGET: 300,
  INTERVENTION_INTERVAL_MINUTES: 25,
  MICRO_BREAK_SECONDS: 30,
  LEVELS_PER_DOMAIN: 50,
  DOMAINS: [
    'SUSTAINED_ATTENTION',
    'SELECTIVE_ATTENTION',
    'WORKING_MEMORY',
    'COGNITIVE_FLEXIBILITY',
    'INHIBITORY_CONTROL',
    'PLANNING_ORGANIZATION',
    'EMOTIONAL_REGULATION',
    'METACOGNITIVE_AWARENESS',
  ] as const,
};
