import { getApiClient } from "../../api/client";
import { createDebugger } from "../../utils/debug";
import type { CalendarEvent, FreeBusyInfo } from "./types";
import type {
  GoogleCalendarConfig,
  GoogleCalendarEventRaw,
  GoogleCalendarListResponse,
  GoogleFreeBusyResponse,
} from "./google-calendar-types";
import {
  mapGoogleEvent,
  mergeBusySlots,
  calculateFreeSlots,
} from "./google-calendar-helpers";

export type { GoogleCalendarConfig } from "./google-calendar-types";

const debug = createDebugger("calendar:google");
const GOOGLE_CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3";

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
      const response = await getApiClient().get<GoogleCalendarListResponse>(
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
      const events = response?.items || [];
      return events.map((event) => mapGoogleEvent(event));
    } catch (error) {
      debug.error("Failed to fetch events:", error);
      throw error;
    }
  }

  async createFocusEvent(
    startTime: Date,
    duration: number,
    title: string = "Focus Time",
  ): Promise<CalendarEvent> {
    try {
      const authHeader = await this.getAuthHeader();
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const response = await getApiClient().post<GoogleCalendarEventRaw>(
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
      return mapGoogleEvent(response);
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
      const response = await getApiClient().post<GoogleFreeBusyResponse>(
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
      const calendars = response?.calendars || {};
      const busySlots: Array<{ start: Date; end: Date }> = [];
      Object.values(calendars).forEach((cal) => {
        const busy = cal.busy || [];
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
      const merged = mergeBusySlots(busySlots);
      const freeSlots = calculateFreeSlots(merged, timeMin, timeMax);
      return { busySlots: merged, freeSlots };
    } catch (error) {
      debug.error("Failed to get free/busy:", error);
      throw error;
    }
  }
}
