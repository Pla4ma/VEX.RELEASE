import * as Sentry from "@sentry/react-native";
import { TodaySystemEventSchema, type TodaySystemEvent } from "./events";

export function trackTodaySystemEvent(event: TodaySystemEvent): void {
  const parsed = TodaySystemEventSchema.parse(event);
  Sentry.addBreadcrumb({
    category: "today_system",
    level: "info",
    message: parsed.type,
    data: { section: parsed.section, userId: parsed.userId },
  });
}
