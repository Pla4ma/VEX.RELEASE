import React from "react";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { Icon } from "../../../icons";
import { useTheme } from "../../../theme";
import { Skeleton } from "./SkeletonCard";

interface EmptyLibraryStateProps {
  isLoading: boolean;
  error: string | null;
  hasContent: boolean;
  hasFilteredResults: boolean;
  onRetry: () => void;
  onAddContent: () => void;
}

export function EmptyLibraryState({
  isLoading,
  error,
  hasContent,
  hasFilteredResults,
  onRetry,
  onAddContent,
}: EmptyLibraryStateProps): JSX.Element | null {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} mb="sm">
            <Skeleton height={80} borderRadius={12} />
          </Box>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <Box alignItems="center" py="xl">
        <Icon
          name="alert-circle"
          size={48}
          color={theme.colors.error.DEFAULT}
        />
        <Text variant="body" color="error.DEFAULT" mt="md" textAlign="center">
          Failed to load study library
        </Text>
        <Text
          variant="caption"
          color="text.secondary"
          mt="xs"
          textAlign="center"
        >
          {error}
        </Text>
        <Button
          variant="outline"
          size="sm"
          mt="md"
          onPress={onRetry}
          accessibilityLabel="Try Again button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!hasFilteredResults) {
    return (
      <Box alignItems="center" py="xl">
        <Icon name="book" size={48} color={theme.colors.text.tertiary} />
        <Text
          variant="body"
          color="text.secondary"
          mt="md"
          textAlign="center"
        >
          {hasContent
            ? "No content matches your filters"
            : "No study content yet"}
        </Text>
        {!hasContent && (
          <Button
            variant="primary"
            size="sm"
            mt="md"
            onPress={onAddContent}
            accessibilityLabel="Add Your First Content button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Add Your First Content
          </Button>
        )}
      </Box>
    );
  }

  return null;
}
