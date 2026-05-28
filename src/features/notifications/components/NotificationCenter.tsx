import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import type { NotificationItem, NotificationCenterProps } from "./notification-types";
import { styles, priorityStyles, formatTimestamp } from "./notification-styles";

export type { NotificationItem };

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onAction,
  onClose,
}: NotificationCenterProps): JSX.Element {
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Text>
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
                <View
                  style={
                    notification.read
                      ? styles.readIndicator
                      : styles.unreadIndicator
                  }
                />
                <View style={styles.content}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationBody}>
                    {notification.body}
                  </Text>
                  <View style={styles.meta}>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                    <Text
                      style={[
                        styles.priorityBadge,
                        priorityStyles[notification.priority],
                      ]}
                    >
                      {notification.priority}
                    </Text>
                  </View>
                  {notification.action && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => onAction(notification)}
                    >
                      <Text style={styles.actionButtonText}>
                        {notification.action.type === "start_session" &&
                          "Start Session"}
                        {notification.action.type === "view_boss" &&
                          "View Boss"}
                        {notification.action.type === "open_chest" &&
                          "Open Chest"}
                        {notification.action.type === "dismiss" && "Dismiss"}
                      </Text>
                    </Pressable>
                  )}
                </View>
                <Pressable
                  onPress={() => onDismiss(notification.id)}
                  accessibilityLabel="Dismiss notification"
                >
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
