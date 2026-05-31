/**
 * Calendar Integration Types
 *
 * Shared types for calendar adapters.
 * Phase 2: Critical Integration - Calendar
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  calendarId: string;
  calendarName: string;
  color?: string;
}

export interface FocusTimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  title: string;
}

export interface CalendarGap {
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  reason: string;
}

export interface CalendarSyncResult {
  success: boolean;
  eventsAdded: number;
  eventsUpdated: number;
  errors: string[];
}

export interface FreeBusyInfo {
  busySlots: Array<{
    start: Date;
    end: Date;
  }>;
  freeSlots: Array<{
    start: Date;
    end: Date;
    duration: number;
  }>;
}

export interface StudyScheduleSuggestion {
  suggestedTimes: Array<{
    startTime: Date;
    endTime: Date;
    duration: number;
    confidence: number;
    reason: string;
  }>;
  deadline?: Date;
  totalStudyNeeded: number; // minutes
}
