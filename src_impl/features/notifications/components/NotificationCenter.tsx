import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "urgency" | "social" | "system";
  priority: "low" | "normal" | "high" | "critical";
  read: boolean;
  timestamp: number;
  action?: {
    type: "start_session" | "view_boss" | "open_chest" | "dismiss";
    payload?: Record<string, unknown>;
  };
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onAction: (notification: NotificationItem) => void;
  onClose: () => void;
}

const styles = createSheet({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#1a1a2e",
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
    borderBottomColor: "#2a2a4e",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#2a2a4e",
  },
  markAllText: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "600",
  },
  scrollView: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
    alignItems: "flex-start",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e94560",
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
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "#9E9E9E",
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  criticalBadge: {
    backgroundColor: "#e94560",
    color: "#fff",
  },
  highBadge: {
    backgroundColor: "#f5a623",
    color: "#000",
  },
  actionButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e94560",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
  },
  closeButton: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2a2a4e",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  dismissText: {
    color: "#666",
    fontSize: 18,
  },
});

const priorityStyles = {
  critical: styles.criticalBadge,
  high: styles.highBadge,
  normal: { backgroundColor: "#2a2a4e", color: "#fff" },
  low: { backgroundColor: "#1a1a2e", color: "#666" },
};

function formatTimestamp(timestamp: number): string {
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

export function NotificationCenter({ notifications, onMarkRead, onMarkAllRead, onDismiss, onAction, onClose }: NotificationCenterProps): JSX.Element {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications {unreadCount > 0 && `(${unreadCount})`}</Text>
          {unreadCount > 0 && (
            <Pressable style={styles.markAllButton} onPress={onMarkAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          )}
        </View>

        <ScrollView style={styles.scrollView}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <Pressable
                key={notification.id}
                style={styles.notificationItem}
                onPress={() => {
                  if (!notification.read) {
                    onMarkRead(notification.id);
                  }
                  if (notification.action) {
                    onAction(notification);
                  }
                }}
              >
                <View style={notification.read ? styles.readIndicator : styles.unreadIndicator} />

                <View style={styles.content}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationBody}>{notification.body}</Text>

                  <View style={styles.meta}>
                    <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
                    <Text style={[styles.priorityBadge, priorityStyles[notification.priority]]}>{notification.priority}</Text>
                  </View>

                  {notification.action && (
                    <Pressable style={styles.actionButton} onPress={() => onAction(notification)}>
                      <Text style={styles.actionButtonText}>
                        {notification.action.type === "start_session" && "Start Session"}
                        {notification.action.type === "view_boss" && "View Boss"}
                        {notification.action.type === "open_chest" && "Open Chest"}
                        {notification.action.type === "dismiss" && "Dismiss"}
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Pressable onPress={() => onDismiss(notification.id)} accessibilityLabel="Dismiss notification">
                  <Text style={styles.dismissText}>×</Text>
                </Pressable>
              </Pressable>
            ))
          )}
        </ScrollView>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// Need to import StyleSheet for the overlay spread
import { StyleSheet } from "react-native";
