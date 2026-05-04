import { captureSilentFailure } from '../../utils/silent-failure';
import {
  SpectacleType,
  type SpectacleEvent,
  type SpectacleListener,
  type SpectaclePayload,
} from './types';

export { LootRarity, SpectacleType };
export type { SpectacleEvent, SpectacleListener, SpectaclePayload };

const SPECTACLE_COPY: Record<SpectacleType, { title: string; body: string }> = {
  [SpectacleType.MONTHLY_REPORT]: {
    title: 'Focus report ready',
    body: 'Your month has a new pattern to inspect.',
  },
  [SpectacleType.LEVEL_UP]: {
    title: 'Level up',
    body: 'That session pushed your growth forward.',
  },
  [SpectacleType.BOSS_DEFEATED]: {
    title: 'Boss defeated',
    body: 'Your focus landed the finishing hit.',
  },
  [SpectacleType.BOSS_DEFEAT]: {
    title: 'Boss defeated',
    body: 'Your focus landed the finishing hit.',
  },
  [SpectacleType.STREAK_MILESTONE]: {
    title: 'Streak milestone',
    body: 'Your creature has momentum to feed.',
  },
  [SpectacleType.ACHIEVEMENT_UNLOCK]: {
    title: 'Achievement unlocked',
    body: 'A new proof of progress is on your profile.',
  },
  [SpectacleType.PERFECT_SESSION]: {
    title: 'Perfect session',
    body: 'Clean finish. No wasted motion.',
  },
  [SpectacleType.FIRST_SESSION]: {
    title: 'First session complete',
    body: 'Your Focus Score journey has started.',
  },
  [SpectacleType.RARE_LOOT_DROP]: {
    title: 'Rare reward',
    body: 'A strong session pulled something better.',
  },
  [SpectacleType.LEGENDARY_LOOT_DROP]: {
    title: 'Legendary reward',
    body: 'That was a high-signal drop.',
  },
  [SpectacleType.MASTERY_RANK_UP]: {
    title: 'Mastery rank up',
    body: 'Your focus identity sharpened.',
  },
  [SpectacleType.SQUAD_WAR_WON]: {
    title: 'Squad victory',
    body: 'Your squad converted focus into pressure.',
  },
  [SpectacleType.WAGER_WON]: {
    title: 'Risk paid off',
    body: 'You backed the session and delivered.',
  },
};

const listeners = new Set<SpectacleListener>();

function getText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export const spectacleService = {
  subscribe(listener: SpectacleListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  triggerSpectacle(type: SpectacleType, payload: SpectaclePayload = {}): void {
    const fallback = SPECTACLE_COPY[type];
    const event: SpectacleEvent = {
      id: `${type}:${Date.now()}`,
      type,
      title: getText(payload.title) ?? fallback.title,
      body: getText(payload.body) ?? fallback.body,
      createdAt: Date.now(),
    };

    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        captureSilentFailure(error, {
          feature: 'spectacle',
          operation: 'notify-listener',
          type,
        });
      }
    });
  },
};
