import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * LiveOps Service
 *
 * Scheduled events for retention: DOUBLE_XP, BONUS_COINS_DAY, BOSS_RUSH, SQUAD_WAR_WEEK
 * Events fetched from Supabase and displayed in weekly calendar.
 *
 * @phase 5A.2
 */

import { supabase } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('liveops:service');

export type LiveOpsEventType =
  | 'DOUBLE_XP'
  | 'BONUS_COINS_DAY'
  | 'BOSS_RUSH'
  | 'SQUAD_WAR_WEEK';

export interface LiveOpsEvent {
  id: string;
  type: LiveOpsEventType;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  timezone: string;
  bonuses: {
    xpMultiplier?: number;
    coinMultiplier?: number;
    chestDropRateMultiplier?: number;
  };
  isActive: boolean;
}

const EVENT_ICONS: Record<LiveOpsEventType, string> = {
  DOUBLE_XP: '🔥',
  BONUS_COINS_DAY: '🪙',
  BOSS_RUSH: '👹',
  SQUAD_WAR_WEEK: '⚔️',
};

const EVENT_COLORS: Record<LiveOpsEventType, string> = {
  DOUBLE_XP: '#F59E0B',
  BONUS_COINS_DAY: '#22C55E',
  BOSS_RUSH: '#EF4444',
  SQUAD_WAR_WEEK: '#A855F7',
};

/**
 * Get event icon
 */
export function getEventIcon(type: LiveOpsEventType): string {
  return EVENT_ICONS[type];
}

/**
 * Get event color
 */
export function getEventColor(type: LiveOpsEventType): string {
  return EVENT_COLORS[type];
}

/**
 * Format event time range
 */
export function formatEventTime(start: number, end: number): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Same day
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${formatTime(startDate)} – ${formatTime(endDate)}`;
  }

  // Multi-day
  return `${formatDate(startDate)} ${formatTime(startDate)} – ${formatDate(endDate)} ${formatTime(endDate)}`;
}

/**
 * Check if event is currently active
 */
export function isEventActive(event: LiveOpsEvent): boolean {
  const now = Date.now();
  return event.isActive && now >= event.startTime && now <= event.endTime;
}

/**
 * Check if event is upcoming (within next 24 hours)
 */
export function isEventUpcoming(event: LiveOpsEvent): boolean {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return event.startTime > now && event.startTime <= now + oneDay;
}

/**
 * Fetch active and upcoming events
 */
export async function fetchLiveOpsEvents(): Promise<LiveOpsEvent[]> {
  try {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    const { data, error } = await supabase
      .from('liveops_events')
      .select('*')
      .gte('end_time', now)
      .lte('start_time', now + oneWeek)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (error || !data) {
      debug.error('Failed to fetch LiveOps events', error instanceof Error ? error : new Error(String(error)));
      return [];
    }

    return data.map((row: {
      id: string;
      type: LiveOpsEventType;
      name: string;
      description: string;
      start_time: string | number;
      end_time: string | number;
      timezone?: string | null;
      bonuses?: LiveOpsEvent['bonuses'] | null;
      is_active: boolean;
    }) => ({
      id: row.id,
      type: row.type as LiveOpsEventType,
      name: row.name,
      description: row.description,
      startTime: new Date(row.start_time).getTime(),
      endTime: new Date(row.end_time).getTime(),
      timezone: row.timezone || 'UTC',
      bonuses: row.bonuses || {},
      isActive: row.is_active,
    }));
  } catch (error) { captureSilentFailure(error, { feature: 'liveops', operation: 'network-fallback', type: 'network' });
    return [];
  }
}

/**
 * Get home screen preview message for tomorrow's events
 */
export function getTomorrowPreviewMessage(events: LiveOpsEvent[]): string | null {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const tomorrowEvents = events.filter(
    (e) => e.startTime >= tomorrow.getTime() && e.startTime <= tomorrowEnd.getTime()
  );

  if (tomorrowEvents.length === 0) {return null;}

  const firstEvent = tomorrowEvents[0];
  const icon = getEventIcon(firstEvent.type);

  if (tomorrowEvents.length === 1) {
    const time = new Date(firstEvent.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${icon} Tomorrow: ${firstEvent.name} at ${time}`;
  }

  return `${icon} Tomorrow: ${firstEvent.name} + ${tomorrowEvents.length - 1} more events`;
}

/**
 * Get current XP multiplier from active events
 */
export function getCurrentXpMultiplier(events: LiveOpsEvent[]): number {
  const activeEvents = events.filter(isEventActive);
  let multiplier = 1;

  for (const event of activeEvents) {
    if (event.bonuses.xpMultiplier) {
      multiplier = Math.max(multiplier, event.bonuses.xpMultiplier);
    }
  }

  return multiplier;
}

/**
 * Get current coin multiplier from active events
 */
export function getCurrentCoinMultiplier(events: LiveOpsEvent[]): number {
  const activeEvents = events.filter(isEventActive);
  let multiplier = 1;

  for (const event of activeEvents) {
    if (event.bonuses.coinMultiplier) {
      multiplier = Math.max(multiplier, event.bonuses.coinMultiplier);
    }
  }

  return multiplier;
}

/**
 * Subscribe to LiveOps event updates
 */
export function subscribeToLiveOpsUpdates(
  onUpdate: (events: LiveOpsEvent[]) => void
) {
  const subscription = supabase
    .channel('liveops-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'liveops_events',
      },
      async () => {
        // Refetch events when any change occurs
        const events = await fetchLiveOpsEvents();
        onUpdate(events);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
