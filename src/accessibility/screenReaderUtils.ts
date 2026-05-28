/**
 * Screen reader announcement and accessible label utilities.
 */

import { eventBus } from "../events";
import type { ScreenReaderAnnouncement } from "./types";

const announcements: ScreenReaderAnnouncement[] = [];

export function announce(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  const announcement: ScreenReaderAnnouncement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    priority,
    timestamp: Date.now(),
  };
  announcements.push(announcement);
  if (announcements.length > 10) {
    announcements.shift();
  }
  const eventPriority = priority === "assertive" ? "high" : "normal";
  eventBus.publish("accessibility:announce", {
    message,
    priority: eventPriority,
  });
}

export function getRecentAnnouncements(
  limit: number = 5,
): ScreenReaderAnnouncement[] {
  return announcements.slice(-limit);
}

export function generateAccessibleLabel(element: {
  type: string;
  text?: string;
  icon?: string;
  state?: string;
  progress?: number;
  action?: string;
}): string {
  const parts: string[] = [];
  if (element.type) {
    parts.push(element.type);
  }
  if (element.text) {
    parts.push(element.text);
  }
  if (element.state) {
    parts.push(`, ${element.state}`);
  }
  if (element.progress !== undefined) {
    parts.push(`, ${Math.round(element.progress)}% complete`);
  }
  if (element.action) {
    parts.push(`, double tap to ${element.action}`);
  }
  return parts.join("");
}
