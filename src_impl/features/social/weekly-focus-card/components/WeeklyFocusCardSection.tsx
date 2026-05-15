import React from 'react';
import { Box } from '../../../../components/primitives';
import { useWeeklyFocusSummary } from '../hooks';
import { useAuthStore } from '../../../../store';
import { WeeklyFocusCard } from './WeeklyFocusCard';

type WeeklyFocusCardSectionProps = {
  onStartSession: () => void;
};

export function WeeklyFocusCardSection({
  onStartSession,
}: WeeklyFocusCardSectionProps): JSX.Element {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const query = useWeeklyFocusSummary(userId, 0);

  return (
    <Box gap="md">
      <WeeklyFocusCard
        summary={query.data ?? null}
        isLoading={query.isPending}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        onStartSession={onStartSession}
      />
    </Box>
  );
}
