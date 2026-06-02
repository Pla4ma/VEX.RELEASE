import React, { useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { styles } from './CoachScreen.styles';

import type { ChatMessage } from './coach-chat-types';
import {
  getPersonalityName,
  getPersonalityEmoji,
  formatState,
  getStateColor,
} from './coach-helpers';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInputBar } from './ChatInputBar';
import { CoachRecommendationCard } from './CoachRecommendationCard';
import { useCoachChat } from './useCoachChat';

export function CoachScreen(): JSX.Element {
  const {
    flashListRef,
    inputText,
    setInputText,
    chatMessages,
    isTyping,
    error,
    setError,
    handleSend,
    handleActionPress,
    coachState,
    stateLoading,
    historyLoading,
    recommendation,
  } = useCoachChat();

  const renderMessage: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => (
      <ChatMessageItem
        message={item}
        personaId={coachState?.personaId}
        onActionPress={handleActionPress}
      />
    ),
    [coachState?.personaId, handleActionPress],
  );

  if (stateLoading || historyLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ height: 44 }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={'#6366f1'} />
          <Text style={styles.loadingText}>Loading your coach...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 44 }} />
      <View style={styles.header}>
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>
            {getPersonalityName(coachState?.personaId)}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {formatState(coachState?.currentState)}
            </Text>
          </View>
        </View>
        <View style={styles.stateIndicator}>
          <View
            style={[
              styles.stateDot,
              { backgroundColor: getStateColor(coachState?.currentState) },
            ]}
          />
          <Text style={styles.stateLabel}>Active</Text>
        </View>
      </View>

      {recommendation && (
        <CoachRecommendationCard recommendation={recommendation} />
      )}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlashList
          ref={flashListRef}
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={(item: ChatMessage) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={true}
          estimatedItemSize={80}
          onContentSizeChange={() => {
            flashListRef.current?.scrollToEnd({ animated: false });
          }}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.coachAvatarSmall}>
              <Text style={styles.coachAvatarTextSmall}>
                {getPersonalityEmoji(coachState?.personaId)}
              </Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={'#6366f1'} />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={() => setError(null)}
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
              accessibilityLabel="Dismiss coach"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={!inputText.trim() || isTyping}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default CoachScreen;
