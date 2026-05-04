/**
 * Calendar Sync Service
 *
 * Unified interface over Google and Apple calendar adapters.
 * Phase 2: Critical Integration - Calendar
 */

import { Platform } from 'react-native';
import { createDebugger } from '../../utils/debug';
import { GoogleCalendarAdapter, type GoogleCalendarConfig } from './GoogleCalendarAdapter';
import { AppleCalendarAdapter } from './AppleCalendarAdapter';
import { SmartScheduler } from './SmartScheduler';
import type { CalendarEvent, FreeBusyInfo, StudyScheduleSuggestion } from './types';

const debug = createDebugger('calendar:sync');

type CalendarProvider = 'GOOGLE' | 'APPLE';

interface CalendarConfig {
  google?: GoogleCalendarConfig;
  apple?: boolean; // Just needs permission
}

export class CalendarSyncService {
  private googleAdapter?: GoogleCalendarAdapter;
  private appleAdapter?: AppleCalendarAdapter;
  private scheduler: SmartScheduler;
  private connectedProviders: Set<CalendarProvider> = new Set();

  constructor() {
    this.scheduler = new SmartScheduler();
  }

  /**
   * Initialize calendar connections
   */
  async initialize(config: CalendarConfig): Promise<boolean> {
    let anyConnected = false;

    // Initialize Google Calendar
    if (config.google) {
      try {
        this.googleAdapter = new GoogleCalendarAdapter(config.google);
        // Test connection by fetching today's events
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        await this.googleAdapter.fetchEvents(today, tomorrow);
        this.connectedProviders.add('GOOGLE');
        anyConnected = true;
        debug.info('Google Calendar connected');
      } catch (error) {
        debug.error('Failed to connect Google Calendar:', error);
      }
    }

    // Initialize Apple Calendar (iOS only)
    if (config.apple && Platform.OS === 'ios') {
      try {
        this.appleAdapter = new AppleCalendarAdapter();
        const initialized = await this.appleAdapter.initialize();
        if (initialized) {
          this.connectedProviders.add('APPLE');
          anyConnected = true;
          debug.info('Apple Calendar connected');
        }
      } catch (error) {
        debug.error('Failed to connect Apple Calendar:', error);
      }
    }

    return anyConnected;
  }

  /**
   * Check if any calendar is connected
   */
  isConnected(): boolean {
    return this.connectedProviders.size > 0;
  }

  /**
   * Get connected providers
   */
  getConnectedProviders(): CalendarProvider[] {
    return Array.from(this.connectedProviders);
  }

  /**
   * Fetch events from all connected calendars
   */
  async fetchAllEvents(
    timeMin: Date,
    timeMax: Date
  ): Promise<{ provider: CalendarProvider; events: CalendarEvent[] }[]> {
    const results: { provider: CalendarProvider; events: CalendarEvent[] }[] = [];

    if (this.googleAdapter && this.connectedProviders.has('GOOGLE')) {
      try {
        const events = await this.googleAdapter.fetchEvents(timeMin, timeMax);
        results.push({ provider: 'GOOGLE', events });
      } catch (error) {
        debug.error('Failed to fetch Google events:', error);
      }
    }

    if (this.appleAdapter && this.connectedProviders.has('APPLE')) {
      try {
        const events = await this.appleAdapter.fetchEvents(timeMin, timeMax);
        results.push({ provider: 'APPLE', events });
      } catch (error) {
        debug.error('Failed to fetch Apple events:', error);
      }
    }

    return results;
  }

  /**
   * Get combined free/busy from all calendars
   */
  async getCombinedFreeBusy(
    timeMin: Date,
    timeMax: Date
  ): Promise<FreeBusyInfo> {
    const allBusy: Array<{ start: Date; end: Date }> = [];

    // Collect busy slots from all providers
    if (this.googleAdapter && this.connectedProviders.has('GOOGLE')) {
      try {
        const freeBusy = await this.googleAdapter.getFreeBusy(timeMin, timeMax);
        allBusy.push(...freeBusy.busySlots);
      } catch (error) {
        debug.error('Failed to get Google free/busy:', error);
      }
    }

    if (this.appleAdapter && this.connectedProviders.has('APPLE')) {
      try {
        const freeBusy = await this.appleAdapter.getFreeBusy(timeMin, timeMax);
        allBusy.push(...freeBusy.busySlots);
      } catch (error) {
        debug.error('Failed to get Apple free/busy:', error);
      }
    }

    // Merge overlapping busy slots
    const merged = this.mergeBusySlots(allBusy);

    // Calculate free slots
    const freeSlots = this.calculateFreeSlots(merged, timeMin, timeMax);

    return { busySlots: merged, freeSlots };
  }

