import { z } from 'zod';
import { eventBus } from '../../events';
import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import * as repository from './repository';

const UserIdSchema = z.string().min(1);
const UnreadNotificationsCountSchema = z.number().int().nonnegative();
// ============================================================================
// Notification Intelligence Engine (Phase 5B)
// ============================================================================
// Maximum notifications per day (respect user's attention)
const MAX_NOTIFICATIONS_PER_DAY = 2;
const notificationLimitStorage = new MMKVStorageAdapter('notification-limits');

// Quiet hours (default 10 PM - 8 AM)
const DEFAULT_QUIET_START_HOUR = 22;
const DEFAULT_QUIET_END_HOUR = 8;
export * from "./service.types";
export * from "./service.part1";
export * from "./service.part2";
