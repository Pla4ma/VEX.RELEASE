import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function getDiscoveryHint(collectionSet: CollectionSet, currentProgress: number): string | null {
  if (!collectionSet.hidden) {
    return null;
  }
  if (currentProgress === 0) {
    return null;
  } // Completely hidden
  if (currentProgress < 25) {
    return '🔮 A mysterious collection exists...';
  }
  if (currentProgress < 50) {
    return "🧩 You've found some pieces of a puzzle...";
  }
  if (currentProgress < 75) {
    return '🔍 The picture is becoming clearer...';
  }
  return '🔐 Almost there! The secret will soon be revealed!';
}

export function trackCollectionAnalytics(userId: string, action: 'VIEW' | 'ITEM_ACQUIRED' | 'COMPLETED' | 'BONUS_CLAIMED', setId: string, metadata?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    category: 'collections',
    message: `Collection ${action}`,
    data: { userId, setId, ...metadata },
  });
}