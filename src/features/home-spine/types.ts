export type RecommendationType =
  | 'OPTIMAL_TIME'
  | 'STREAK_PROTECTION'
  | 'COMEBACK_BUILDER'
  | 'DIFFICULTY_ADJUST'
  | 'CHALLENGE_SYNC'
  | 'BOSS_PREP'
  | 'HABIT_BUILDER'
  | 'ENERGY_BASED';

export type HomeSpineModel = {
  sections: HomeSpineSection[];
  primaryAction?: { label: string; route: string };
  secondaryAction?: { label: string; route: string };
};

export interface HomeSpineSection {
  kind: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  priority: number;
}