  /**
   * Create focus event in primary calendar
   */
  async createFocusEvent(
    startTime: Date,
    duration: number,
    title: string = 'Focus Time'
  ): Promise<CalendarEvent | null> {
    // Prefer Google Calendar if available, otherwise Apple
    if (this.googleAdapter && this.connectedProviders.has('GOOGLE')) {
      try {
        return await this.googleAdapter.createFocusEvent(startTime, duration, title);
      } catch (error) {
        debug.error('Failed to create Google event:', error);
      }
    }

    if (this.appleAdapter && this.connectedProviders.has('APPLE')) {
      try {
        return await this.appleAdapter.createFocusEvent(startTime, duration, title);
      } catch (error) {
        debug.error('Failed to create Apple event:', error);
      }
    }

    return null;
  }

  /**
   * Find best focus time gaps
   */
  async findFocusTimeGaps(
    daysAhead: number = 3,
    minDuration: number = 25
  ): Promise<Array<{ start: Date; end: Date; duration: number; quality: string; reason: string }>> {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const freeBusy = await this.getCombinedFreeBusy(now, future);
    return this.scheduler.findBestGaps(freeBusy, minDuration);
  }

  /**
   * Generate study schedule suggestions
   */
  async suggestStudySchedule(
    totalMinutesNeeded: number,
    deadline?: Date,
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<StudyScheduleSuggestion> {
    const now = new Date();
    const daysUntilDeadline = deadline
      ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 7;

    const future = new Date(now.getTime() + Math.max(daysUntilDeadline, 7) * 24 * 60 * 60 * 1000);

    const freeBusy = await this.getCombinedFreeBusy(now, future);
    return this.scheduler.generateStudySchedule(freeBusy, totalMinutesNeeded, deadline, userLevel);
  }

  /**
   * Analyze upcoming deadlines
   */
  async analyzeUpcomingDeadlines(
    daysAhead: number = 14
  ): Promise<Array<{ title: string; deadline: Date; suggestedStudyTimes: number; urgency: 'HIGH' | 'MEDIUM' | 'LOW' }>> {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const allEvents: Array<{ title: string; startTime: Date; description?: string }> = [];

    const results = await this.fetchAllEvents(now, future);
    for (const { events } of results) {
      allEvents.push(...events.map(e => ({
        title: e.title,
        startTime: e.startTime,
        description: e.description,
      })));
    }

    return this.scheduler.analyzeDeadlines(allEvents);
  }

  /**
   * Smart session suggestion with one-tap action
   */
  async getSmartSessionSuggestion(): Promise<{
    suggested: boolean;
    startTime?: Date;
    duration?: number;
    reason?: string;
    action: 'START_NOW' | 'SCHEDULE' | 'NO_SUITABLE_TIME';
  }> {
    const gaps = await this.findFocusTimeGaps(1, 25); // Today only, min 25 min

    if (gaps.length === 0) {
      return { suggested: false, action: 'NO_SUITABLE_TIME' };
    }

    const bestGap = gaps[0];
    const now = new Date();
    const gapStart = new Date(bestGap.startTime);

    // If gap starts within 30 minutes, suggest starting now
    const minutesUntil = Math.floor((gapStart.getTime() - now.getTime()) / 60000);

    if (minutesUntil <= 30 && minutesUntil >= -5) {
      return {
        suggested: true,
        startTime: gapStart,
        duration: Math.min(bestGap.duration, 60),
        reason: bestGap.reason,
        action: 'START_NOW',
      };
    }

    // Otherwise suggest scheduling
    return {
      suggested: true,
      startTime: gapStart,
      duration: Math.min(bestGap.duration, 60),
      reason: bestGap.reason,
      action: 'SCHEDULE',
    };
  }

  /**
   * Merge overlapping busy slots
   */
  private mergeBusySlots(
    slots: Array<{ start: Date; end: Date }>
  ): Array<{ start: Date; end: Date }> {
    if (slots.length === 0) return [];

    // Sort by start time
    slots.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: Array<{ start: Date; end: Date }> = [slots[0]];

    for (let i = 1; i < slots.length; i++) {
      const last = merged[merged.length - 1];
      const current = slots[i];

      if (current.start <= last.end) {
        // Overlapping, extend
        last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Calculate free slots from merged busy slots
   */
  private calculateFreeSlots(
    busySlots: Array<{ start: Date; end: Date }>,
    timeMin: Date,
    timeMax: Date
  ): Array<{ start: Date; end: Date; duration: number }> {
    const free: Array<{ start: Date; end: Date; duration: number }> = [];
    let currentTime = new Date(timeMin);

    for (const busy of busySlots) {
      if (currentTime < busy.start) {
        free.push({
          start: new Date(currentTime),
          end: new Date(busy.start),
          duration: Math.floor((busy.start.getTime() - currentTime.getTime()) / 60000),
        });
      }
      currentTime = new Date(Math.max(currentTime.getTime(), busy.end.getTime()));
    }

    if (currentTime < timeMax) {
      free.push({
        start: new Date(currentTime),
        end: new Date(timeMax),
        duration: Math.floor((timeMax.getTime() - currentTime.getTime()) / 60000),
      });
    }

    return free.filter(slot => slot.duration >= 15);
  }
}
