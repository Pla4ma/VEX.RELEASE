import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ChatMessage } from './coach-chat-types';
import { buttonTap } from '../../../utils/haptics';
import { getPersonalityEmoji } from './coach-helpers';
import { styles } from './CoachScreen.styles';

interface ChatMessageItemProps {
  message: ChatMessage;
  personaId?: string | null;
  onActionPress: (message: ChatMessage) => void;
}

export function ChatMessageItem({
  message,
  personaId,
  onActionPress,
}: ChatMessageItemProps): JSX.Element {
  const isCoach = message.type === 'coach';
  const isUser = message.type === 'user';

  return (
    <View
      style={[
        styles.messageContainer,
        isCoach
          ? styles.coachMessageContainer
          : isUser
            ? styles.userMessageContainer
            : styles.systemMessageContainer,
      ]}
    >
      {isCoach && (
        <View style={styles.coachAvatar}>
          <Text style={styles.coachAvatarText}>
            {getPersonalityEmoji(personaId)}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          isCoach
            ? styles.coachBubble
            : isUser
              ? styles.userBubble
              : styles.systemBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isCoach
              ? styles.coachText
              : isUser
                ? styles.userText
                : styles.systemText,
          ]}
        >
          {message.content}
        </Text>

        {message.metadata?.hasAction && message.metadata.actionLabel && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => { buttonTap(); onActionPress(message); }}
            accessibilityLabel={message.metadata?.actionLabel ?? 'Coach action'}
            accessibilityRole="button"
            accessibilityHint="Double tap to perform action"
          >
            <Text style={styles.actionButtonText}>
              {message.metadata.actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
