export interface BossPhaseConfig {
    phaseThreshold: number;
    mechanic: BossMechanicType;
    intensity: number;
    playerRisk: boolean;
}

export interface ModeBossConfig {
    damageMultiplier: number;
    weakness: SessionMode | null;
    resistance: SessionMode | null;
    phases: BossPhaseConfig[];
    specialRewardType: string;
}

export interface ModeRewardBias {
    primaryCurrency: 'COINS' | 'GEMS' | 'TOKENS';
    secondaryDrops: string[];
    rarityBoost: number;
    guaranteedDropAtStreak: number;
}

export interface ModeScoringFocus {
    primaryMetric: 'DURATION' | 'PURITY' | 'SPEED' | 'CONSISTENCY' | 'COMBOS';
    secondaryMetric: 'DURATION' | 'PURITY' | 'SPEED' | 'CONSISTENCY' | 'COMBOS';
    primaryWeight: number;
    secondaryWeight: number;
    penaltyFor: ('PAUSE' | 'EARLY_EXIT' | 'LOW_PURITY')[];
}

export interface EnhancedSessionModeConfig extends SessionModeConfig {
    bossConfig: ModeBossConfig;
    rewardBias: ModeRewardBias;
    scoringFocus: ModeScoringFocus;
    description: string;
    tacticalNote: string;
    idealFor: string[];
}

export type BossMechanicType = | 'REGENERATION'      // Boss heals if you pause (FLOW)
      | 'FOCUS_SHIELD'      // Requires uninterrupted time (CHALLENGE)
      | 'COUNTDOWN'         // Time pressure (RECOVERY)
      | 'IDEA_ORBS';
