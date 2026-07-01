import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { captureSilentFailure } from '../../utils/silent-failure';
import { hashUserId } from '../../utils/sentry-privacy';
import {
  TomorrowPreviewDataSchema,
  type TomorrowPreviewData,
} from './tomorrow-preview-schemas';

const storageKey = (userId: string): string => `tomorrow_preview:${userId}`;

type PreviewStorage = {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | null;
  delete: (key: string) => void;
};

function getStorage(): PreviewStorage | null {
  try {
    // SAFETY: require() defers MMKV-backed storage access so non-native runtimes can fall back cleanly.
    const { storage } = require('../../store/mmkv-storage');
    return z.custom<PreviewStorage>().parse(storage);
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'home-spine',
      operation: 'network-fallback',
      type: 'network',
    });
    return null;
  }
}

export function saveTomorrowPreview(
  userId: string,
  preview: TomorrowPreviewData,
): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.set(
      storageKey(userId),
      JSON.stringify({ ...preview, savedAt: Date.now() }),
    );
  } catch (error) {
    Sentry.captureException(error, {
      extra: { userId: hashUserId(userId) },
      tags: { feature: 'tomorrow-preview', operation: 'save' },
    });
  }
}

export function loadTomorrowPreview(
  userId: string,
): (TomorrowPreviewData & { savedAt: number }) | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const data = storage.getString(storageKey(userId));
    if (!data) {
      return null;
    }
    return TomorrowPreviewDataSchema.extend({ savedAt: z.number() }).parse(
      JSON.parse(data),
    );
  } catch (error) {
    Sentry.captureException(error, {
      extra: { userId: hashUserId(userId) },
      tags: { feature: 'tomorrow-preview', operation: 'load' },
    });
    return null;
  }
}

export function clearTomorrowPreview(userId: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.delete(storageKey(userId));
  } catch (error) {
    Sentry.captureException(error, {
      extra: { userId: hashUserId(userId) },
      tags: { feature: 'tomorrow-preview', operation: 'clear' },
    });
  }
}
