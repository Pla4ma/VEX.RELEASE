import { StyleSheet } from "react-native";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

export const styles = createSheet({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: launchColors.rgb_0_0_0_0_5,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: launchColors.hex_1a1a2e,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: launchColors.hex_2a2a4e,
  },
  title: { fontSize: 18, fontWeight: "700", color: launchColors.hex_fff },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: launchColors.hex_2a2a4e,
  },
  markAllText: {
    fontSize: 12,
    color: launchColors.hex_9e9e9e,
    fontWeight: "600",
  },
  scrollView: { maxHeight: 400 },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: launchColors.hex_2a2a4e,
    alignItems: "flex-start",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: launchColors.hex_e94560,
    marginRight: 12,
    marginTop: 6,
  },
  readIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent",
    marginRight: 12,
    marginTop: 6,
  },
  content: { flex: 1 },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: launchColors.hex_fff,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: launchColors.hex_9e9e9e,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: { fontSize: 12, color: launchColors.hex_666 },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  criticalBadge: {
    backgroundColor: launchColors.hex_e94560,
    color: launchColors.hex_fff,
  },
  highBadge: {
    backgroundColor: launchColors.hex_f5a623,
    color: launchColors.hex_000,
  },
  actionButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: launchColors.hex_e94560,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: launchColors.hex_fff,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: { padding: 40, alignItems: "center" },
  emptyText: {
    fontSize: 16,
    color: launchColors.hex_9e9e9e,
    textAlign: "center",
  },
  closeButton: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: launchColors.hex_2a2a4e,
  },
  closeButtonText: {
    fontSize: 16,
    color: launchColors.hex_fff,
    fontWeight: "600",
  },
  dismissText: { color: launchColors.hex_666, fontSize: 18 },
});

export const priorityStyles = {
  critical: styles.criticalBadge,
  high: styles.highBadge,
  normal: {
    backgroundColor: launchColors.hex_2a2a4e,
    color: launchColors.hex_fff,
  },
  low: {
    backgroundColor: launchColors.hex_1a1a2e,
    color: launchColors.hex_666,
  },
};

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${days}d ago`;
}
