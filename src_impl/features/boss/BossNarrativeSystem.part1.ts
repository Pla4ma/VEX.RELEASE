import { eventBus } from "../../events";


export const BOSS_NARRATIVE_ARCS: Record<string, BossNarrativeArc> = {
  'procrastination-dragon': {
    bossId: 'procrastination-dragon',
    bossName: 'The Procrastination Dragon',
    phases: [
      {
        phase: 'PHASE_1',
        title: 'The Dragon Wakes',
        description: 'The beast stirs from its slumber...',
        healthThreshold: 1.0,
        effects: { visual: ['glow'], audio: ['rumble'], haptic: false },
        musicMood: 'tense',
      },
      {
        phase: 'PHASE_2',
        title: 'Fiery Resistance',
        description: 'The dragon unleashes its flames!',
        healthThreshold: 0.6,
        effects: { visual: ['fire'], audio: ['roar'], haptic: true },
        musicMood: 'epic',
      },
      {
        phase: 'PHASE_3',
        title: 'Final Stand',
        description: 'The dragon fights with desperate fury!',
        healthThreshold: 0.2,
        effects: { visual: ['inferno'], audio: ['scream'], haptic: true },
        musicMood: 'dramatic',
      },
    ],
    taunts: ["I'll deal with it tomorrow...", 'Just five more minutes...', "The deadline isn't until next week!"],
    theme: 'fire',
  },
  'distraction-demon': {
    bossId: 'distraction-demon',
    bossName: 'The Distraction Demon',
    phases: [
      {
        phase: 'PHASE_1',
        title: 'Whispers Begin',
        description: 'Subtle temptations start to surface...',
        healthThreshold: 1.0,
        effects: { visual: ['shadow'], audio: ['whisper'], haptic: false },
        musicMood: 'tense',
      },
      {
        phase: 'PHASE_2',
        title: 'Temptation Grows',
        description: 'The demon offers irresistible diversions!',
        healthThreshold: 0.5,
        effects: { visual: ['phantom'], audio: ['laughter'], haptic: true },
        musicMood: 'dramatic',
      },
    ],
    taunts: ['Did you see that notification?', 'Your phone is calling to you...', 'Just a quick scroll through social media...'],
    theme: 'shadow',
  },
};

export function getBossNarrativeArc(bossId: string): BossNarrativeArc | null {
  return BOSS_NARRATIVE_ARCS[bossId] ?? null;
}

export function determineBossPhase(bossId: string, healthPercent: number): BossPhase {
  const arc = getBossNarrativeArc(bossId);
  if (!arc) {
    return 'PHASE_1';
  }

  // Find the phase based on health threshold
  for (let i = arc.phases.length - 1; i >= 0; i--) {
    if (healthPercent <= arc.phases[i].healthThreshold) {
      return arc.phases[i].phase;
    }
  }
  return 'PHASE_1';
}

export function calculateHealthPercent(remaining: number, max: number): number {
  return Math.max(0, Math.min(1, remaining / max));
}

export function getPhaseNarrative(bossId: string, phase: BossPhase): PhaseNarrative | null {
  const arc = getBossNarrativeArc(bossId);
  if (!arc) {
    return null;
  }

  const phaseData = arc.phases.find((p) => p.phase === phase);
  if (!phaseData) {
    return null;
  }

  return {
    title: phaseData.title,
    description: phaseData.description,
    effects: phaseData.effects,
  };
}

export function getRandomTaunt(bossId: string): string | null {
  const arc = getBossNarrativeArc(bossId);
  if (!arc || arc.taunts.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * arc.taunts.length);
  return arc.taunts[index];
}

export function getCurrentVisualTheme(bossId: string): VisualTheme {
  const arc = getBossNarrativeArc(bossId);
  return arc?.theme ?? 'dark';
}

export function getCurrentMusicMood(bossId: string, phase: BossPhase): MusicMood {
  const arc = getBossNarrativeArc(bossId);
  if (!arc) {
    return 'tense';
  }

  const phaseData = arc.phases.find((p) => p.phase === phase);
  return phaseData?.musicMood ?? 'tense';
}

export function getPhaseEffects(bossId: string, phase: BossPhase): PhaseEffects {
  const arc = getBossNarrativeArc(bossId);
  if (!arc) {
    return { visual: [], audio: [], haptic: false };
  }

  const phaseData = arc.phases.find((p) => p.phase === phase);
  return phaseData?.effects ?? { visual: [], audio: [], haptic: false };
}

export function initializePhaseState(bossId: string): BossPhaseState {
  const state: BossPhaseState = {
    currentPhase: 'PHASE_1',
    phaseTransitions: 0,
    tauntsShown: [],
  };
  phaseStateMap.set(bossId, state);
  return state;
}

export function updatePhaseState(bossId: string, newPhase: BossPhase): void {
  const state = phaseStateMap.get(bossId);
  if (state && state.currentPhase !== newPhase) {
    state.currentPhase = newPhase;
    state.phaseTransitions++;

    // Publish event for phase change
    eventBus.publish('boss:phase_changed', {
      bossId,
      newPhase,
      previousPhase: state.currentPhase,
      encounterId: `${bossId}_${Date.now()}`,
    });
  }
}

export function getPhaseState(bossId: string): BossPhaseState | null {
  return phaseStateMap.get(bossId) ?? null;
}