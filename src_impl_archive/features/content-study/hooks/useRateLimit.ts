/**
 * useRateLimit Hook
 * Tracks daily generation limits
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../store';
import { fetchContentHistory } from '../ContentStudyService';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import type { StudyContent } from '../types';

export function useRateLimit() {
  const { user } = useAuthStore();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkLimit = useCallback(async () => {
    if (!user?.id) {
      setRemaining(null);
      return;
    }

    setIsChecking(true);
    try {
      const history = await fetchContentHistory(user.id, CONTENT_STUDY_CONSTANTS.DAILY_GENERATION_LIMIT);
      const today = new Date().toISOString().slice(0, 10);
      const generatedToday = history.filter((item: StudyContent) => item.lastGenerationDate === today).length;
      setRemaining(Math.max(0, CONTENT_STUDY_CONSTANTS.DAILY_GENERATION_LIMIT - generatedToday));
    } finally {
      setIsChecking(false);
    }
  }, [user?.id]);

  return {
    remaining,
    isChecking,
    checkLimit,
  };
}
