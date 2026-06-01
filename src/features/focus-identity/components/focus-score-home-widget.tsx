import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@components/primitives/Text'; // Use alias
import { Skeleton } from '@components/ui/Skeleton'; // Use alias
import { StatusBanner } from '@/shared/ui/components/StatusFeedback'; // Use alias
import { useTheme } from '../../../theme'; // Use alias
import type { FocusScoreDashboardModel } from '../types'; // Import from types.ts
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

interface FocusScoreHomeWidgetProps {
  model: FocusScoreDashboardModel;
  onPress: () => void;
  onRetry: () => void;
}

export function FocusScoreHomeWidget({
  model,
  onPress,
  onRetry,
}: FocusScoreHomeWidgetProps): JSX.Element {
  const { theme } = useTheme();
  if (model.isPending) {
    return (
      <View
        testID="focus-score-home-widget-skeleton"
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing[4],
          gap: theme.spacing[2],
        }}
      >
        <Skeleton width={100} height={16} />
        <Skeleton width={200} height={24} />
        <Skeleton width={150} height={16} />
      </View>
    );
  }

  if (model.isError) {
    return (
      <StatusBanner
        status="error"
        message="Focus Score is unavailable"
        description={model.error?.message ?? 'Retry to load your score widget.'}
        onRetry={onRetry}
      />
    );
  }

  if (!model.current) {
    return (
      <StatusBanner
        status="offline"
        message="Focus Score needs three sessions"
        description="Finish three sessions and VEX will start reading your focus rhythm."
      />
    );
  }

  const delta = model.current.currentScore - model.current.previousScore;
  const reason = model.history.at(-1)?.reason ?? model.current.lastChangeReason;

  return (
    <View style={{ gap: theme.spacing[2] }}>
      {model.isOffline ? (
        <StatusBanner
          status="offline"
          message="Offline focus mode"
          description="Cached score shown while VEX waits to sync."
        />
      ) : null}
      <Pressable
        onPress={onPress}
        accessibilityLabel="Open focus score dashboard"
        accessibilityRole="button"
        accessibilityHint="Opens the full focus dashboard with trends and factor details"
        style={{
          ...getMinTouchTargetStyle(),
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing[4],
          gap: theme.spacing[1],
        }}
      >
        <Text variant="label" color={theme.colors.text.secondary}>
          Focus Score
        </Text>
        <Text variant="h3" color={theme.colors.text.primary}>
          {model.current.currentScore} · {model.current.band}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          Delta since last session: {delta >= 0 ? `+${delta}` : delta}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.colors.text.secondary}
          numberOfLines={2}
        >
          {reason}
        </Text>
      </Pressable>
    </View>
  );
}
