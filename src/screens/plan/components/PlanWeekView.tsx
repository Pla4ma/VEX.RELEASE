import React from 'react';
import { Pressable, View } from 'react-native';

import { ErrorState } from '../../../components/states/ErrorState';
import { Text } from '../../../components/primitives/Text';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Icon } from '../../../icons/components/Icon';
import type { PlanItem } from '../../../features/plan/types';
import { useTheme } from '../../../theme/ThemeContext';
import { PlanModeEmptyState } from './PlanModeEmptyState';

const PLAN_WEEK_ASSET = require('../../../../assets/vex/plan-week-fire.png');

const dateLabelFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

interface PlanWeekViewProps {
  items: PlanItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAddItem: () => void;
  onStartSession: (itemId: string, title: string) => void;
}

function formatDateLabel(dueDate?: string | null): string {
  if (!dueDate) return 'Unscheduled';
  return dateLabelFormatter.format(new Date(dueDate));
}

export function PlanWeekView({
  items,
  isLoading,
  isError,
  onRetry,
  onAddItem,
  onStartSession,
}: PlanWeekViewProps): React.ReactNode {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ gap: 10 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton borderRadius={20} height={70} key={`item-${index}`} width="100%" />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        description="Retry to rebuild your week from saved tasks."
        onRetry={onRetry}
        retryLabel="Retry"
        style={{ borderRadius: 24, minHeight: 220 }}
        title="Week plan is out of sync"
      />
    );
  }

  if (items.length === 0) {
    return (
      <PlanModeEmptyState
        actionLabel="Add task"
        asset={PLAN_WEEK_ASSET}
        body="Add one concrete block and VEX will keep the week grounded."
        onAction={onAddItem}
        title="Your week has room."
      />
    );
  }

  return (
    <View style={{ gap: theme.spacing[3] }}>
      {items.map((item) => (
        <Pressable
          accessibilityHint="Starts a focus session from this planned item"
          accessibilityLabel={`Start ${item.title}`}
          accessibilityRole="button"
          key={item.id}
          onPress={() => onStartSession(item.id, item.title)}
          style={({ pressed }) => ({
            alignItems: 'center',
            backgroundColor: pressed ? theme.colors.primary[900] : theme.colors.background.primary,
            borderColor: theme.colors.primary[800],
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            flexDirection: 'row',
            gap: theme.spacing[3],
            minHeight: theme.spacing[16] + theme.spacing[1],
            padding: theme.spacing[3],
          })}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.primary[950],
              borderRadius: theme.borderRadius.lg,
              height: theme.spacing[10],
              justifyContent: 'center',
              width: theme.spacing[10],
            }}
          >
            <Icon color={theme.colors.semantic.primary} name="calendar" size="sm" />
          </View>
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            <Text style={{ color: theme.colors.text.primary, fontWeight: theme.fontWeights.bold }} variant="bodySmall">
              {item.title}
            </Text>
            <Text color="text.tertiary" variant="caption">
              {formatDateLabel(item.dueDate)}
            </Text>
          </View>
          <Icon color={theme.colors.primary[700]} name="arrowRight" size="sm" />
        </Pressable>
      ))}
    </View>
  );
}
