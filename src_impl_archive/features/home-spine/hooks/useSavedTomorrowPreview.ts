import { useEffect, useState } from 'react';

import {
  clearTomorrowPreview,
  loadTomorrowPreview,
  type TomorrowPreviewData,
} from '../tomorrowPreviewService';

export function useSavedTomorrowPreview(userId: string): TomorrowPreviewData | null {
  const [preview, setPreview] = useState<TomorrowPreviewData | null>(null);

  useEffect(() => {
    if (!userId) {
      setPreview(null);
      return;
    }

    const saved = loadTomorrowPreview(userId);
    if (!saved) {
      setPreview(null);
      return;
    }

    const now = new Date();
    const savedDate = new Date(saved.savedAt);
    const isStale =
      now.getDate() !== savedDate.getDate() ||
      now.getMonth() !== savedDate.getMonth() ||
      now.getFullYear() !== savedDate.getFullYear();

    if (isStale) {
      clearTomorrowPreview(userId);
      setPreview(null);
      return;
    }

    const previewData: TomorrowPreviewData = {
      actionPrompt: saved.actionPrompt,
      emoji: saved.emoji,
      headline: saved.headline,
      metadata: saved.metadata,
      priority: saved.priority,
      subtext: saved.subtext,
      type: saved.type,
    };
    setPreview(previewData);
  }, [userId]);

  return preview;
}
