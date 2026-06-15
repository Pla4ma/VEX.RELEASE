import { useMemo } from 'react';

import {
  clearTomorrowPreview,
  loadTomorrowPreview,
  type TomorrowPreviewData,
} from '../tomorrowPreviewService';

export function useSavedTomorrowPreview(
  userId: string,
): TomorrowPreviewData | null {
  return useMemo(() => {
    if (!userId) {
      return null;
    }

    const saved = loadTomorrowPreview(userId);
    if (!saved) {
      return null;
    }

    const now = new Date();
    const savedDate = new Date(saved.savedAt);
    const isStale =
      now.getDate() !== savedDate.getDate() ||
      now.getMonth() !== savedDate.getMonth() ||
      now.getFullYear() !== savedDate.getFullYear();

    if (isStale) {
      clearTomorrowPreview(userId);
      return null;
    }

    return {
      actionPrompt: saved.actionPrompt,
      emoji: saved.emoji,
      headline: saved.headline,
      metadata: saved.metadata,
      priority: saved.priority,
      subtext: saved.subtext,
      type: saved.type,
    };
  }, [userId]);
}
