import React from 'react';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { StudyPathCta } from './StudyPathCta';

interface StudyLibraryActionProps {
  canUpload: boolean;
  hasContent: boolean;
  isError: boolean;
  isPending: boolean;
  onAddContent: () => void;
  onRetry: () => void;
}

export function StudyLibraryAction({
  canUpload,
  hasContent,
  isError,
  isPending,
  onAddContent,
  onRetry,
}: StudyLibraryActionProps): JSX.Element | null {
  if (isPending || !hasContent) return null;
  if (isError) {
    return (
      <Button
        accessibilityLabel="Retry checking Study access"
        accessibilityRole="button"
        accessibilityHint="Checks whether content upload is available"
        onPress={onRetry}
        size="sm"
        variant="outline"
      >
        <Text>Retry access</Text>
      </Button>
    );
  }
  if (!canUpload) return <StudyPathCta />;

  return (
    <Button
      accessibilityLabel="Add new study content"
      accessibilityRole="button"
      accessibilityHint="Choose notes, a PDF, or a video to study"
      onPress={onAddContent}
      size="sm"
      variant="outline"
    >
      <Text>+ Add New</Text>
    </Button>
  );
}
