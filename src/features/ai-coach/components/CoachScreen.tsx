import React, { useCallback } from 'react';
import { withScreenErrorBoundary } from '../../../shared/ui/components/ScreenErrorBoundary';
import {
  Image,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '../../../components/ui/Skeleton';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { styles } from './CoachScreen.styles';

import type { ChatMessage } from './coach-chat-types';
import {
  getPersonalityName,
  formatState,
  getStateColor,
} from './coach-helpers';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInputBar } from './ChatInputBar';
import { CoachPromptRail } from './CoachPromptRail';
import { CoachRecommendationCard } from './CoachRecommendationCard';
import { useCoachChat } from './useCoachChat';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { spacing } from '../../../theme/tokens/spacing';
import { navigateToSessionStackScreen } from '../../../navigation/navigation-helpers';
import { scrollCoachListToEnd } from './coach-list-scroll';

const COACH_BACKDROP = require('../../../../assets/vex/coach/chat-background.png');
const COACH_ARTIFACT = require('../../../../assets/vex/coach/coach-artifact.png');


function CoachScreen(): React.ReactNode {
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
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
        onActionPress={handleActionPress}
      />
    ),
    [handleActionPress],
  );

  if (stateLoading || historyLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: vexFire.background }]}>
        <View style={styles.loadingContainer}>
          <Skeleton width={60} height={20} variant="rounded" />
          <Text style={styles.loadingText}>Loading your coach...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: vexFire.background }]}>
      <Image accessibilityIgnoresInvertColors source={COACH_BACKDROP} resizeMode="cover" style={{ bottom: 0, left: 0, opacity: 0.28, position: 'absolute', right: 0, top: 0 }} />
      <View style={styles.header}>
        <Pressable
          accessibilityHint="Returns to the previous screen"
          accessibilityLabel="Close AI Coach"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed ? { opacity: 0.7 } : undefined]}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Image accessibilityIgnoresInvertColors accessibilityLabel="VEX Coach artifact" source={COACH_ARTIFACT} resizeMode="contain" style={styles.coachArtifact} />
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
        <CoachRecommendationCard
          recommendation={recommendation}
          onStartSession={() => navigateToSessionStackScreen(navigation, 'SessionSetup', {
            presetDuration: Math.round(recommendation.duration * 60),
            source: 'rescue',
          })}
        />
      )}

      <CoachPromptRail onSelect={setInputText} />

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
            scrollCoachListToEnd(flashListRef, false);
          }}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.coachAvatarSmall}>
              <Image accessibilityIgnoresInvertColors accessibilityLabel="VEX Coach artifact" source={COACH_ARTIFACT} resizeMode="contain" style={{ height: spacing[6], width: spacing[6] }} />
            </View>
            <View style={styles.typingBubble}>
              <Skeleton width={16} height={16} variant="circular" />
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

const CoachScreenWithBoundary = withScreenErrorBoundary(CoachScreen, 'Coach');
export { CoachScreenWithBoundary as CoachScreen };

export { CoachScreen as default };
