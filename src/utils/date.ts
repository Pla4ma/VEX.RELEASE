/**
 * Date Utilities
 *
 * Date formatting and manipulation helpers.
 */

/**
 * Format date to relative time (e.g., "2 hours ago")
 * Alias for formatDistanceToNow for compatibility
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(date);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @alias formatRelativeTime
 */
export function formatDistanceToNow(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w ago`;
  } else {
    return formatDate(targetDate, "medium");
  }
}

/**
 * Format date to string
 */
export function formatDate(
  date: Date | string | number,
  format: "short" | "medium" | "long" | "full" = "medium",
): string {
  const d = new Date(date);

  switch (format) {
    case "short":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "medium":
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "long":
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "full":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format time
 */
export function formatTime(
  date: Date | string | number,
  format: "short" | "medium" = "short",
): string {
  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: Date | string | number,
  format: "short" | "medium" = "medium",
): string {
  const d = new Date(date);
  const dateStr = formatDate(d, format);
  const timeStr = formatTime(d, format);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Parse ISO string to Date
 */
export function parseISO(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format to ISO string
 */
export function toISO(date: Date): string {
  return date.toISOString();
}
