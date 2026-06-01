import type { CalendarEvent } from './types';
import type { GoogleCalendarEventRaw } from './google-calendar-types';
import { GOOGLE_COLOR_MAP } from './google-calendar-types';

export function mapGoogleEvent(event: GoogleCalendarEventRaw): CalendarEvent {
  const isAllDay = !!event.start?.date;
  return {
    id: event.id || '',
    title: event.summary || 'Untitled',
    description: event.description,
    startTime: new Date(
      event.start?.dateTime || event.start?.date || new Date(),
    ),
    endTime: new Date(event.end?.dateTime || event.end?.date || new Date()),
    isAllDay,
    location: event.location,
    calendarId: 'primary',
    calendarName: 'Google Calendar',
    color: mapGoogleColor(event.colorId),
  };
}

export function mapGoogleColor(colorId?: string): string | undefined {
  return GOOGLE_COLOR_MAP[colorId || ''];
}
