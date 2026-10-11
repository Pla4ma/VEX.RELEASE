import type { FlashListRef } from '@shopify/flash-list';
import * as Sentry from '@sentry/react-native';
import type { ChatMessage } from './coach-chat-types';

export function scrollCoachListToEnd(
  listRef: { current: FlashListRef<ChatMessage> | null },
  animated: boolean,
): void {
  const list = listRef.current;
  if (!list || typeof list.scrollToEnd !== 'function') {
    return;
  }
  try {
    list.scrollToEnd({ animated });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'ai-coach', operation: 'scroll-chat' },
    });
  }
}
