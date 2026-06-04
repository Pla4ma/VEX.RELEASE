import { lightColors } from '@/theme/tokens/colors';


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
  '1': lightColors.accent.blue,
  '2': lightColors.semantic.success,
  '3': lightColors.accent.purple,
  '4': lightColors.semantic.danger,
  '5': lightColors.semantic.warning,
  '6': lightColors.semantic.danger,
  '7': lightColors.accent.blue,
  '8': lightColors.text.muted,
  '9': lightColors.accent.blue,
  '10': lightColors.semantic.success,
  '11': lightColors.accent.pink,
};
