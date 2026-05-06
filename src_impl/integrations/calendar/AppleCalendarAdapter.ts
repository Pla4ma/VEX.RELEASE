/**
 * Apple Calendar Adapter
 *
 * Integration with Apple Calendar via expo-calendar.
 * Phase 2: Critical Integration - Calendar
 */

// import * as Calendar from 'expo-calendar';

// Stub implementations for missing expo-calendar module
const Calendar = {
  requestCalendarPermissionsAsync: async () => ({ status: 'denied' as const }),
  getCalendarsAsync: async (_entityType: string) => [{ id: 'default', allowsModifications: true }],
  EntityTypes: { EVENT: 'event' },
  createEventAsync: async (_calendarId: string, _eventData: DynamicValue) => 'event-id',
  updateEventAsync: async (_calendarId: string, _eventId: string, _eventData: DynamicValue) => {},
  deleteEventAsync: async (_calendarId: string, _eventId: string) => {},
  getEventsAsync: async (_calendarIds: string[], _startDate: Date, _endDate: Date) => [],
};
import { Platform } from 'react-native';
import { createDebugger } from '../../utils/debug';
import type { CalendarEvent, FreeBusyInfo } from './types';

const debug = createDebugger('calendar:apple');

export class AppleCalendarAdapter {
  private defaultCalendarId: string | null = null;

  /**
   * Initialize and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'denied') {
        debug.warn('Calendar permission not granted');
        return false;
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync('event');
      const defaultCal = calendars.find((cal: DynamicValue) => cal.allowsModifications);
      this.defaultCalendarId = defaultCal?.id || null;

      return true;
    } catch (error) {
      debug.error('Failed to initialize:', error as Error);
      return false;
    }
  }

  /**
   * Check if running on iOS/macOS
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'macos';
  }

  /**
   * Fetch events from calendar
   */
  async fetchEvents(
    timeMin: Date,
    timeMax: Date,
    calendarId?: string
  ): Promise<CalendarEvent[]> {
    if (!this.isAvailable()) {
      throw new Error('Apple Calendar only available on iOS/macOS');
    }

    try {
      const targetCalendarId = calendarId || this.defaultCalendarId;
      if (!targetCalendarId) {
        throw new Error('No calendar available');
      }

      const events = await Calendar.getEventsAsync(
        [targetCalendarId],
        timeMin,
        timeMax
      );

      return events.map((event: DynamicValue) => this.mapAppleEvent(event));
    } catch (error) {
      debug.error('Failed to fetch events:', error as Error);
      throw error;
    }
  }

  /**
   * Map Apple Calendar event to our format
   */
  private mapAppleEvent(event: DynamicValue): CalendarEvent {
    return {
      id: event.id,
      title: event.title || 'Untitled',
      description: event.notes,
      startTime: new Date(event.startDate),
      endTime: new Date(event.endDate),
      isAllDay: event.allDay,
      location: event.location,
      calendarId: event.calendarId || '',
      calendarName: 'Apple Calendar',
      color: event.color,
    };
  }

  /**
   * Create a focus time event
   */
  async createFocusEvent(
    startTime: Date,
    duration: number, // minutes
    title: string = 'Focus Time'
  ): Promise<CalendarEvent> {
    if (!this.isAvailable()) {
      throw new Error('Apple Calendar only available on iOS/macOS');
    }

    try {
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const calendarId = this.defaultCalendarId;

      if (!calendarId) {
        throw new Error('No calendar available');
      }

      const eventId = await Calendar.createEventAsync(calendarId, {
        title,
        notes: 'Focused work session via VEX',
        startDate: startTime,
        endDate: endTime,
        allDay: false,
        location: undefined,
        alarms: [{ relativeOffset: -5 }], // 5 min reminder
      });

      return {
        id: eventId,
        title,
        startTime,
        endTime,
        isAllDay: false,
        calendarId,
        calendarName: 'Apple Calendar',
      };
    } catch (error) {
      debug.error('Failed to create focus event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await Calendar.deleteEventAsync(calendarId, eventId);
      return true;
    } catch (error) {
      debug.error('Failed to delete event:', error);
      return false;
    }
  }

  /**
   * Get free/busy information
   */
  async getFreeBusy(
    timeMin: Date,
    timeMax: Date
  ): Promise<FreeBusyInfo> {
    if (!this.isAvailable()) {
      throw new Error('Apple Calendar only available on iOS/macOS');
    }

    try {
      const events = await this.fetchEvents(timeMin, timeMax);

      const busySlots = events.map(event => ({
        start: event.startTime,
        end: event.endTime,
      }));

      // Sort by start time
      busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());

      // Merge overlapping
      const merged = this.mergeBusySlots(busySlots);

      // Calculate free slots
      const freeSlots = this.calculateFreeSlots(merged, timeMin, timeMax);

      return { busySlots: merged, freeSlots };
    } catch (error) {
      debug.error('Failed to get free/busy:', error);
      throw error;
    }
  }

  /**
   * Merge overlapping busy slots
   */
  private mergeBusySlots(
    slots: Array<{ start: Date; end: Date }>
  ): Array<{ start: Date; end: Date }> {
    if (slots.length === 0) {return [];}

    const merged: Array<{ start: Date; end: Date }> = [slots[0]];

    for (let i = 1; i < slots.length; i++) {
      const last = merged[merged.length - 1];
      const current = slots[i];

      if (current.start <= last.end) {
        last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Calculate free slots from busy slots
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
