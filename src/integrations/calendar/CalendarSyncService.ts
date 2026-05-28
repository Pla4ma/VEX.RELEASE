import { Platform } from "react-native";
import { createDebugger } from "../../utils/debug";
import { GoogleCalendarAdapter } from "./GoogleCalendarAdapter";
import { AppleCalendarAdapter } from "./AppleCalendarAdapter";
import { SmartScheduler } from "./SmartScheduler";
import type { CalendarEvent, CalendarGap, FreeBusyInfo, StudyScheduleSuggestion } from "./types";
import type { CalendarProvider, CalendarConfig, DeadlineAnalysis } from "./calendar-sync-helpers";
import { mergeBusySlots, calculateFreeSlots, getSmartSessionSuggestionFromGaps } from "./calendar-sync-helpers";

export type { CalendarProvider, CalendarConfig };

const debug = createDebugger("calendar:sync");

export class CalendarSyncService {
  private googleAdapter?: GoogleCalendarAdapter;
  private appleAdapter?: AppleCalendarAdapter;
  private scheduler: SmartScheduler;
  private connectedProviders: Set<CalendarProvider> = new Set();
  constructor() {
    this.scheduler = new SmartScheduler();
  }
  async initialize(config: CalendarConfig): Promise<boolean> {
    let anyConnected = false;
    if (config.google) {
      try {
        this.googleAdapter = new GoogleCalendarAdapter(config.google);
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        await this.googleAdapter.fetchEvents(today, tomorrow);
        this.connectedProviders.add("GOOGLE");
        anyConnected = true;
        debug.info("Google Calendar connected");
      } catch (error) {
        debug.error("Failed to connect Google Calendar:", error);
      }
    }
    if (config.apple && Platform.OS === "ios") {
      try {
        this.appleAdapter = new AppleCalendarAdapter();
        const initialized = await this.appleAdapter.initialize();
        if (initialized) {
          this.connectedProviders.add("APPLE");
          anyConnected = true;
          debug.info("Apple Calendar connected");
        }
      } catch (error) {
        debug.error("Failed to connect Apple Calendar:", error);
      }
    }
    return anyConnected;
  }
  isConnected(): boolean {
    return this.connectedProviders.size > 0;
  }
  getConnectedProviders(): CalendarProvider[] {
    return Array.from(this.connectedProviders);
  }
  async fetchAllEvents(
    timeMin: Date,
    timeMax: Date,
  ): Promise<{ provider: CalendarProvider; events: CalendarEvent[] }[]> {
    const results: { provider: CalendarProvider; events: CalendarEvent[] }[] = [];
    if (this.googleAdapter && this.connectedProviders.has("GOOGLE")) {
      try {
        const events = await this.googleAdapter.fetchEvents(timeMin, timeMax);
        results.push({ provider: "GOOGLE", events });
      } catch (error) {
        debug.error("Failed to fetch Google events:", error);
      }
    }
    if (this.appleAdapter && this.connectedProviders.has("APPLE")) {
      try {
        const events = await this.appleAdapter.fetchEvents(timeMin, timeMax);
        results.push({ provider: "APPLE", events });
      } catch (error) {
        debug.error("Failed to fetch Apple events:", error);
      }
    }
    return results;
  }
  async getCombinedFreeBusy(
    timeMin: Date,
    timeMax: Date,
  ): Promise<FreeBusyInfo> {
    const allBusy: Array<{ start: Date; end: Date }> = [];
    if (this.googleAdapter && this.connectedProviders.has("GOOGLE")) {
      try {
        const freeBusy = await this.googleAdapter.getFreeBusy(timeMin, timeMax);
        allBusy.push(...freeBusy.busySlots);
      } catch (error) {
        debug.error("Failed to get Google free/busy:", error);
      }
    }
    if (this.appleAdapter && this.connectedProviders.has("APPLE")) {
      try {
        const freeBusy = await this.appleAdapter.getFreeBusy(timeMin, timeMax);
        allBusy.push(...freeBusy.busySlots);
      } catch (error) {
        debug.error("Failed to get Apple free/busy:", error);
      }
    }
    const merged = mergeBusySlots(allBusy);
    const freeSlots = calculateFreeSlots(merged, timeMin, timeMax);
    return { busySlots: merged, freeSlots };
  }
  async createFocusEvent(
    startTime: Date,
    duration: number,
    title: string = "Focus Time",
  ): Promise<CalendarEvent | null> {
    if (this.googleAdapter && this.connectedProviders.has("GOOGLE")) {
      try {
        return await this.googleAdapter.createFocusEvent(startTime, duration, title);
      } catch (error) {
        debug.error("Failed to create Google event:", error);
      }
    }
    if (this.appleAdapter && this.connectedProviders.has("APPLE")) {
      try {
        return await this.appleAdapter.createFocusEvent(startTime, duration, title);
      } catch (error) {
        debug.error("Failed to create Apple event:", error);
      }
    }
    return null;
  }
  async findFocusTimeGaps(
    daysAhead: number = 3,
    minDuration: number = 25,
  ): Promise<CalendarGap[]> {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const freeBusy = await this.getCombinedFreeBusy(now, future);
    return this.scheduler.findBestGaps(freeBusy, minDuration);
  }
  async suggestStudySchedule(
    totalMinutesNeeded: number,
    deadline?: Date,
    userLevel: "beginner" | "intermediate" | "advanced" = "intermediate",
  ): Promise<StudyScheduleSuggestion> {
    const now = new Date();
    const daysUntilDeadline = deadline
      ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 7;
    const future = new Date(
      now.getTime() + Math.max(daysUntilDeadline, 7) * 24 * 60 * 60 * 1000,
    );
    const freeBusy = await this.getCombinedFreeBusy(now, future);
    return this.scheduler.generateStudySchedule(freeBusy, totalMinutesNeeded, deadline, userLevel);
  }
  async analyzeUpcomingDeadlines(daysAhead: number = 14): Promise<DeadlineAnalysis> {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const allEvents: Array<{ title: string; startTime: Date; description?: string }> = [];
    const results = await this.fetchAllEvents(now, future);
    for (const { events } of results) {
      allEvents.push(...events.map((e) => ({ title: e.title, startTime: e.startTime, description: e.description })));
    }
    return this.scheduler.analyzeDeadlines(allEvents);
  }
  async getSmartSessionSuggestion() {
    const gaps = await this.findFocusTimeGaps(1, 25);
    return getSmartSessionSuggestionFromGaps(gaps);
  }
}
