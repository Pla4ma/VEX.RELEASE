import { Platform } from "react-native";
import { createDebugger } from "../../utils/debug";
import type { CalendarEvent, FreeBusyInfo } from "./types";
import {
  Calendar,
  mergeBusySlots,
  calculateFreeSlots,
} from "./AppleCalendarAdapter.utils";

const debug = createDebugger("calendar:apple");

export class AppleCalendarAdapter {
  private defaultCalendarId: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "denied") {
        debug.warn("Calendar permission not granted");
        return false;
      }
      const calendars = await Calendar.getCalendarsAsync("event");
      const defaultCal = calendars.find(
        (cal: { allowsModifications: boolean; id?: string }) =>
          cal.allowsModifications,
      );
      this.defaultCalendarId = defaultCal?.id || null;
      return true;
    } catch (error) {
      debug.error("Failed to initialize:", error as Error);
      return false;
    }
  }

  isAvailable(): boolean {
    return Platform.OS === "ios" || Platform.OS === "macos";
  }

  async fetchEvents(
    timeMin: Date,
    timeMax: Date,
    calendarId?: string,
  ): Promise<CalendarEvent[]> {
    if (!this.isAvailable()) {
      throw new Error("Apple Calendar only available on iOS/macOS");
    }
    try {
      const targetCalendarId = calendarId || this.defaultCalendarId;
      if (!targetCalendarId) {
        throw new Error("No calendar available");
      }
      const events = await Calendar.getEventsAsync(
        [targetCalendarId],
        timeMin,
        timeMax,
      );
      return events.map((event: Record<string, unknown>) =>
        this.mapAppleEvent(event),
      );
    } catch (error) {
      debug.error("Failed to fetch events:", error as Error);
      throw error;
    }
  }

  private mapAppleEvent(event: Record<string, unknown>): CalendarEvent {
    return {
      id: event.id as string,
      title: (event.title as string) || "Untitled",
      description: event.notes as string | undefined,
      startTime: new Date(event.startDate as string),
      endTime: new Date(event.endDate as string),
      isAllDay: event.allDay as boolean,
      location: event.location as string | undefined,
      calendarId: (event.calendarId as string) || "",
      calendarName: "Apple Calendar",
      color: event.color as string | undefined,
    };
  }

  async createFocusEvent(
    startTime: Date,
    duration: number,
    title: string = "Focus Time",
  ): Promise<CalendarEvent> {
    if (!this.isAvailable()) {
      throw new Error("Apple Calendar only available on iOS/macOS");
    }
    try {
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const calendarId = this.defaultCalendarId;
      if (!calendarId) {
        throw new Error("No calendar available");
      }
      const eventId = await Calendar.createEventAsync(calendarId, {
        title,
        notes: "Focused work session via VEX",
        startDate: startTime,
        endDate: endTime,
        allDay: false,
        location: undefined,
        alarms: [{ relativeOffset: -5 }],
      });
      return {
        id: eventId,
        title,
        startTime,
        endTime,
        isAllDay: false,
        calendarId,
        calendarName: "Apple Calendar",
      };
    } catch (error) {
      debug.error("Failed to create focus event:", error);
      throw error;
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    try {
      await Calendar.deleteEventAsync(calendarId, eventId);
      return true;
    } catch (error) {
      debug.error("Failed to delete event:", error);
      return false;
    }
  }

  async getFreeBusy(timeMin: Date, timeMax: Date): Promise<FreeBusyInfo> {
    if (!this.isAvailable()) {
      throw new Error("Apple Calendar only available on iOS/macOS");
    }
    try {
      const events = await this.fetchEvents(timeMin, timeMax);
      const busySlots = events.map((event) => ({
        start: event.startTime,
        end: event.endTime,
      }));
      busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());
      const merged = mergeBusySlots(busySlots);
      const freeSlots = calculateFreeSlots(merged, timeMin, timeMax);
      return { busySlots: merged, freeSlots };
    } catch (error) {
      debug.error("Failed to get free/busy:", error);
      throw error;
    }
  }
}
