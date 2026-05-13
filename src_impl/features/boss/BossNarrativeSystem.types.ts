export type BossPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'FINAL_PHASE';
export type VisualTheme = 'dark' | 'fire' | 'ice' | 'nature' | 'shadow';
export type MusicMood = 'tense' | 'epic' | 'calm' | 'dramatic' | 'victory';
export type PhaseEffects = {
      visual: string[];
      audio: string[];
      haptic: boolean;
    };
export type BossNarrativeArc = {
      bossId: string;
      bossName: string;
      phases: BossPhaseNarrative[];
      taunts: string[];
      theme: VisualTheme;
    };
export type BossPhaseNarrative = {
      phase: BossPhase;
      title: string;
      description: string;
      healthThreshold: number; // 0-1
      effects: PhaseEffects;
      musicMood: MusicMood;
    };
export type BossPhaseState = {
      currentPhase: BossPhase;
      phaseTransitions: number;
      tauntsShown: string[];
    };
export type BossTheme = {
      primary: string;
      secondary: string;
      accent: string;
    };
export type PhaseNarrative = {
      title: string;
      description: string;
      effects: PhaseEffects;
    };
