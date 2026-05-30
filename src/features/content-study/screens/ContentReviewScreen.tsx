/**
 * ContentReviewScreen
 * Main screen for reviewing extracted content before study plan generation.
 */

import { captureSilentFailure } from "../../../utils/silent-failure";
import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ContentStudyStackParamList } from "../types";
import { useContentReview } from "../hooks";
import { UI_TEXT } from "../constants";
import { launchColors } from "@theme/tokens/launch-colors";
import { styles } from "./ContentReviewScreen.styles";
import { StatusBadge, ContentView, ErrorDisplay } from "./ContentReviewScreen.helpers";

type RouteProps = RouteProp<ContentStudyStackParamList, "ContentReview">;
type NavigationProp = {
  navigate: (
    screen: keyof ContentStudyStackParamList,
    params?: unknown,
  ) => void;
  goBack: () => void;
};

export function ContentReviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { contentId } = route.params;
  const {
    content,
    editedText,
    isEditing,
    isGenerating,
    isLoading,
    error,
    canGenerate,
    isProcessing,
    isExtracted,
    isFailed,
    startEditing,
    cancelEditing,
    setEditedText,
    saveEdits,
    generate,
    refetch,
  } = useContentReview(contentId);

  const handleGenerate = useCallback(async () => {
    try {
      const result = await generate();
      navigation.navigate("StudyPlan", {
        generationId: result.generationId,
        contentId: result.contentId,
      });
    } catch (err) {
      captureSilentFailure(err, {
        feature: "content-study",
        operation: "ui-fallback",
        type: "ui",
      });
    }
  }, [generate, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={launchColors.hex_3b82f6} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{UI_TEXT.REVIEW_TITLE}</Text>
          <Text style={styles.subtitle}>{UI_TEXT.REVIEW_SUBTITLE}</Text>
        </View>

        {content && <StatusBadge content={content} />}

        {isFailed && content?.errorMessage && (
          <ErrorDisplay
            errorMessage={content.errorMessage}
            onRetry={() => void refetch()}
          />
        )}

        {isExtracted && content && (
          <ContentView
            content={content}
            isEditing={isEditing}
            editedText={editedText}
            onTextChanged={setEditedText}
            onSave={saveEdits}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
          />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {canGenerate && !isEditing && (
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              isGenerating && styles.generateButtonDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleGenerate}
            disabled={isGenerating}
            accessibilityLabel="Generate study content"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={launchColors.hex_fff} />
            ) : (
              <Text style={styles.generateButtonText}>
                {UI_TEXT.GENERATE_BUTTON}
              </Text>
            )}
          </Pressable>
        )}

        {isProcessing && (
          <View style={styles.processingNote}>
            <Text style={styles.processingNoteText}>
              {isExtracted
                ? "AI is analyzing your content..."
                : "Extracting content from source..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
