import { captureSilentFailure } from "../../../utils/silent-failure";
import React, { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ContentStudyStackParamList } from "../types";
import { useContentReview } from "../hooks";
import { CONTENT_STATUS_CONFIG, UI_TEXT, ERROR_MESSAGES } from "../constants";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";
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
    } catch (error) {
      captureSilentFailure(error, {
        feature: "content-study",
        operation: "ui-fallback",
        type: "ui",
      });
    }
  }, [generate, navigation]);
  const renderStatus = () => {
    if (!content) {
      return null;
    }
    const config = CONTENT_STATUS_CONFIG[content.status];
    return (
      <View
        style={[
          styles.statusContainer,
          {
            backgroundColor: `${config.color}20`,
            borderColor: `${config.color}40`,
          },
        ]}
      >
        <ActivityIndicator
          color={config.color}
          animating={config.isLoading}
          style={!config.isLoading && styles.hidden}
        />
        <Text style={[styles.statusLabel, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={styles.statusDescription}>{config.description}</Text>
      </View>
    );
  };
  const renderContent = () => {
    if (!content) {
      return null;
    }
    const textToShow = isEditing
      ? editedText
      : content.userEditedText || content.extractedText;
    return (
      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Extracted Content</Text>
          <Text style={styles.contentStats}>
            {(content.isUserEdited ? editedText : content.extractedText)
              ?.length || 0}{" "}
            characters
          </Text>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.contentEditInput}
            multiline
            value={editedText}
            onChangeText={setEditedText}
            textAlignVertical="top"
            autoFocus
          />
        ) : (
          <ScrollView style={styles.contentScroll} nestedScrollEnabled>
            <Text style={styles.contentText}>{textToShow}</Text>
          </ScrollView>
        )}

        <View style={styles.editActions}>
          {isEditing ? (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={cancelEditing}
                accessibilityLabel="Cancel button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={saveEdits}
                accessibilityLabel="Save button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text style={styles.saveButtonText}>{UI_TEXT.SAVE_BUTTON}</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={startEditing}
              accessibilityLabel="Edit button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text style={styles.editButtonText}>{UI_TEXT.EDIT_BUTTON}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };
  const renderError = () => {
    if (!isFailed || !content?.errorMessage) {
      return null;
    }
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Processing Failed</Text>
        <Text style={styles.errorText}>{content.errorMessage}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => void refetch()}
          accessibilityLabel="Try Again button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  };
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
        {}
        <View style={styles.header}>
          <Text style={styles.title}>{UI_TEXT.REVIEW_TITLE}</Text>
          <Text style={styles.subtitle}>{UI_TEXT.REVIEW_SUBTITLE}</Text>
        </View>

        {}
        {renderStatus()}

        {}
        {renderError()}

        {}
        {isExtracted && renderContent()}

        {}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {}
        {canGenerate && !isEditing && (
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              isGenerating && styles.generateButtonDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleGenerate}
            disabled={isGenerating}
            accessibilityLabel="Generate button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
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

        {}
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
const styles = createSheet({
  container: { flex: 1, backgroundColor: launchColors.hex_0f0f0f },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: launchColors.hex_ffffff,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: launchColors.hex_9ca3af },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: launchColors.hex_9ca3af },
  statusContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  statusLabel: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  statusDescription: {
    fontSize: 14,
    color: launchColors.hex_9ca3af,
    marginTop: 4,
    textAlign: "center",
  },
  hidden: { opacity: 0 },
  contentContainer: {
    backgroundColor: launchColors.hex_1a1a1a,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: launchColors.hex_2a2a2a,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: launchColors.hex_2a2a2a,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: launchColors.hex_ffffff,
  },
  contentStats: { fontSize: 12, color: launchColors.hex_9ca3af },
  contentScroll: { maxHeight: 300 },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: launchColors.hex_d1d5db,
    padding: 16,
  },
  contentEditInput: {
    fontSize: 14,
    lineHeight: 22,
    color: launchColors.hex_ffffff,
    padding: 16,
    minHeight: 300,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: launchColors.hex_2a2a2a,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: launchColors.hex_2a2a2a,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: launchColors.hex_ffffff,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: launchColors.hex_2a2a2a,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: launchColors.hex_9ca3af,
  },
  saveButton: {
    flex: 1,
    backgroundColor: launchColors.hex_3b82f6,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: launchColors.hex_ffffff,
  },
  generateButton: {
    backgroundColor: launchColors.hex_3b82f6,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  generateButtonDisabled: { opacity: 0.7 },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: launchColors.hex_ffffff,
  },
  buttonSpinner: { marginRight: 8 },
  processingNote: { marginTop: 16, alignItems: "center" },
  processingNoteText: { fontSize: 14, color: launchColors.hex_9ca3af },
  errorContainer: {
    backgroundColor: launchColors.hex_ef444420,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: launchColors.hex_ef444440,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: launchColors.hex_ef4444,
    marginBottom: 8,
  },
  errorText: { fontSize: 14, color: launchColors.hex_ef4444 },
  retryButton: {
    marginTop: 12,
    backgroundColor: launchColors.hex_ef444440,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: launchColors.hex_ffffff,
  },
});
