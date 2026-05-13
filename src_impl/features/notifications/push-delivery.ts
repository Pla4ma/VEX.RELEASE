/**
 * Push Notification Delivery Service
 *
 * Handles real push notification delivery using expo-notifications.
 */

import * as Notifications from 'expo-notifications';
import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('notifications:push');

// Notification priority levels
// Push notification payload
// Scheduled notification
const PushNotificationPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  badge: z.number().optional(),
  sound: z.union([z.string(), z.boolean()]).optional(),
  vibrate: z.boolean().optional(),
});
// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export * from "./push-delivery.types";
export * from "./push-delivery.part1";
