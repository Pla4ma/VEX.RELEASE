import { getApiClient } from "../../api/client";
import { createDebugger } from "../../utils/debug";
import type {
  CalendarEvent,
  CalendarGap,
  FreeBusyInfo,
  StudyScheduleSuggestion,
} from "./types";
import { launchColors } from "@theme/tokens/launch-colors";
const debug = createDebugger("calendar:google");
const GOOGLE_CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3";
/**
 * Google Calendar color ID → hex mapping.
 * These are documented API mapping values, not UI styling tokens.
 */
const GOOGLE_COLOR_MAP: Record<string, string> = {
  "1": launchColors.hex_7986cb,
  "2": launchColors.hex_33b679,
  "3": launchColors.hex_8e24aa,
  "4": launchColors.hex_e67c73,
  "5": launchColors.hex_f6bf26,
  "6": launchColors.hex_f4511e,
  "7": launchColors.hex_039be5,
  "8": launchColors.hex_616161,
  "9": launchColors.hex_3f51b5,
  "10": launchColors.hex_0b8043,
  "11": launchColors.hex_d81b60,
};
export interface GoogleCalendarConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
export class GoogleCalendarAdapter {
  private config: GoogleCalendarConfig;
  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }
  private needsRefresh(): boolean {
    return Date.now() >= this.config.expiresAt - 5 * 60 * 1000;
  }
  async refreshToken(): Promise<boolean> {
    try {
      const response = await getApiClient().post<{
        accessToken: string;
        expiresIn?: number;
      }>("/auth/google/refresh", { refreshToken: this.config.refreshToken });
      if (response?.accessToken) {
        this.config.accessToken = response.accessToken;
        this.config.expiresAt =
          Date.now() + (response.expiresIn || 3600) * 1000;
        debug.info("Token refreshed successfully");
        return true;
      }
      return false;
    } catch (error) {
      debug.error("Failed to refresh token:", error);
      return false;
    }
  }
  private async getAuthHeader(): Promise<string> {
    if (this.needsRefresh()) {
      await this.refreshToken();
    }
    return `Bearer ${this.config.accessToken}`;
  }
  async fetchEvents(
    timeMin: Date,
    timeMax: Date,
    calendarId: string = "primary",
  ): Promise<CalendarEvent[]> {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await getApiClient().get(
        `${GOOGLE_CALENDAR_BASE_URL}/calendars/${calendarId}/events`,
        {
          headers: { Authorization: authHeader },
          params: {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          },
        },
      );
      const events = (response as { items?: unknown[] })?.items || [];
      return events.map((event) =>
        this.mapGoogleEvent(
          event as {
            id?: string;
            summary?: string;
            description?: string;
            start?: { dateTime?: string; date?: string };
            end?: { dateTime?: string; date?: string };
            location?: string;
            colorId?: string;
          },
        ),
      );
    } catch (error) {
      debug.error("Failed to fetch events:", error);
      throw error;
    }
  }
  private mapGoogleEvent(event: {
    id?: string;
    summary?: string;
    description?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
    colorId?: string;
  }): CalendarEvent {
    const isAllDay = !!event.start?.date;
    return {
      id: event.id || "",
      title: event.summary || "Untitled",
      description: event.description,
      startTime: new Date(
        event.start?.dateTime || event.start?.date || new Date(),
      ),
      endTime: new Date(event.end?.dateTime || event.end?.date || new Date()),
      isAllDay,
      location: event.location,
      calendarId: "primary",
      calendarName: "Google Calendar",
      color: this.mapGoogleColor(event.colorId),
    };
  }
  private mapGoogleColor(colorId?: string): string | undefined {
    return GOOGLE_COLOR_MAP[colorId || ""];
  }
  async createFocusEvent(
    startTime: Date,
    duration: number,
    title: string = "Focus Time",
  ): Promise<CalendarEvent> {
    try {
      const authHeader = await this.getAuthHeader();
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const response = await getApiClient().post(
        `${GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events`,
        {
          headers: { Authorization: authHeader },
          data: {
            summary: title,
            description: "Focused work session via VEX",
            start: {
              dateTime: startTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            colorId: "7",
            transparency: "opaque",
            visibility: "private",
          },
        },
      );
      return this.mapGoogleEvent(
        response as {
          id?: string;
          summary?: string;
          description?: string;
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
          location?: string;
          colorId?: string;
        },
      );
    } catch (error) {
      debug.error("Failed to create focus event:", error);
      throw error;
    }
  }
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const authHeader = await this.getAuthHeader();
      await getApiClient().delete(
        `${GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events/${eventId}`,
        { headers: { Authorization: authHeader } },
      );
      return true;
    } catch (error) {
      debug.error("Failed to delete event:", error);
      return false;
    }
  }
  async getFreeBusy(
    timeMin: Date,
    timeMax: Date,
    calendarIds: string[] = ["primary"],
  ): Promise<FreeBusyInfo> {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await getApiClient().post(
        `${GOOGLE_CALENDAR_BASE_URL}/freeBusy`,
        {
          headers: { Authorization: authHeader },
          data: {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            items: calendarIds.map((id) => ({ id })),
          },
        },
      );
      const calendars =
        (response as { calendars?: Record<string, unknown> })?.calendars || {};
      const busySlots: Array<{ start: Date; end: Date }> = [];
      Object.values(calendars).forEach((cal: unknown) => {
        const busy =
          (cal as { busy?: Array<{ start?: string; end?: string }> }).busy ||
          [];
        busy.forEach((slot) => {
          if (slot.start && slot.end) {
            busySlots.push({
              start: new Date(slot.start),
              end: new Date(slot.end),
            });
          }
        });
      });
      busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());
      const merged = this.mergeBusySlots(busySlots);
      const freeSlots = this.calculateFreeSlots(merged, timeMin, timeMax);
      return { busySlots: merged, freeSlots };
    } catch (error) {
      debug.error("Failed to get free/busy:", error);
      throw error;
    }
  }
  private mergeBusySlots(
    slots: Array<{ start: Date; end: Date }>,
  ): Array<{ start: Date; end: Date }> {
    if (slots.length === 0) {
      return [];
    }
    const merged: Array<{ start: Date; end: Date }> = [slots[0]!];
    for (let i = 1; i < slots.length; i++) {
      const last = merged[merged.length - 1]!;
      const current = slots[i]!;
      if (current.start <= last.end) {
        last.end = new Date(
          Math.max(last.end.getTime(), current.end.getTime()),
        );
      } else {
        merged.push(current);
      }
    }
    return merged;
  }
  private calculateFreeSlots(
    busySlots: Array<{ start: Date; end: Date }>,
    timeMin: Date,
    timeMax: Date,
  ): Array<{ start: Date; end: Date; duration: number }> {
    const free: Array<{ start: Date; end: Date; duration: number }> = [];
    let currentTime = new Date(timeMin);
    for (const busy of busySlots) {
      if (currentTime < busy.start) {
        free.push({
          start: new Date(currentTime),
          end: new Date(busy.start),
          duration: Math.floor(
            (busy.start.getTime() - currentTime.getTime()) / 60000,
          ),
        });
      }
      currentTime = new Date(
        Math.max(currentTime.getTime(), busy.end.getTime()),
      );
    }
    if (currentTime < timeMax) {
      free.push({
        start: new Date(currentTime),
        end: new Date(timeMax),
        duration: Math.floor(
          (timeMax.getTime() - currentTime.getTime()) / 60000,
        ),
      });
    }
    return free.filter((slot) => slot.duration >= 15);
  }
}
