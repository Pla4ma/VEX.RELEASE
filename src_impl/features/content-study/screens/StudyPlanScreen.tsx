/**
 * Study Plan Screen
 * Displays AI-generated study plan with tasks and quiz
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ContentStudyStackParamList, SessionPlan } from '../types';
import { useStudyPlan } from '../hooks';
import { UI_TEXT, TASK_PRIORITY_CONFIG, QUIZ_DIFFICULTY_CONFIG } from '../constants';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '@/theme';

type RouteProps = RouteProp<ContentStudyStackParamList, 'StudyPlan'>;
type NavigationProp = {
  navigate: (screen: string, params?: unknown) => void;
  goBack: () => void;
};

// Icon component - name is for future icon variants, currently uses placeholder
const Icon = ({ name: _name, color }: { name: string; color?: string }) => {
  const { theme } = useTheme();
  return <Text style={[styles.icon, { color: color ?? theme.colors.text.secondary }]}>◊</Text>;
};

export function StudyPlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { generationId, contentId } = route.params;

  const { generation, content, isLoading, isStartingSession, error, startSession } = useStudyPlan(generationId);

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

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderSummary = () => {
    if (!generation) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{UI_TEXT.SUMMARY_SECTION}</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{generation.summary.overview}</Text>
          <View style={styles.keyConcepts}>
            {generation.keyConcepts.map((concept, index) => (
              <View key={concept.id} style={styles.conceptTag}>
                <Text style={styles.conceptText}>{concept.term}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTasks = () => {
    if (!generation) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{UI_TEXT.TASKS_SECTION}</Text>
        {generation.tasks.map((task, index) => {
          const priority = TASK_PRIORITY_CONFIG[task.priority];
          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskNumber}>{index + 1}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: `${priority.color}20` }]}>
                  <Text style={[styles.priorityText, { color: priority.color }]}>{task.priority}</Text>
                </View>
              </View>
              <Text style={styles.taskContent}>{task.content}</Text>
              <Text style={styles.taskEstimate}>
                {task.estimatedMinutes} {UI_TEXT.TASK_ESTIMATED}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderQuiz = () => {
    if (!generation) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{UI_TEXT.QUIZ_SECTION}</Text>
        {generation.quizItems.map((item, index) => {
          const isRevealed = revealedAnswers.has(item.id);
          const difficulty = QUIZ_DIFFICULTY_CONFIG[item.difficulty];

          return (
            <View key={item.id} style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Text style={styles.quizNumber}>Q{index + 1}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: `${difficulty.color}20` }]}>
                  <Text style={[styles.difficultyText, { color: difficulty.color }]}>{item.difficulty}</Text>
                </View>
              </View>

              <Text style={styles.quizQuestion}>{item.question}</Text>

              {/* Multiple choice options */}
              {item.options && item.options.length > 0 && (
                <View style={styles.optionsList}>
                  {item.options.map((option, optIndex) => (
                    <View key={optIndex} style={styles.optionItem}>
                      <Text style={styles.optionLabel}>{String.fromCharCode(65 + optIndex)}.</Text>
                      <Text style={styles.optionText}>{option}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Answer toggle */}
              <Pressable style={({ pressed }) => [styles.answerToggle, pressed && { opacity: 0.8 }]} onPress={() => toggleAnswer(item.id)} accessibilityLabel="Toggle answer button" accessibilityRole="button" accessibilityHint="Activates this control">
                <Text style={styles.answerToggleText}>{isRevealed ? UI_TEXT.QUIZ_HIDE_ANSWER : UI_TEXT.QUIZ_SHOW_ANSWER}</Text>
              </Pressable>

              {isRevealed && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerLabel}>Answer:</Text>
                  <Text style={styles.answerText}>{item.answer}</Text>
                  {item.explanation && (
                    <>
                      <Text style={styles.explanationLabel}>{UI_TEXT.QUIZ_EXPLANATION}:</Text>
                      <Text style={styles.explanationText}>{item.explanation}</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderSessionPlan = () => {
    if (!generation) {
      return null;
    }
    const plan = generation.sessionPlan;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{UI_TEXT.SESSION_SECTION}</Text>
        <View style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <Icon name="clock" color="#3B82F6" />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>{UI_TEXT.SESSION_DURATION}</Text>
              <Text style={styles.sessionValue}>{formatDuration(plan.recommendedDuration)}</Text>
            </View>
          </View>

          <View style={styles.sessionRow}>
            <Icon name="trending-up" color="#10B981" />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>{UI_TEXT.SESSION_DIFFICULTY}</Text>
              <Text style={styles.sessionValue}>{plan.suggestedDifficulty}</Text>
            </View>
          </View>

          <View style={styles.sessionRow}>
            <Icon name="target" color="#F59E0B" />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>{UI_TEXT.SESSION_FOCUS_AREAS}</Text>
              <View style={styles.focusAreas}>
                {plan.focusAreas.map((area, index) => (
                  <View key={index} style={styles.focusAreaTag}>
                    <Text style={styles.focusAreaText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRating = () => {
    if (userRating !== null) {
      return (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingThanks}>{UI_TEXT.FEEDBACK_THANKS}</Text>
        </View>
      );
    }

    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>{UI_TEXT.RATE_PLAN_TITLE}</Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} style={({ pressed }) => [styles.starButton, pressed && { opacity: 0.8 }]} onPress={() => setUserRating(star)} accessibilityLabel={`Rate ${star} stars`} accessibilityRole="button" accessibilityHint="Activates this control">
              <Text style={[styles.star, userRating && star <= userRating && styles.starFilled]}>★</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
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
          <Pressable style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.8 }]} onPress={() => navigation.goBack()} accessibilityLabel="Go Back button" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{UI_TEXT.PLAN_TITLE}</Text>
          {content?.title && <Text style={styles.subtitle}>{content.title}</Text>}
        </View>

        {/* Summary */}
        {renderSummary()}

        {/* Session Plan */}
        {renderSessionPlan()}

        {/* Tasks */}
        {renderTasks()}

        {/* Quiz */}
        {renderQuiz()}

        {/* Rating */}
        {renderRating()}

        {/* Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Pressable style={({ pressed }) => [styles.fab, isStartingSession && styles.fabDisabled, pressed && { opacity: 0.8 }]} onPress={handleStartSession} disabled={isStartingSession} accessibilityLabel="Start session button" accessibilityRole="button" accessibilityHint="Activates this control">
          {isStartingSession ? (
            <ActivityIndicator size="small" color="#fff" />
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

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  keyConcepts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conceptTag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conceptText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  taskCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskContent: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  taskEstimate: {
    fontSize: 13,
    color: '#6B7280',
  },
  quizCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quizQuestion: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  optionsList: {
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    width: 24,
  },
  optionText: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
  },
  answerToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  answerToggleText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  answerLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 12,
  },
  explanationLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  sessionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  focusAreaTag: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  focusAreaText: {
    fontSize: 12,
    color: '#F59E0B',
  },
  ratingContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 32,
    color: '#3A3A3A',
  },
  starFilled: {
    color: '#F59E0B',
  },
  ratingThanks: {
    fontSize: 16,
    color: '#10B981',
  },
  bottomSpacer: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  fab: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDisabled: {
    opacity: 0.7,
  },
  fabText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  icon: {
    fontSize: 20,
  },
});
