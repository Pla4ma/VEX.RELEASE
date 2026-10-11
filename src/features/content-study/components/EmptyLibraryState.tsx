import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import { Skeleton } from './SkeletonCard';
import { StudyPathCta } from './StudyPathCta';

interface EmptyLibraryStateProps {
  isLoading: boolean;
  error: string | null;
  hasContent: boolean;
  hasFilteredResults: boolean;
  onRetry: () => void;
  onAddContent: () => void;
  uploadLocked?: boolean;
  lockedMessage?: string | null;
  errorTitle?: string;
}

export function EmptyLibraryState({
  isLoading,
  error,
  hasContent,
  hasFilteredResults,
  onRetry,
  onAddContent,
  uploadLocked = false,
  lockedMessage = null,
  errorTitle,
}: EmptyLibraryStateProps): JSX.Element | null {
  const { theme: _theme } = useTheme();

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={`item-${i}`} mb="sm">
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
          color={vexFire.danger}
        />
        <Text variant="body" color={vexFire.danger} mt="md" textAlign="center">
          {errorTitle ?? (hasContent ? 'Could not refresh your Study Library' : 'Study access needs a retry')}
        </Text>
        <Text
          variant="caption"
          color={vexFire.textSecondary}
          mt="xs"
          textAlign="center"
        >
          {error}
        </Text>
        <Button variant="outline"
          size="sm"
          mt="md"
          onPress={onRetry}
          accessibilityLabel="Retry loading library"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <VexText>Try Again</VexText>
        </Button>
      </Box>
    );
  }

  if (!hasFilteredResults) {
    return (
      <Box alignItems="center" py="xl">
        <Icon name="book" size={48} color={vexFire.textMuted} />
        <Text
          variant="body"
          color={vexFire.textSecondary}
          mt="md"
          textAlign="center"
        >
          {hasContent
            ? 'No content matches your filters'
            : uploadLocked
              ? (lockedMessage ?? 'Complete a focused study session to open content tools.')
              : 'No study content yet'}
        </Text>
        {!hasContent && !uploadLocked && (
          <Button variant="primary"
            size="sm"
            mt="md"
            onPress={onAddContent}
            accessibilityLabel="Add first content"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Add Your First Content</VexText>
          </Button>
        )}
        {!hasContent && uploadLocked ? <StudyPathCta /> : null}
      </Box>
    );
  }

  return null;
}
