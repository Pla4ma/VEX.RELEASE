import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStudyPlan } from '../hooks';
import { UI_TEXT } from '../constants';
import { useNetInfo } from '../../../network/useNetInfo';
import { lightColors } from '@/theme/tokens/colors';

import { styles } from './StudyPlanScreen.styles';
import {
  type RouteProps,
  type NavigationProp,
  SummarySection,
  TasksSection,
  QuizSection,
  SessionPlanSection,
  RatingSection,
} from './study-plan-helpers';

export function StudyPlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { generationId, contentId } = route.params;
  const {
    generation,
    content,
    isLoading,
    isStartingSession,
    error,
    startSession,
  } = useStudyPlan(generationId);
  const { isOffline } = useNetInfo();
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [userRating, setUserRating] = useState<number | null>(null);

  const toggleAnswer = useCallback((quizId: string) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(quizId)) {
        next.delete(quizId);
      } else {
        next.add(quizId);
      }
      return next;
    });
  }, []);

  const handleStartSession = useCallback(async () => {
    const sessionConfig = await startSession();
    if (sessionConfig && generation) {
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: {
          suggestedDurationSeconds: sessionConfig.duration,
          suggestedDifficulty: sessionConfig.difficulty,
          goal: sessionConfig.goal,
          focusAreas: generation.keyConcepts.slice(0, 3),
          sessionCategory: sessionConfig.category,
          sessionTags: sessionConfig.tags,
          source: 'content-study',
          generationId,
          studyPlanId: generationId,
          contentId,
        },
      });
    }
  }, [contentId, generation, generationId, navigation, startSession]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {isOffline ? (
          <View style={{
            backgroundColor: lightColors.warning.light,
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '500',
              color: lightColors.warning[500],
            }}>
              You are offline. Study plan generation requires a connection.
            </Text>
          </View>
        ) : null}
        <View style={styles.loadingContainer}>
          <Skeleton width={60} height={20} variant="rounded" />
          <Text style={styles.loadingText}>Loading study plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {isOffline ? (
          <View style={{
            backgroundColor: lightColors.warning.light,
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '500',
              color: lightColors.warning[500],
            }}>
              You are offline. Study plan generation requires a connection.
            </Text>
          </View>
        ) : null}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen"
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isOffline ? (
        <View style={{
          backgroundColor: lightColors.warning.light,
          paddingVertical: 8,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: lightColors.warning[500],
          }}>
            You are offline. Study plan generation requires a connection.
          </Text>
        </View>
      ) : null}
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{UI_TEXT.PLAN_TITLE}</Text>
          {content?.title && <Text style={styles.subtitle}>{content.title}</Text>}
        </View>
        {generation && <SummarySection generation={generation} />}
        {generation && <SessionPlanSection sessionPlan={generation.sessionPlan} />}
        {generation && <TasksSection generation={generation} />}
        {generation && (
          <QuizSection
            quizItems={generation.quizItems}
            revealedAnswers={revealedAnswers}
            toggleAnswer={toggleAnswer}
          />
        )}
        <RatingSection userRating={userRating} setUserRating={setUserRating} />
        <View style={styles.bottomSpacer} />
      </ScrollView>
      <View style={styles.fabContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            isStartingSession && styles.fabDisabled,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleStartSession}
          disabled={isStartingSession}
          accessibilityLabel="Start study session"
          accessibilityRole="button"
          accessibilityHint="Starts a study session from this plan"
        >
          {isStartingSession ? (
            <Skeleton width={20} height={20} variant="circular" />
          ) : (
            <>
              <Text style={styles.fabText}>▶</Text>
              <Text style={styles.fabText}>{UI_TEXT.INPUT_TITLE}</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
