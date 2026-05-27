/**
 * AI Coach Store - Helper Functions
 *
 * Utility functions for working with coach state.
 */

import type { CoachStore } from "./types";
import type { CoachMessage } from "../schemas";

/**
 * Check if a message should be shown (not muted, not dismissed)
 */
export function shouldShowMessage(
  message: CoachMessage,
  store: CoachStore,
): boolean {
  // Check if message is already dismissed
  if (store.dismissedMessages.includes(message.id)) {
    return false;
  }

  // Check if category is muted
  if (store.mutedCategories.includes(message.category)) {
    return false;
  }

  // Check if notifications are reduced and this is low priority
  if (store.reduceNotifications && message.priority < 7) {
    return false;
  }

  return true;
}

/**
 * Get active modal type or null
 */
export function getActiveModalType(store: CoachStore): string | null {
  return store.isModalVisible ? store.modalType : null;
}
