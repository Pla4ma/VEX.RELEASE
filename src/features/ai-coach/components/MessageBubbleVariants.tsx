import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { CoachMessage } from '../types';

export interface SystemMessageBubbleProps {
  message: CoachMessage;
  index?: number;
}

export function SystemMessageBubble({
  message,
  index = 0,
}: SystemMessageBubbleProps): React.ReactNode {
  const { theme } = useTheme();
  const getCategoryIcon = () => {
    switch (message.category) {
      case 'STREAK_RISK':
        return '';
      case 'MILESTONE_HYPE':
        return '';
      case 'SESSION_SUGGESTION':
        return '';
      case 'COMEBACK_SUPPORT':
        return '';
      case 'POST_FAILURE':
        return '';
      default:
        return '';
    }
  };
  const getCategoryColor = () => {
    switch (message.category) {
      case 'STREAK_RISK':
        return theme.colors.error[500];
      case 'MILESTONE_HYPE':
        return theme.colors.success[500];
      case 'SESSION_SUGGESTION':
        return theme.colors.primary[500];
      case 'COMEBACK_SUPPORT':
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
        alignSelf: 'center',
        alignItems: 'center',
        marginVertical: theme.spacing[3],
        maxWidth: '80%',
      }}
    >
      <Animated.View
        style={{
          backgroundColor: `${getCategoryColor()}15`,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${getCategoryColor()}30`,
        }}
      >
        <Text fontSize={24} style={{ marginBottom: theme.spacing[1] }}>
          {getCategoryIcon()}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.colors.text.secondary}
          textAlign="center"
          fontWeight="500"
        >
          {message.content}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export interface UserMessageBubbleProps {
  content: string;
  timestamp: number;
  index?: number;
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function UserMessageBubble({
  content,
  timestamp,
  index = 0,
}: UserMessageBubbleProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Animated.View
      entering={FadeInUp.duration(400)
        .delay(index * 100)
        .springify()}
      style={{
        alignSelf: 'flex-end',
        maxWidth: '80%',
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
        <Text
          variant="caption"
          color={`${theme.colors.text.inverse}80`}
          style={{ marginTop: theme.spacing[1] }}
        >
          {formatTime(timestamp)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
