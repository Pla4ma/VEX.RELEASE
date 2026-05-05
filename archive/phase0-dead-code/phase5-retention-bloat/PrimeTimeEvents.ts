/**
 * Prime Time Events
 *
 * Phase 5A: Retention - Scheduled bonus windows for engagement
 *
 * Creates recurring daily/weekly events with enhanced rewards to drive
 * consistent engagement patterns. Features include:
 *
 * - Morning Rally (7-9 AM): Focus start bonuses
 * - Power Hour (12-1 PM): Double rewards
 * - Evening Wind Down (7-9 PM): Streak protection
 * - Weekend Warriors (Sat-Sun): Special challenges
 * - Focus Sprints (Every 4 hours): Quick 15-min challenges
 *
 * Dependencies:
 * - feature-flags (gradual rollout)
 * - events (eventBus for event notifications)
 * - notifications (event alerts and reminders)
 * - economy (bonus rewards)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';

// ============================================================================
// Prime Time Event Constants
// ============================================================================

export const PRIME_TIME_CONFIG = {
  // Daily events
  MORNING_RALLY: {
    name: 'Morning Rally',
    description: 'Start your day with focus bonuses',
    startTime: { hour: 7, minute: 0 }, // 7:00 AM
    endTime: { hour: 9, minute: 0 }, // 9:00 AM
    timezone: 'local', // User's local time
    bonuses: {
      focusPointsMultiplier: 1.5,
      coinsMultiplier: 1.25,
      purityBonus: 10,
      energyBonus: 25,
    },
    requirements: {
      minSessionDuration: 15, // minutes
      maxSessions: 3, // per event
    },
    rewards: {
      participation: { focusPoints: 25, coins: 50 },
      completion: { focusPoints: 50, coins: 100, gems: 5 },
    },
  },

  POWER_HOUR: {
    name: 'Power Hour',
    description: 'Double rewards for peak performance',
    startTime: { hour: 12, minute: 0 }, // 12:00 PM
    endTime: { hour: 13, minute: 0 }, // 1:00 PM
    timezone: 'local',
    bonuses: {
      focusPointsMultiplier: 2.0,
      coinsMultiplier: 2.0,
      xpMultiplier: 1.5,
      streakBonus: 2,
    },
    requirements: {
      minSessionDuration: 20,
      maxSessions: 2,
    },
    rewards: {
      participation: { focusPoints: 50, coins: 100 },
      completion: { focusPoints: 100, coins: 200, gems: 10 },
    },
  },

  EVENING_WIND_DOWN: {
    name: 'Evening Wind Down',
    description: 'Complete your day with streak protection',
    startTime: { hour: 19, minute: 0 }, // 7:00 PM
    endTime: { hour: 21, minute: 0 }, // 9:00 PM
    timezone: 'local',
    bonuses: {
      streakProtection: true,
      focusPointsMultiplier: 1.25,
      relaxationBonus: 15,
    },
    requirements: {
      minSessionDuration: 10,
      maxSessions: 2,
    },
    rewards: {
      participation: { focusPoints: 30, coins: 75 },
      completion: { focusPoints: 60, coins: 150, gems: 8 },
    },
  },

  // Recurring events
  FOCUS_SPRINT: {
    name: 'Focus Sprint',
    description: 'Quick 15-minute focus challenge',
    interval: 4 * 60 * 60 * 1000, // Every 4 hours
    duration: 15 * 60 * 1000, // 15 minutes
    bonuses: {
      focusPointsMultiplier: 1.75,
      speedBonus: 20,
    },
    requirements: {
      exactDuration: 15, // Must be exactly 15 minutes
      purityThreshold: 80,
    },
    rewards: {
      completion: { focusPoints: 40, coins: 80, gems: 3 },
    },
  },

  // Weekly events
  WEEKEND_WARRIORS: {
    name: 'Weekend Warriors',
    description: 'Weekend-long focus challenges',
    days: ['saturday', 'sunday'],
    startTime: { hour: 0, minute: 0 }, // Midnight
    endTime: { hour: 23, minute: 59 }, // End of day
    bonuses: {
      focusPointsMultiplier: 1.5,
      coinsMultiplier: 1.5,
      squadBonusMultiplier: 1.25,
    },
    requirements: {
      minDailyFocusTime: 60, // minutes
      squadParticipation: true,
    },
    rewards: {
      dailyCompletion: { focusPoints: 100, coins: 200, gems: 15 },
      weekendCompletion: { focusPoints: 500, coins: 1000, gems: 50 },
    },
  },
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const PrimeTimeEventTypeSchema = z.enum([
  'MORNING_RALLY',
  'POWER_HOUR',
  'EVENING_WIND_DOWN',
  'FOCUS_SPRINT',
  'WEEKEND_WARRIORS',
]);

export const PrimeTimeEventSchema = z.object({
  id: z.string(),
  type: PrimeTimeEventTypeSchema,
  name: z.string(),
  description: z.string(),
  
  // Schedule
  startTime: z.number(),
  endTime: z.number(),
  timezone: z.string(),
  isRecurring: z.boolean(),
  
  // Status
  status: z.enum(['upcoming', 'active', 'completed', 'expired']).default('upcoming'),
  
  // Participation
  participants: z.array(z.string()).default([]),
  maxParticipants: z.number().nullable().default(null),
  
  // Progress tracking
  progress: z.record(z.number()).default({}), // userId -> progress
  completions: z.array(z.string()).default([]), // userId list
  
  // Results
  results: z.array(z.object({
    userId: z.string(),
    participated: z.boolean(),
    completed: z.boolean(),
    score: z.number(),
    rewards: z.record(z.number()),
    completedAt: z.number(),
  })).default([]),
  
  // Configuration
  config: z.record(z.unknown()).default({}),
  
  // Metadata
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const EventParticipationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  
  // Participation details
  joinedAt: z.number(),
  sessionsCompleted: z.number().default(0),
  totalFocusTime: z.number().default(0), // minutes
  averagePurity: z.number().default(0),
  
  // Status
  status: z.enum(['active', 'completed', 'dropped_out']).default('active'),
  completedAt: z.number().nullable().default(null),
  
  // Rewards earned
  rewardsEarned: z.record(z.number()).default({}),
  
  // Performance
  score: z.number().default(0),
  rank: z.number().nullable().default(null),
  
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type PrimeTimeEventType = z.infer<typeof PrimeTimeEventTypeSchema>;
export type PrimeTimeEvent = z.infer<typeof PrimeTimeEventSchema>;
export type EventParticipation = z.infer<typeof EventParticipationSchema>;

export interface EventSchedule {
  type: PrimeTimeEventType;
  nextStartTime: number;
  nextEndTime: number;
  isActive: boolean;
  participants: number;
  estimatedRewards: Record<string, number>;
}

export interface EventReminder {
  eventId: string;
  userId: string;
  reminderType: 'starting_soon' | 'ending_soon' | 'results_available';
  scheduledAt: number;
  message: string;
}

// ============================================================================
// Prime Time Events Service
// ============================================================================

export class PrimeTimeEventsService {
  private events: Map<string, PrimeTimeEvent> = new Map();
  private participations: Map<string, EventParticipation> = new Map(); // eventId_userId
  private schedules: Map<PrimeTimeEventType, EventSchedule> = new Map();
  private reminders: Map<string, EventReminder> = new Map();

  /**
   * Check if prime time events are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('prime_time_events');
  }

  /**
   * Initialize the service and schedule events
   */
  async initialize(): Promise<void> {
    if (!PrimeTimeEventsService.isEnabled()) {
      return;
    }

    // Calculate initial schedules
    await this.updateAllSchedules();
    
    // Schedule recurring events
    this.scheduleRecurringEvents();
    
    // Set up event loop
    this.startEventLoop();
  }

  /**
   * Get upcoming events for a user
   */
  getUpcomingEvents(userId: string, hours = 24): Array<{
    event: PrimeTimeEvent;
    timeUntilStart: number; // minutes
    estimatedRewards: Record<string, number>;
  }> {
    const now = Date.now();
    const upcomingEvents: Array<{
      event: PrimeTimeEvent;
      timeUntilStart: number;
      estimatedRewards: Record<string, number>;
    }> = [];

    for (const [eventType, schedule] of this.schedules.entries()) {
      if (schedule.nextStartTime > now && schedule.nextStartTime <= now + (hours * 60 * 60 * 1000)) {
        const event = this.createEventFromSchedule(eventType, schedule);
        const timeUntilStart = Math.floor((schedule.nextStartTime - now) / (1000 * 60));
        
        upcomingEvents.push({
          event,
          timeUntilStart,
          estimatedRewards: schedule.estimatedRewards,
        });
      }
    }

    return upcomingEvents.sort((a, b) => a.timeUntilStart - b.timeUntilStart);
  }

  /**
   * Get active events
   */
  getActiveEvents(): PrimeTimeEvent[] {
    const now = Date.now();
    return Array.from(this.events.values())
      .filter(event => event.status === 'active')
      .filter(event => event.startTime <= now && event.endTime >= now);
  }

  /**
   * Join an event
   */
  async joinEvent(eventId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const event = this.events.get(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const now = Date.now();

    // Check if event is active
    if (event.status !== 'active' || now < event.startTime || now > event.endTime) {
      return { success: false, error: 'Event is not currently active' };
    }

    // Check if already participating
    const participationKey = `${eventId}_${userId}`;
    if (this.participations.has(participationKey)) {
      return { success: false, error: 'Already participating in this event' };
    }

    // Check capacity limits
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return { success: false, error: 'Event is full' };
    }

    // Create participation
    const participation: EventParticipation = {
      id: `part_${eventId}_${userId}_${now}`,
      eventId,
      userId,
      joinedAt: now,
      sessionsCompleted: 0,
      totalFocusTime: 0,
      averagePurity: 0,
      status: 'active',
      completedAt: null,
      rewardsEarned: {},
      score: 0,
      rank: null,
      createdAt: now,
      updatedAt: now,
    };

    // Update event
    event.participants.push(userId);
    this.events.set(eventId, event);

    // Store participation
    this.participations.set(participationKey, participation);

    // Emit event
    eventBus.publish('prime_time:joined', {
      eventId,
      userId,
      eventType: event.type,
      eventName: event.name,
    });

    // Schedule reminders
    await this.scheduleEventReminders(eventId, userId);

    return { success: true };
  }

  /**
   * Update user progress in an event
   */
  async updateProgress(input: {
    eventId: string;
    userId: string;
    sessionDuration: number; // minutes
    purity: number;
  }): Promise<void> {
    const participationKey = `${input.eventId}_${input.userId}`;
    const participation = this.participations.get(participationKey);
    
    if (!participation || participation.status !== 'active') {
      return;
    }

    const event = this.events.get(input.eventId);
    if (!event || event.status !== 'active') {
      return;
    }

    // Update participation
    participation.sessionsCompleted += 1;
    participation.totalFocusTime += input.sessionDuration;
    participation.averagePurity = ((participation.averagePurity * (participation.sessionsCompleted - 1)) + input.purity) / participation.sessionsCompleted;
    
    // Calculate score based on event type
    participation.score = this.calculateEventScore(event.type, participation);
    participation.updatedAt = Date.now();

    this.participations.set(participationKey, participation);

    // Check for completion
    const config = PRIME_TIME_CONFIG[event.type];
    if (config.requirements.minSessionDuration && participation.totalFocusTime >= config.requirements.minSessionDuration) {
      if (!event.completions.includes(input.userId)) {
        event.completions.push(input.userId);
        this.events.set(input.eventId, event);

        // Award completion rewards
        await this.awardCompletionRewards(event, participation);
      }
    }

    // Emit progress update
    eventBus.publish('prime_time:progress_updated', {
      eventId: input.eventId,
      userId: input.userId,
      score: participation.score,
      sessionsCompleted: participation.sessionsCompleted,
      totalFocusTime: participation.totalFocusTime,
    });
  }

  /**
   * Get user's event history
   */
  getUserEventHistory(userId: string, limit = 50): Array<{
    event: PrimeTimeEvent;
    participation: EventParticipation;
  }> {
    const history: Array<{
      event: PrimeTimeEvent;
      participation: EventParticipation;
    }> = [];

    this.participations.forEach((participation, key) => {
      if (participation.userId === userId) {
        const event = this.events.get(participation.eventId);
        if (event) {
          history.push({ event, participation });
        }
      }
    });

    return history
      .sort((a, b) => b.participation.createdAt - a.participation.createdAt)
      .slice(0, limit);
  }

  /**
   * Get current event schedules
   */
  getEventSchedules(): Record<PrimeTimeEventType, EventSchedule> {
    const schedules: Record<PrimeTimeEventType, EventSchedule> = {} as any;
    
    for (const [type, schedule] of this.schedules.entries()) {
      schedules[type] = { ...schedule };
    }

    return schedules;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Update all event schedules
   */
  private async updateAllSchedules(): Promise<void> {
    const now = Date.now();

    // Update daily events
    for (const eventType of ['MORNING_RALLY', 'POWER_HOUR', 'EVENING_WIND_DOWN'] as const) {
      const config = PRIME_TIME_CONFIG[eventType];
      const schedule = this.calculateNextDailyEvent(eventType, config, now);
      this.schedules.set(eventType, schedule);
    }

    // Update focus sprints
    const sprintSchedule = this.calculateNextSprintEvent(now);
    this.schedules.set('FOCUS_SPRINT', sprintSchedule);

    // Update weekend warriors
    const weekendSchedule = this.calculateNextWeekendEvent(now);
    this.schedules.set('WEEKEND_WARRIORS', weekendSchedule);
  }

  /**
   * Calculate next daily event
   */
  private calculateNextDailyEvent(
    eventType: 'MORNING_RALLY' | 'POWER_HOUR' | 'EVENING_WIND_DOWN',
    config: any,
    now: number
  ): EventSchedule {
    const today = new Date(now);
    const eventTime = new Date(today);
    eventTime.setHours(config.startTime.hour, config.startTime.minute, 0, 0);

    // If event time has passed today, schedule for tomorrow
    if (eventTime.getTime() <= now) {
      eventTime.setDate(eventTime.getDate() + 1);
    }

    const endTime = new Date(eventTime);
    endTime.setHours(config.endTime.hour, config.endTime.minute, 0, 0);

    return {
      type: eventType,
      nextStartTime: eventTime.getTime(),
      nextEndTime: endTime.getTime(),
      isActive: now >= eventTime.getTime() && now <= endTime.getTime(),
      participants: 0,
      estimatedRewards: this.calculateEstimatedRewards(eventType),
    };
  }

  /**
   * Calculate next focus sprint
   */
  private calculateNextSprintEvent(now: number): EventSchedule {
    const config = PRIME_TIME_CONFIG.FOCUS_SPRINT;
    const sprintInterval = config.interval;
    
    // Find the next sprint time
    let nextStartTime = Math.ceil(now / sprintInterval) * sprintInterval;
    
    // If it's too close to now, add one interval
    if (nextStartTime - now < 5 * 60 * 1000) { // Less than 5 minutes
      nextStartTime += sprintInterval;
    }

    return {
      type: 'FOCUS_SPRINT',
      nextStartTime,
      nextEndTime: nextStartTime + config.duration,
      isActive: now >= nextStartTime && now <= nextStartTime + config.duration,
      participants: 0,
      estimatedRewards: this.calculateEstimatedRewards('FOCUS_SPRINT'),
    };
  }

  /**
   * Calculate next weekend event
   */
  private calculateNextWeekendEvent(now: number): EventSchedule {
    const config = PRIME_TIME_CONFIG.WEEKEND_WARRIORS;
    const today = new Date(now);
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    let nextSaturday = new Date(today);
    let daysUntilSaturday = (6 - currentDay + 7) % 7;
    if (daysUntilSaturday === 0 && today.getHours() > 0) {
      daysUntilSaturday = 7; // Next Saturday if today is Saturday and past midnight
    }
    nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);

    // Set start time to midnight
    nextSaturday.setHours(0, 0, 0, 0);

    const endTime = new Date(nextSaturday);
    endTime.setDate(endTime.getDate() + 2); // Sunday end
    endTime.setHours(23, 59, 59, 999);

    return {
      type: 'WEEKEND_WARRIORS',
      nextStartTime: nextSaturday.getTime(),
      nextEndTime: endTime.getTime(),
      isActive: now >= nextSaturday.getTime() && now <= endTime.getTime(),
      participants: 0,
      estimatedRewards: this.calculateEstimatedRewards('WEEKEND_WARRIORS'),
    };
  }

  /**
   * Calculate estimated rewards for an event type
   */
  private calculateEstimatedRewards(eventType: PrimeTimeEventType): Record<string, number> {
    const config = PRIME_TIME_CONFIG[eventType];
    return config.rewards.completion || config.rewards.dailyCompletion || {};
  }

  /**
   * Create event from schedule
   */
  private createEventFromSchedule(eventType: PrimeTimeEventType, schedule: EventSchedule): PrimeTimeEvent {
    const config = PRIME_TIME_CONFIG[eventType];
    
    return {
      id: `event_${eventType}_${schedule.nextStartTime}`,
      type: eventType,
      name: config.name,
      description: config.description,
      startTime: schedule.nextStartTime,
      endTime: schedule.nextEndTime,
      timezone: config.timezone || 'local',
      isRecurring: true,
      status: 'upcoming',
      participants: [],
      maxParticipants: null,
      progress: {},
      completions: [],
      results: [],
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Schedule recurring events
   */
  private scheduleRecurringEvents(): void {
    // This would set up timers to create events when they start
    // For now, we'll handle this in the event loop
  }

  /**
   * Start event monitoring loop
   */
  private startEventLoop(): void {
    // Check every minute for event changes
    setInterval(() => {
      this.checkEventStatuses();
    }, 60 * 1000);
  }

  /**
   * Check and update event statuses
   */
  private checkEventStatuses(): void {
    const now = Date.now();

    // Update schedules
    this.updateAllSchedules();

    // Check for events that should start
    for (const [eventType, schedule] of this.schedules.entries()) {
      if (schedule.isActive && !this.events.has(`${eventType}_${schedule.nextStartTime}`)) {
        this.activateEvent(eventType, schedule);
      }
    }

    // Check for events that should end
    for (const [eventId, event] of this.events.entries()) {
      if (event.status === 'active' && now > event.endTime) {
        this.completeEvent(eventId);
      }
    }

    // Process reminders
    this.processReminders();
  }

  /**
   * Activate an event
   */
  private activateEvent(eventType: PrimeTimeEventType, schedule: EventSchedule): void {
    const event = this.createEventFromSchedule(eventType, schedule);
    event.status = 'active';
    
    this.events.set(event.id, event);

    // Emit activation event
    eventBus.publish('prime_time:event_started', {
      eventId: event.id,
      eventType,
      eventName: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
    });

    // Notify users
    this.notifyEventStarted(event);
  }

  /**
   * Complete an event
   */
  private completeEvent(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) return;

    event.status = 'completed';
    event.updatedAt = Date.now();

    // Calculate final results
    this.calculateEventResults(event);

    // Emit completion event
    eventBus.publish('prime_time:event_completed', {
      eventId,
      eventType: event.type,
      eventName: event.name,
      participantCount: event.participants.length,
      completionCount: event.completions.length,
    });

    // Notify participants
    this.notifyEventCompleted(event);
  }

  /**
   * Calculate event results and rankings
   */
  private calculateEventResults(event: PrimeTimeEvent): void {
    const participations: EventParticipation[] = [];
    
    event.participants.forEach(userId => {
      const participationKey = `${eventId}_${userId}`;
      const participation = this.participations.get(participationKey);
      if (participation) {
        participations.push(participation);
      }
    });

    // Sort by score and assign ranks
    participations.sort((a, b) => b.score - a.score);
    participations.forEach((participation, index) => {
      participation.rank = index + 1;
      this.participations.set(`${eventId}_${participation.userId}`, participation);
    });

    // Create results
    event.results = participations.map(participation => ({
      userId: participation.userId,
      participated: true,
      completed: event.completions.includes(participation.userId),
      score: participation.score,
      rewards: participation.rewardsEarned,
      completedAt: participation.completedAt || Date.now(),
    }));
  }

  /**
   * Calculate event score based on type
   */
  private calculateEventScore(eventType: PrimeTimeEventType, participation: EventParticipation): number {
    const config = PRIME_TIME_CONFIG[eventType];
    let score = 0;

    // Base score from focus time
    score += participation.totalFocusTime * 10;

    // Purity bonus
    score += participation.averagePurity * participation.sessionsCompleted * 5;

    // Type-specific scoring
    switch (eventType) {
      case 'FOCUS_SPRINT':
        // Exact duration bonus
        if (Math.abs(participation.totalFocusTime - 15) < 2) {
          score += 100;
        }
        break;
      case 'POWER_HOUR':
        // Efficiency bonus
        if (participation.averagePurity >= 90) {
          score += 150;
        }
        break;
      case 'WEEKEND_WARRIORS':
        // Consistency bonus
        if (participation.sessionsCompleted >= 3) {
          score += 200;
        }
        break;
    }

    return Math.round(score);
  }

  /**
   * Award completion rewards
   */
  private async awardCompletionRewards(event: PrimeTimeEvent, participation: EventParticipation): Promise<void> {
    const config = PRIME_TIME_CONFIG[event.type];
    const rewards = config.rewards.completion || {};

    // Update participation rewards
    participation.rewardsEarned = { ...participation.rewardsEarned, ...rewards };
    participation.completedAt = Date.now();
    participation.status = 'completed';

    this.participations.set(`${event.id}_${participation.userId}`, participation);

    // Emit reward event
    eventBus.publish('prime_time:rewards_awarded', {
      eventId: event.id,
      userId: participation.userId,
      rewards,
      eventType: event.type,
    });
  }

  /**
   * Schedule event reminders for a user
   */
  private async scheduleEventReminders(eventId: string, userId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) return;

    // Schedule "starting soon" reminder (5 minutes before)
    const startingSoonReminder: EventReminder = {
      eventId,
      userId,
      reminderType: 'starting_soon',
      scheduledAt: event.startTime - 5 * 60 * 1000,
      message: `${event.name} starts in 5 minutes!`,
    };

    // Schedule "ending soon" reminder (10 minutes before end)
    const endingSoonReminder: EventReminder = {
      eventId,
      userId,
      reminderType: 'ending_soon',
      scheduledAt: event.endTime - 10 * 60 * 1000,
      message: `${event.name} ends in 10 minutes!`,
    };

    this.reminders.set(`${eventId}_${userId}_starting`, startingSoonReminder);
    this.reminders.set(`${eventId}_${userId}_ending`, endingSoonReminder);
  }

  /**
   * Process pending reminders
   */
  private processReminders(): void {
    const now = Date.now();

    this.reminders.forEach((reminder, key) => {
      if (reminder.scheduledAt <= now) {
        // Send notification
        eventBus.publish('notification:send', {
          userId: reminder.userId,
          type: 'PRIME_TIME_REMINDER',
          title: 'Event Reminder',
          body: reminder.message,
          data: {
            eventId: reminder.eventId,
            reminderType: reminder.reminderType,
          },
        });

        // Remove reminder
        this.reminders.delete(key);
      }
    });
  }

  /**
   * Notify users about event starting
   */
  private notifyEventStarted(event: PrimeTimeEvent): void {
    // This would notify all eligible users about the event
    eventBus.publish('notification:broadcast', {
      type: 'PRIME_TIME_EVENT_STARTED',
      title: `${event.name} Started!`,
      body: event.description,
      data: {
        eventId: event.id,
        eventType: event.type,
        endTime: event.endTime,
      },
    });
  }

  /**
   * Notify participants about event completion
   */
  private notifyEventCompleted(event: PrimeTimeEvent): void {
    event.participants.forEach(userId => {
      const participationKey = `${event.id}_${userId}`;
      const participation = this.participations.get(participationKey);
      
      if (participation) {
        eventBus.publish('notification:send', {
          userId,
          type: 'PRIME_TIME_EVENT_COMPLETED',
          title: `${event.name} Completed!`,
          body: `You finished with rank #${participation.rank || 'N/A'}`,
          data: {
            eventId: event.id,
            rank: participation.rank,
            score: participation.score,
            rewards: participation.rewardsEarned,
          },
        });
      }
    });
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createPrimeTimeEventsService(): PrimeTimeEventsService {
  return new PrimeTimeEventsService();
}

// Singleton instance
let primeTimeEventsService: PrimeTimeEventsService | null = null;

export function getPrimeTimeEventsService(): PrimeTimeEventsService {
  if (!primeTimeEventsService) {
    primeTimeEventsService = new PrimeTimeEventsService();
  }
  return primeTimeEventsService;
}
