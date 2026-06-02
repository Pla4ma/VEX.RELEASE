

export interface GoogleCalendarConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface GoogleCalendarEventRaw {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  location?: string;
  colorId?: string;
}

export interface GoogleCalendarListResponse {
  items?: GoogleCalendarEventRaw[];
}

export interface GoogleFreeBusyCalendars {
  busy?: Array<{ start?: string; end?: string }>;
}

export interface GoogleFreeBusyResponse {
  calendars?: Record<string, GoogleFreeBusyCalendars>;
}

/**
 * Google Calendar color ID → hex mapping.
 * These are documented API mapping values, not UI styling tokens.
 */
export const GOOGLE_COLOR_MAP: Record<string, string> = {
  '1': '#7986cb',
  '2': '#33b679',
  '3': '#8e24aa',
  '4': '#e67c73',
  '5': '#f6bf26',
  '6': '#f4511e',
  '7': '#039be5',
  '8': '#616161',
  '9': '#3f51b5',
  '10': '#0b8043',
  '11': '#d81b60',
};
