import React from 'react';
import { AppScreen } from '../../../components/primitives/AppScreen';
import { Box } from '../../../components/primitives/Box';
import { Card } from '../../../components/primitives/Card';
import { Text } from '../../../components/primitives/Text';
import { ErrorState } from '../../../components/states/ErrorState';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { Button } from '../../../components/primitives/Button';
import { Skeleton } from './SkeletonCard';
import { StudyBackButton } from './StudyBackButton';
import { StudyPathCta } from './StudyPathCta';

interface ContentStudyUploadGateProps {
  isError: boolean;
  isPending: boolean;
  message: string | null;
  onBack: () => void;
  onRetry: () => void;
}

export function ContentStudyUploadGate({
  isError,
  isPending,
  message,
  onBack,
  onRetry,
}: ContentStudyUploadGateProps): JSX.Element {
  if (isPending) {
    return (
      <AppScreen variant="focus">
        <StudyBackButton onPress={onBack} />
        <Box gap="md" mt="xl">
          <Skeleton height={28} borderRadius={8} />
          <Skeleton height={96} borderRadius={16} />
          <Skeleton height={48} borderRadius={24} />
        </Box>
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen variant="focus">
        <StudyBackButton onPress={onBack} />
        <ErrorState
          title="Study access needs a moment"
          description="VEX could not check whether content tools are ready. Your library is safe; try again when you are connected."
          retryLabel="Check again"
          onRetry={onRetry}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen variant="focus">
      <StudyBackButton onPress={onBack} />
      <Card
        size="lg"
        variant="glass"
        style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border }}
      >
        <Text color={vexFire.amber} variant="label">YOUR STUDY PATH</Text>
        <Text color={vexFire.cream} mt="sm" variant="h2">Build your first block</Text>
        <Text color={vexFire.textSecondary} mt="sm" variant="body">
          {message ?? 'Complete a focused study session to open content tools.'}
        </Text>
        <Box mt="lg"><StudyPathCta /></Box>
      </Card>
      <Button
        accessibilityHint="Returns to your Study Library"
        accessibilityLabel="Back to Study Library"
        accessibilityRole="button"
        onPress={onBack}
        variant="ghost"
      >
        <Text>Back to library</Text>
      </Button>
    </AppScreen>
  );
}
