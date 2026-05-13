import * as Sentry from "@sentry/react-native";
import type { EquipmentSlot, AcquisitionSource } from "./schemas";


export function trackItemOperationFailed(
  userId: string,
  operation: string,
  itemId: string,
  error: string
): void {
  Sentry.captureMessage(`Item operation failed: ${operation}`, {
    level: 'error',
    tags: {
      feature: 'inventory',
      operation,
    },
    extra: {
      userId,
      itemId,
      error,
    },
  });
}