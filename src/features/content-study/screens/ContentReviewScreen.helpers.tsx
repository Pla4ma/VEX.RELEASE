/**
 * ContentReviewScreen Helper Components
 *
 * Extracted sub-components for the content review screen.
 * Each component handles a distinct UI section.
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import type { StudyContent } from "../types";
import { CONTENT_STATUS_CONFIG, UI_TEXT } from "../constants";
import { styles } from "./ContentReviewScreen.styles";

/* ─── Status Badge ─── */

interface StatusBadgeProps {
  content: StudyContent;
}

export function StatusBadge({ content }: StatusBadgeProps) {
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
}

/* ─── Content View ─── */

interface ContentViewProps {
  content: StudyContent;
  isEditing: boolean;
  editedText: string;
  onTextChanged: (text: string) => void;
  onSave: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
}

export function ContentView({
  content,
  isEditing,
  editedText,
  onTextChanged,
  onSave,
  onStartEditing,
  onCancelEditing,
}: ContentViewProps) {
  const textToShow = isEditing
    ? editedText
    : content.userEditedText || content.extractedText;

  const charCount = (content.isUserEdited ? editedText : content.extractedText)
    ?.length || 0;

  return (
    <View style={styles.contentContainer}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>Extracted Content</Text>
        <Text style={styles.contentStats}>
          {charCount} characters
        </Text>
      </View>

      {isEditing ? (
        <TextInput
          style={styles.contentEditInput}
          multiline
          value={editedText}
          onChangeText={onTextChanged}
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
              onPress={onCancelEditing}
              accessibilityLabel="Cancel editing"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onSave}
              accessibilityLabel="Save changes"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
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
            onPress={onStartEditing}
            accessibilityLabel="Edit content"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.editButtonText}>{UI_TEXT.EDIT_BUTTON}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ─── Error Display ─── */

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

export function ErrorDisplay({ errorMessage, onRetry }: ErrorDisplayProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Processing Failed</Text>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onRetry}
        accessibilityLabel="Retry processing"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}
