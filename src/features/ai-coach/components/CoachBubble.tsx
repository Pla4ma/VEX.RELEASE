import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import { buttonTap } from '../../../utils/haptics';
import type { CoachMessage } from '../types';

export interface CoachMessageBubbleProps {
  message: CoachMessage;
  isCoach?: boolean;
  index?: number;
  onActionPress?: (action: string) => void;
}

export function CoachMessageBubble({
  message,
  isCoach = true,
  index = 0,
  onActionPress,
}: CoachMessageBubbleProps): JSX.Element {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const isLongMessage = message.content.length > 200;
  const displayContent =
    expanded || !isLongMessage
      ? message.content
      : message.content.slice(0, 200) + '...';
  const getPersonaEmoji = () => {
    return '';
  };
  return (
    <Animated.View
      entering={FadeInUp.duration(400)
        .delay(index * 100)
        .springify()}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing[2],
        marginBottom: theme.spacing[3],
        alignSelf: isCoach ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
      }}
    >
      {}
      {isCoach && (
        <Animated.View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primary[500],
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing[1],
          }}
        >
          <Text fontSize={18}>{getPersonaEmoji()}</Text>
        </Animated.View>
      )}

      {}
      <Animated.View
        style={{
          backgroundColor: isCoach
            ? theme.colors.background.secondary
            : theme.colors.primary[500],
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          borderBottomLeftRadius: isCoach ? 4 : theme.borderRadius.xl,
          borderBottomRightRadius: isCoach ? theme.borderRadius.xl : 4,
        }}
      >
        <Text
          variant="body"
          color={
            isCoach ? theme.colors.text.primary : theme.colors.text.inverse
          }
        >
          {displayContent}
        </Text>

        {}
        {isLongMessage && (
          <Pressable
            onPress={() => { buttonTap(); setExpanded(!expanded); }}
            accessibilityLabel={expanded ? 'Show less' : 'Read more'}
            accessibilityRole="button"
            accessibilityHint="Double tap to toggle message length"
          >
            <Text
              variant="caption"
              color={theme.colors.primary[500]}
              fontWeight="600"
              style={{ marginTop: theme.spacing[1] }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          </Pressable>
        )}

        {}
        <Text
          variant="caption"
          color={
            isCoach
              ? theme.colors.text.tertiary
              : `${theme.colors.text.inverse}80`
          }
          style={{ marginTop: theme.spacing[1] }}
        >
          {formatTime(message.createdAt)}
        </Text>

        {}
        {message.actionTaken && (
          <Pressable
            onPress={() => { buttonTap(); onActionPress?.(message.actionTaken || ''); }}
            style={{
              backgroundColor: isCoach
                ? theme.colors.primary[500]
                : theme.colors.background.primary,
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[2],
              borderRadius: theme.borderRadius.lg,
              marginTop: theme.spacing[2],
              alignSelf: 'flex-start',
            }}
            accessibilityLabel={message.actionTaken ?? 'Coach action'}
            accessibilityRole="button"
            accessibilityHint="Double tap to perform action"
          >
            <Text
              variant="bodySmall"
              color={
                isCoach ? theme.colors.text.inverse : theme.colors.text.primary
              }
              fontWeight="600"
            >
              {message.actionTaken}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}
