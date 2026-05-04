/**
 * Domain Utility Hooks
 *
 * Hooks for domain colors, icons, labels, and title progress.
 * Uses theme tokens instead of hardcoded colors.
 */

import { useMemo } from 'react';
import { useTheme } from '../../../theme';
import type { CognitiveDomain } from '../NeuroplasticityTrainer';

/**
 * Get theme-based color for a cognitive domain
 */
export function useDomainColor(domain: CognitiveDomain | null): string {
  const { theme } = useTheme();

  const colors: Record<CognitiveDomain, string> = {
    SUSTAINED_ATTENTION: theme.colors.error.DEFAULT,     // Red for focus/attention
    SELECTIVE_ATTENTION: theme.colors.accent.teal,        // Teal for filtering
    WORKING_MEMORY: theme.colors.accent.blue,              // Blue for memory
    COGNITIVE_FLEXIBILITY: theme.colors.success.DEFAULT,   // Green for adaptability
    INHIBITORY_CONTROL: theme.colors.warning.DEFAULT,      // Amber for impulse control
    PLANNING_ORGANIZATION: theme.colors.accent.purple,     // Purple for executive function
    EMOTIONAL_REGULATION: theme.colors.accent.pink,       // Pink for emotions
    METACOGNITIVE_AWARENESS: theme.colors.accent.orange,   // Orange for self-awareness
  };

  return domain ? colors[domain] : theme.colors.text.tertiary;
}

/**
 * Get emoji icon for a cognitive domain
 */
export function useDomainIcon(domain: CognitiveDomain | null): string {
  const icons: Record<CognitiveDomain, string> = {
    SUSTAINED_ATTENTION: '🎯',
    SELECTIVE_ATTENTION: '🔍',
    WORKING_MEMORY: '🧠',
    COGNITIVE_FLEXIBILITY: '🔄',
    INHIBITORY_CONTROL: '🛑',
    PLANNING_ORGANIZATION: '📋',
    EMOTIONAL_REGULATION: '😌',
    METACOGNITIVE_AWARENESS: '💭',
  };

  return domain ? icons[domain] : '❓';
}

/**
 * Get human-readable label for a cognitive domain
 */
export function useDomainLabel(domain: CognitiveDomain | null): string {
  const labels: Record<CognitiveDomain, string> = {
    SUSTAINED_ATTENTION: 'Sustained Attention',
    SELECTIVE_ATTENTION: 'Selective Attention',
    WORKING_MEMORY: 'Working Memory',
    COGNITIVE_FLEXIBILITY: 'Cognitive Flexibility',
    INHIBITORY_CONTROL: 'Inhibitory Control',
    PLANNING_ORGANIZATION: 'Planning & Organization',
    EMOTIONAL_REGULATION: 'Emotional Regulation',
    METACOGNITIVE_AWARENESS: 'Metacognitive Awareness',
  };

  return domain ? labels[domain] : 'Unknown';
}

/**
 * Get title progress based on overall level
 */
export function useTitleProgress(level: number): {
  currentTitle: string;
  nextTitle: string;
  progress: number;
} {
  const titles = useMemo(() => [
    { min: 0, title: 'Neural Novice' },
    { min: 10, title: 'Synaptic Student' },
    { min: 25, title: 'Cognitive Cadet' },
    { min: 50, title: 'Attention Apprentice' },
    { min: 100, title: 'Neural Ninja' },
    { min: 200, title: 'Executive Warrior' },
    { min: 350, title: 'Plasticity Master' },
    { min: 500, title: 'Cognitive Sage' },
    { min: 700, title: 'Neuroplasticity Legend' },
    { min: 900, title: 'Executive Virtuoso' },
  ], []);

  return useMemo(() => {
    let currentTitle = titles[0].title;
    let nextTitle = titles[1]?.title || 'Max Level';
    let currentMin = 0;
    let nextMin = titles[1]?.min || 1000;

    for (let i = titles.length - 1; i >= 0; i--) {
      if (level >= titles[i].min) {
        currentTitle = titles[i].title;
        nextTitle = titles[i + 1]?.title || 'Max Level';
        currentMin = titles[i].min;
        nextMin = titles[i + 1]?.min || 1000;
        break;
      }
    }

    const progress = nextMin === 1000 ? 1 : (level - currentMin) / (nextMin - currentMin);

    return { currentTitle, nextTitle, progress };
  }, [level, titles]);
}
