import React from 'react';
import { Pressable, View } from 'react-native';

import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { Text } from '../../../components/primitives/Text';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Icon } from '../../../icons/components/Icon';
import type { PlanItem } from '../../../features/plan/types';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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
      <EmptyState
        actionLabel="Add task"
        body="Add one concrete block and VEX will keep the week grounded."
        iconName="calendar"
        onAction={onAddItem}
        title="Your week has room."
      />
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {items.map((item) => (
        <Pressable
          accessibilityHint="Starts a focus session from this planned item"
          accessibilityLabel={`Start ${item.title}`}
          accessibilityRole="button"
          key={item.id}
          onPress={() => onStartSession(item.id, item.title)}
          style={({ pressed }) => ({
            alignItems: 'center',
            backgroundColor: pressed ? vexLightGlass.mint[50] : vexLightGlass.glass.fill,
            borderColor: vexLightGlass.glass.border,
            borderRadius: 22,
            borderWidth: 1,
            flexDirection: 'row',
            gap: 12,
            minHeight: 70,
            padding: 14,
          })}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: vexLightGlass.background.mintTrack,
              borderRadius: 16,
              height: 44,
              justifyContent: 'center',
              width: 44,
            }}
          >
            <Icon color={vexLightGlass.mint[700]} name="calendar" size="sm" />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: vexLightGlass.text.primary, fontSize: 15, fontWeight: '800' }}>
              {item.title}
            </Text>
            <Text style={{ color: vexLightGlass.text.tertiary, fontSize: 12, fontWeight: '600' }}>
              {formatDateLabel(item.dueDate)}
            </Text>
          </View>
          <Icon color={vexLightGlass.text.tertiary} name="arrowRight" size="sm" />
        </Pressable>
      ))}
    </View>
  );
}
