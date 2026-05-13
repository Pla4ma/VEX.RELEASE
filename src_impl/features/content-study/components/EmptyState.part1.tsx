import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { Icon } from "../../../icons";
import { createSheet } from "@/shared/ui/create-sheet";


export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background.secondary },
        ]}
      >
        <Icon name={icon} size="2xl" color={theme.colors.primary[500]} />
      </View>

      <Text
        style={[styles.title, { color: theme.colors.text.primary }]}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <Text
        style={[styles.description, { color: theme.colors.text.secondary }]}
      >
        {description}
      </Text>

      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.actionButton}
          accessibilityLabel="Action button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          {actionLabel}
        </Button>
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <Pressable
          onPress={onSecondaryAction}
          style={({ pressed }) => [
            styles.secondaryAction,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text
            style={[
              styles.secondaryText,
              { color: theme.colors.primary[500] },
            ]}
          >
            {secondaryActionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export const NoHistoryEmptyState: React.FC<{ onCreate: () => void }> = ({
  onCreate,
}) => (
  <EmptyState
    icon="file-text"
    title="No Study Content Yet"
    description="Paste text, upload a PDF, or enter a YouTube URL to create your first study plan."
    actionLabel="Create Study Plan"
    onAction={onCreate}
    testID="no-history-empty-state"
  />
);

export const NoDraftsEmptyState: React.FC<{ onCreate: () => void }> = ({
  onCreate,
}) => (
  <EmptyState
    icon="save"
    title="No Saved Drafts"
    description="Your drafts will appear here. Start creating and we'll auto-save your progress."
    actionLabel="Start New"
    onAction={onCreate}
    testID="no-drafts-empty-state"
  />
);

export const OfflineEmptyState: React.FC<{ onRetry: () => void }> = ({
  onRetry,
}) => (
  <EmptyState
    icon="wifi-off"
    title="You're Offline"
    description="Your changes will be saved locally and synced when you reconnect."
    actionLabel="Try Again"
    onAction={onRetry}
    testID="offline-empty-state"
  />
);

export const ErrorEmptyState: React.FC<{
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <EmptyState
    icon="alert-circle"
    title="Something Went Wrong"
    description={message}
    actionLabel="Try Again"
    onAction={onRetry}
    testID="error-empty-state"
  />
);