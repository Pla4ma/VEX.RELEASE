import type { CalendarEvent } from "./types";
import type { GoogleCalendarEventRaw } from "./google-calendar-types";
import { GOOGLE_COLOR_MAP } from "./google-calendar-types";

export function mapGoogleEvent(event: GoogleCalendarEventRaw): CalendarEvent {
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
    color: mapGoogleColor(event.colorId),
  };
}

export function mapGoogleColor(colorId?: string): string | undefined {
  return GOOGLE_COLOR_MAP[colorId || ""];
}

export function mergeBusySlots(
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

export function calculateFreeSlots(
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
