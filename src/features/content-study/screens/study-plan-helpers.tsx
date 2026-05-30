import React from "react";
import { View, Text, Pressable } from "react-native";
import { RouteProp } from "@react-navigation/native";
import type {
  ContentStudyStackParamList,
  StudyGeneration,
  QuizItem,
  SessionPlan,
} from "../types";
import { UI_TEXT, TASK_PRIORITY_CONFIG, QUIZ_DIFFICULTY_CONFIG } from "../constants";
import { useTheme } from "@/theme";
import { launchColors } from "@theme/tokens/launch-colors";
import { styles } from "./StudyPlanScreen.styles";

export type RouteProps = RouteProp<ContentStudyStackParamList, "StudyPlan">;
export type NavigationProp = { navigate: (screen: string, params?: unknown) => void; goBack: () => void };

export function Icon({ name: _name, color }: { name: string; color?: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.icon, { color: color ?? theme.colors.text.secondary }]}>◊</Text>;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function SummarySection({ generation }: { generation: StudyGeneration }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{UI_TEXT.SUMMARY_SECTION}</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{generation.summary.overview}</Text>
        <View style={styles.keyConcepts}>
          {generation.keyConcepts.map((concept) => (
            <View key={concept.id} style={styles.conceptTag}>
              <Text style={styles.conceptText}>{concept.term}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function TasksSection({ generation }: { generation: StudyGeneration }) {
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
            <Text style={styles.taskEstimate}>{task.estimatedMinutes} {UI_TEXT.TASK_ESTIMATED}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function QuizSection({ quizItems, revealedAnswers, toggleAnswer }: {
  quizItems: QuizItem[]; revealedAnswers: Set<string>; toggleAnswer: (quizId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{UI_TEXT.QUIZ_SECTION}</Text>
      {quizItems.map((item, index) => {
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
            <Pressable
              style={({ pressed }) => [styles.answerToggle, pressed && { opacity: 0.8 }]}
              onPress={() => toggleAnswer(item.id)}
              accessibilityLabel="Toggle answer button"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text style={styles.answerToggleText}>
                {isRevealed ? UI_TEXT.QUIZ_HIDE_ANSWER : UI_TEXT.QUIZ_SHOW_ANSWER}
              </Text>
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
}

export function SessionPlanSection({ sessionPlan }: { sessionPlan: SessionPlan }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{UI_TEXT.SESSION_SECTION}</Text>
      <View style={styles.sessionCard}>
        <View style={styles.sessionRow}>
          <Icon name="clock" color={launchColors.hex_3b82f6} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionLabel}>{UI_TEXT.SESSION_DURATION}</Text>
            <Text style={styles.sessionValue}>{formatDuration(sessionPlan.recommendedDuration)}</Text>
          </View>
        </View>
        <View style={styles.sessionRow}>
          <Icon name="trending-up" color={launchColors.hex_10b981} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionLabel}>{UI_TEXT.SESSION_DIFFICULTY}</Text>
            <Text style={styles.sessionValue}>{sessionPlan.suggestedDifficulty}</Text>
          </View>
        </View>
        <View style={styles.sessionRow}>
          <Icon name="target" color={launchColors.hex_f59e0b} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionLabel}>{UI_TEXT.SESSION_FOCUS_AREAS}</Text>
            <View style={styles.focusAreas}>
              {sessionPlan.focusAreas.map((area, index) => (
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
}

export function RatingSection({ userRating, setUserRating }: {
  userRating: number | null; setUserRating: (rating: number) => void;
}) {
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
          <Pressable
            key={star}
            style={({ pressed }) => [styles.starButton, pressed && { opacity: 0.8 }]}
            onPress={() => setUserRating(star)}
            accessibilityLabel={`Rate ${star} stars`}
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={[styles.star, userRating && star <= userRating && styles.starFilled]}>★</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
