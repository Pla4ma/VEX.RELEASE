/**
 * CoachMessageBubble Component
 *
 * Renders coach messages in a chat bubble style.
 * System messages have distinct styling.
 * Animated appearance with spring physics.
 *
 * @phase 8
 */

import React, { useState } from "react";
import { Pressable } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { Text } from "../../../components/primitives";
import { useTheme } from "../../../theme";
import type { CoachMessage } from "../types";

export interface CoachMessageBubbleProps {
  /** Message data */
  message: CoachMessage;
  /** Whether this is a coach message (left) or user message (right) */
  isCoach?: boolean;
  /** Index for stagger animation */
  index?: number;
  /** Callback when action button is pressed */
  onActionPress?: (action: string) => void;
}

/**
 * Coach message bubble (left-aligned)
 */
export function CoachMessageBubble({ message, isCoach = true, index = 0, onActionPress }: CoachMessageBubbleProps): JSX.Element {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if message is long (needs collapse)
  const isLongMessage = message.content.length > 200;
  const displayContent = expanded || !isLongMessage ? message.content : message.content.slice(0, 200) + "...";

  // Get persona emoji based on message style/persona
  const getPersonaEmoji = () => {
    // Could be derived from message.personaId
    return "🤖";
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400)
        .delay(index * 100)
        .springify()}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.spacing[2],
        marginBottom: theme.spacing[3],
        alignSelf: isCoach ? "flex-start" : "flex-end",
        maxWidth: "85%",
      }}
    >
      {/* Coach Avatar */}
      {isCoach && (
        <Animated.View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primary[500],
            justifyContent: "center",
            alignItems: "center",
            marginTop: theme.spacing[1],
          }}
        >
          <Text fontSize={18}>{getPersonaEmoji()}</Text>
        </Animated.View>
      )}

      {/* Message Bubble */}
      <Animated.View
        style={{
          backgroundColor: isCoach ? theme.colors.background.secondary : theme.colors.primary[500],
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          borderBottomLeftRadius: isCoach ? 4 : theme.borderRadius.xl,
          borderBottomRightRadius: isCoach ? theme.borderRadius.xl : 4,
        }}
      >
        <Text variant="body" color={isCoach ? theme.colors.text.primary : theme.colors.text.inverse}>
          {displayContent}
        </Text>

        {/* Read more link for long messages */}
        {isLongMessage && (
          <Pressable onPress={() => setExpanded(!expanded)} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text variant="caption" color={theme.colors.primary[500]} fontWeight="600" style={{ marginTop: theme.spacing[1] }}>
              {expanded ? "Show less" : "Read more"}
            </Text>
          </Pressable>
        )}

        {/* Timestamp */}
        <Text variant="caption" color={isCoach ? theme.colors.text.tertiary : `${theme.colors.text.inverse}80`} style={{ marginTop: theme.spacing[1] }}>
          {formatTime(message.createdAt)}
        </Text>

        {/* Action Button (if message has action taken) */}
        {message.actionTaken && (
          <Pressable
            onPress={() => onActionPress?.(message.actionTaken || "")}
            style={{
              backgroundColor: isCoach ? theme.colors.primary[500] : theme.colors.background.primary,
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[2],
              borderRadius: theme.borderRadius.lg,
              marginTop: theme.spacing[2],
              alignSelf: "flex-start",
            }}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text variant="bodySmall" color={isCoach ? theme.colors.text.inverse : theme.colors.text.primary} fontWeight="600">
              {message.actionTaken}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * System message bubble (centered, distinct styling)
 * Used for: milestones, streak alerts, notifications
 */
export interface SystemMessageBubbleProps {
  message: CoachMessage;
  index?: number;
}

export function SystemMessageBubble({ message, index = 0 }: SystemMessageBubbleProps): JSX.Element {
  const { theme } = useTheme();

  // Get icon based on category
  const getCategoryIcon = () => {
    switch (message.category) {
      case "STREAK_RISK":
        return "🔥";
      case "MILESTONE_HYPE":
        return "🎉";
      case "SESSION_SUGGESTION":
        return "💡";
      case "COMEBACK_SUPPORT":
        return "💪";
      case "POST_FAILURE":
        return "🌱";
      default:
        return "📢";
    }
  };

  // Get background color based on category
  const getCategoryColor = () => {
    switch (message.category) {
      case "STREAK_RISK":
        return theme.colors.error[500];
      case "MILESTONE_HYPE":
        return theme.colors.success[500];
      case "SESSION_SUGGESTION":
        return theme.colors.primary[500];
      case "COMEBACK_SUPPORT":
        return theme.colors.warning[500];
      default:
        return theme.colors.accent.purple;
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400)
        .delay(index * 100)
        .springify()}
      style={{
        alignSelf: "center",
        alignItems: "center",
        marginVertical: theme.spacing[3],
        maxWidth: "80%",
      }}
    >
      <Animated.View
        style={{
          backgroundColor: `${getCategoryColor()}15`,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          alignItems: "center",
          borderWidth: 1,
          borderColor: `${getCategoryColor()}30`,
        }}
      >
        <Text fontSize={24} style={{ marginBottom: theme.spacing[1] }}>
          {getCategoryIcon()}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary} textAlign="center" fontWeight="500">
          {message.content}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * User message bubble (right-aligned)
 */
export interface UserMessageBubbleProps {
  content: string;
  timestamp: number;
  index?: number;
}

export function UserMessageBubble({ content, timestamp, index = 0 }: UserMessageBubbleProps): JSX.Element {
  const { theme } = useTheme();

  const formatTime = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400)
        .delay(index * 100)
        .springify()}
      style={{
        alignSelf: "flex-end",
        maxWidth: "80%",
        marginBottom: theme.spacing[3],
      }}
    >
      <Animated.View
        style={{
          backgroundColor: theme.colors.primary[500],
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          borderBottomRightRadius: 4,
        }}
      >
        <Text variant="body" color={theme.colors.text.inverse}>
          {content}
        </Text>
        <Text variant="caption" color={`${theme.colors.text.inverse}80`} style={{ marginTop: theme.spacing[1] }}>
          {formatTime(timestamp)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export default CoachMessageBubble;
