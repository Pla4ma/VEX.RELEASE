/**
 * Event Service — manages event lifecycle, delegates challenges,
 * handles persistence of user progress.
 */
import { eventBus } from "./EventBus";
import { getAnalyticsService } from "../analytics/AnalyticsService";
import { getAvailabilityFor } from "../features/liveops-config/feature-access-store";
import { createDebugger } from "../utils/debug";
import { getMMKVStorageAdapter } from "../persistence/MMKVStorageAdapter";
import { ChallengeManager } from "./ChallengeManager";
import { EventSchema, calculateEventStatus } from "./EventSchemas";
import { setupEventListeners } from "./setupEventListeners";
import type { Event, Challenge } from "./EventSchemas";

// Re-export for backward compatibility
export { EventSchema, ChallengeSchema, calculateEventStatus } from "./EventSchemas";
export type { Event, Challenge, EventType, EventStatus, ChallengeType, ChallengeStatus } from "./EventSchemas";

const debug = createDebugger("events");

export class EventService {
  private userId: string | null = null;
  private activeEvents: Map<string, Event> = new Map();
  private challengeManager: ChallengeManager;

  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.challengeManager = new ChallengeManager(
      () => this.userId,
      () => this.saveState(),
      (eventId) => this.checkEventCompletion(eventId),
    );
    if (!getAvailabilityFor("seasonal_features").canSubscribeToEvents) {
      debug.info("EventService skipped - seasonal systems inactive");
      return;
    }
    setupEventListeners(() => this.userId, this.challengeManager);
    this.loadState();
  }

  setUserId(userId: string): void {
    this.userId = userId;
    if (getAvailabilityFor("seasonal_features").canUseBackend) {
      this.loadState();
    }
    debug.info("EventService user set: %s", userId);
  }

  registerEvent(event: Omit<Event, "status" | "currentParticipants">): Event {
    const fullEvent = EventSchema.parse({
      ...event,
      status: calculateEventStatus(event.startAt, event.endAt),
      currentParticipants: 0,
    });
    this.activeEvents.set(fullEvent.id, fullEvent);
    debug.info("Event registered: %s (%s)", fullEvent.title, fullEvent.id);
    eventBus.publish("event:created", {
      eventId: fullEvent.id,
      title: fullEvent.title,
      type: fullEvent.type,
    });
    return fullEvent;
  }

  joinEvent(eventId: string): void {
    if (!this.userId) throw new Error("EventService: No user set");
    const event = this.activeEvents.get(eventId);
    if (!event) throw new Error(`Event not found: ${eventId}`);
    if (event.status === "ENDED") throw new Error("Event has ended");
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw new Error("Event is full");
    }
    event.currentParticipants++;
    for (const challengeId of event.challenges) {
      this.challengeManager.joinChallenge(challengeId);
    }
    eventBus.publish("event:joined", { userId: this.userId, eventId, joinedAt: Date.now() });
    const analytics = getAnalyticsService();
    analytics.track("event_joined", {
      user_id: this.userId,
      event_id: eventId,
      event_type: event.type,
    });
    debug.info("User joined event: %s", eventId);
  }

  leaveEvent(eventId: string): void {
    if (!this.userId) return;
    const event = this.activeEvents.get(eventId);
    if (!event) return;
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    eventBus.publish("event:left", { userId: this.userId, eventId });
  }

  registerChallenge(challenge: Challenge): Challenge {
    return this.challengeManager.registerChallenge(challenge);
  }

  joinChallenge(challengeId: string): void {
    this.challengeManager.joinChallenge(challengeId);
  }

  claimChallengeReward(challengeId: string): void {
    this.challengeManager.claimChallengeReward(challengeId);
  }

  getActiveEvents(): Event[] {
    return Array.from(this.activeEvents.values()).filter(
      (e) => e.status === "ACTIVE" || e.status === "ENDING_SOON",
    );
  }

  getEventById(id: string): Event | undefined {
    return this.activeEvents.get(id);
  }

  getActiveChallenges(): Challenge[] {
    return this.challengeManager.getActiveChallenges();
  }

  getChallengeById(id: string): Challenge | undefined {
    return this.challengeManager.getChallengeById(id);
  }

  getUserChallengeProgress(challengeId: string): number {
    return this.challengeManager.getUserChallengeProgress(challengeId);
  }

  getCompletedChallenges(): Challenge[] {
    return this.challengeManager.getCompletedChallenges();
  }

  private checkEventCompletion(eventId: string): void {
    const event = this.activeEvents.get(eventId);
    if (!event) return;
    const allComplete = event.challenges.every((cid) => {
      const c = this.challengeManager.getChallengeById(cid);
      return c && c.completedBy.includes(this.userId!);
    });
    if (allComplete && this.userId) {
      eventBus.publish("event:all_challenges_complete", {
        userId: this.userId,
        eventId,
        completedAt: Date.now(),
      });
    }
  }

  cleanupEndedEvents(): void {
    const now = Date.now();
    for (const [id, event] of this.activeEvents) {
      if (event.endAt < now - 7 * 24 * 60 * 60 * 1000) {
        this.activeEvents.delete(id);
        debug.debug("Cleaned up ended event: %s", id);
      }
    }
  }

  private async loadState(): Promise<void> {
    if (!this.userId) return;
    try {
      const key = `events:progress:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      const data = await storage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        this.challengeManager.setUserProgressData(
          new Map(Object.entries(parsed.userProgress || {})),
        );
        debug.info("Loaded event progress for %d challenges", this.challengeManager.getUserProgressData().size);
      }
    } catch (error) {
      debug.error("Failed to load event state", error as Error);
    }
  }

  private async saveState(): Promise<void> {
    if (!this.userId) return;
    try {
      const key = `events:progress:${this.userId}`;
      const data = { userProgress: Object.fromEntries(this.challengeManager.getUserProgressData()) };
      const storage = getMMKVStorageAdapter();
      await storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      debug.error("Failed to save event state", error as Error);
    }
  }
}

let eventServiceInstance: EventService | null = null;

export function getEventService(userId?: string): EventService {
  if (!eventServiceInstance) {
    eventServiceInstance = new EventService(userId);
  } else if (userId) {
    eventServiceInstance.setUserId(userId);
  }
  return eventServiceInstance;
}
