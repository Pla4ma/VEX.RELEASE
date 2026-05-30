/**
 * Integration tests — sessions-feed.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  mockStreaks,
  mockProgression,
  mockSentry,
  fireEvent,
} from "./integration-setup";
import { initializeSessionsFeedIntegration } from "../sessions-feed";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("sessions-feed.ts", () => {
    it("subscribes to sessions:completed event", () => {
      const unsub = initializeSessionsFeedIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "sessions:completed",
        expect.any(Function),
      );
      unsub();
    });

    it("processes session completion → recordSession + addXpEnhanced + breadcrumb", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", {
        userId: "u1",
        sessionId: "s1",
        duration: 1800,
        qualityScore: 80,
        streakDays: 3,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStreaks.recordSession).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: "u1",
              sessionId: "s1",
              duration: 1800,
              qualityScore: 80,
            }),
          );
          expect(mockProgression.addXpEnhanced).toHaveBeenCalled();
          expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({ category: "sessions:integration" }),
          );
          unsub();
          resolve();
        }, 20);
      });
    });

    it("ignores null event", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", null);
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores event with missing sessionId", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", { userId: "u1" });
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores event with missing userId", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", { sessionId: "s1" });
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
      unsub();
    });

    it("defaults qualityScore and streakDays to 0 when omitted", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", {
        userId: "u1",
        sessionId: "s1",
        duration: 1200,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStreaks.recordSession).toHaveBeenCalledWith(
            expect.objectContaining({ qualityScore: 0 }),
          );
          unsub();
          resolve();
        }, 20);
      });
    });
  });
});
