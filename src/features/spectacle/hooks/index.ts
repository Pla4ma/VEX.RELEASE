import { useState, useEffect, useCallback } from 'react';
import { spectacleService } from '../index';
import { SpectacleType, type SpectacleEvent, type SpectaclePayload } from '../types';

interface MasteryRankUpPayload extends SpectaclePayload {
  userId: string;
  oldRank: string;
  newRank: string;
  totalPoints: number;
  unlockedFeatures: string[];
  timestamp: number;
}

interface UseMasteryRankUpSpectacleReturn {
  event: MasteryRankUpPayload | null;
  isActive: boolean;
  dismiss: () => void;
  unlockedFeatures: string[];
}

export function useMasteryRankUpSpectacle(): UseMasteryRankUpSpectacleReturn {
  const [event, setEvent] = useState<MasteryRankUpPayload | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = spectacleService.subscribe((spectacleEvent: SpectacleEvent) => {
      if (spectacleEvent.type === SpectacleType.MASTERY_RANK_UP) {
        // SpectaclePayload has [key: string]: unknown; extract fields at runtime boundary
        const raw = spectacleEvent as SpectacleEvent & Record<string, unknown>;
        const payload: MasteryRankUpPayload = {
          userId: String(raw.userId ?? ''),
          oldRank: String(raw.oldRank ?? ''),
          newRank: String(raw.newRank ?? ''),
          totalPoints: Number(raw.totalPoints ?? 0),
          unlockedFeatures: Array.isArray(raw.unlockedFeatures) ? raw.unlockedFeatures as string[] : [],
          timestamp: Number(raw.timestamp ?? Date.now()),
        };
        setEvent(payload);
        setIsActive(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismiss = useCallback(() => {
    setIsActive(false);
    setEvent(null);
  }, []);

  return {
    event,
    isActive,
    dismiss,
    unlockedFeatures: event?.unlockedFeatures ?? [],
  };
}
