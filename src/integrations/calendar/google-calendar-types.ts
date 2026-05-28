import { launchColors } from "@theme/tokens/launch-colors";

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
