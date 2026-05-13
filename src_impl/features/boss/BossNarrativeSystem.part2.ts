import { eventBus } from "../../events";


export function recordTauntShown(bossId: string, taunt: string): void {
  const state = phaseStateMap.get(bossId);
  if (state) {
    state.tauntsShown.push(taunt);
  }
}

export function clearPhaseState(bossId: string): void {
  phaseStateMap.delete(bossId);
}

export function getBossStory(bossId: string): string {
  const arc = getBossNarrativeArc(bossId);
  if (!arc) {
    return '';
  }

  return `${arc.bossName} - A formidable foe that tests your focus and determination.`;
}

export function getBossTheme(bossId: string): BossTheme {
  const visualTheme = getCurrentVisualTheme(bossId);

  const themeColors: Record<VisualTheme, BossTheme> = {
    dark: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', accent: 'theme.colors.primary[500]' },
    fire: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', accent: 'theme.colors.error.DEFAULT' },
    ice: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.success.DEFAULT', accent: 'theme.colors.primary[500]' },
    nature: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', accent: 'theme.colors.primary[500]' },
    shadow: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', accent: 'theme.colors.primary[500]' },
  };

  return themeColors[visualTheme] ?? themeColors.dark;
}

export function hasNarrativeArc(bossId: string): boolean {
  return bossId in BOSS_NARRATIVE_ARCS;
}

export function getAllNarrativeArcs(): BossNarrativeArc[] {
  return Object.values(BOSS_NARRATIVE_ARCS);
}