import { launchColors } from "@theme/tokens/launch-colors";
import type { SessionHistoryEntry } from "../types";

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
      return launchColors.hex_4caf50;
    case "ABANDONED":
      return launchColors.hex_ffa500;
    case "FAILED":
      return launchColors.hex_f44336;
    default:
      return launchColors.hex_9e9e9e;
  }
};

export const filterHistory = (
  history: SessionHistoryEntry[],
  searchQuery: string,
  filterStatus: string,
  timeRange: string,
): SessionHistoryEntry[] => {
  let filtered = [...history];
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.config.category?.toLowerCase().includes(query) ||
        h.config.tags?.some((t: string) => t.toLowerCase().includes(query)),
    );
  }
  if (filterStatus !== "ALL") {
    filtered = filtered.filter((h) => h.status === filterStatus);
  }
  const now = Date.now();
  if (timeRange === "TODAY") {
    const today = new Date().setHours(0, 0, 0, 0);
    filtered = filtered.filter((h) => (h.endedAt ?? h.createdAt) >= today);
  } else if (timeRange === "WEEK") {
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((h) => (h.endedAt ?? h.createdAt) >= weekAgo);
  } else if (timeRange === "MONTH") {
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((h) => (h.endedAt ?? h.createdAt) >= monthAgo);
  }
  return filtered.sort(
    (a, b) => (b.endedAt ?? b.createdAt) - (a.endedAt ?? a.createdAt),
  );
};

export const computeStats = (filteredHistory: SessionHistoryEntry[]) => {
  const total = filteredHistory.length;
  const completed = filteredHistory.filter(
    (h) => h.status === "COMPLETED",
  ).length;
  const abandoned = filteredHistory.filter(
    (h) => h.status === "ABANDONED",
  ).length;
  const failed = filteredHistory.filter((h) => h.status === "FAILED").length;
  const totalFocusTime = filteredHistory.reduce(
    (acc, h) => acc + (h.summary?.effectiveDuration ?? 0),
    0,
  );
  const avgScore =
    total > 0
      ? filteredHistory.reduce(
          (acc, h) => acc + (h.summary?.finalScore ?? 0),
          0,
        ) / total
      : 0;
  return { total, completed, abandoned, failed, totalFocusTime, avgScore };
};
