import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStudyPlan } from '../hooks';
import { UI_TEXT } from '../constants';

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={'#3b82f6'} />
          <Text style={styles.loadingText}>Loading study plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
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
            <ActivityIndicator size="small" color={'#fff'} />
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
