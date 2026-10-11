import { vexFire } from "@/theme/tokens/vex-fire";
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { buttonTap } from '../../../utils/haptics';
import type { CoachMessage } from '../types';

export interface CoachMessageBubbleProps {
  message: CoachMessage;
  isCoach?: boolean;
  index?: number;
  onActionPress?: (action: string) => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getPersonaEmoji(): string {
  return '';
}

export function CoachMessageBubble({
  message,
  isCoach = true,
  index = 0,
  onActionPress,
}: CoachMessageBubbleProps): React.ReactNode {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isLongMessage = message.content.length > 200;
  const displayContent =
    expanded || !isLongMessage
      ? message.content
      : message.content.slice(0, 200) + '...';

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
            backgroundColor: vexFire.ember,
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
            ? vexFire.panel
            : vexFire.ember,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          borderBottomLeftRadius: isCoach ? 4 : theme.borderRadius.xl,
          borderBottomRightRadius: isCoach ? theme.borderRadius.xl : 4,
        }}
      >
        <Text
          variant="body"
          color={
            isCoach ? vexFire.cream : vexFire.cream
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
              color={vexFire.ember}
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
              ? vexFire.textMuted
              : `${vexFire.cream}80`
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
                ? vexFire.ember
                : vexFire.background,
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
                isCoach ? vexFire.cream : vexFire.cream
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
