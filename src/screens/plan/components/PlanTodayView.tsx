import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { PlanItem } from '../../../features/plan/types';
import { getPriorityColor } from '../../../features/plan/service';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

interface PlanTodayViewProps {
  items: PlanItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAddItem: () => void;
  onCompleteItem: (itemId: string) => void;
  onStartSession: (itemId: string, title: string) => void;
}

export function PlanTodayView({
  items,
  isLoading,
  isError,
  onRetry,
  onAddItem,
  onCompleteItem,
  onStartSession,
}: PlanTodayViewProps): React.ReactNode {
  if (isLoading) {
    return (
      <View style={{ padding: 20, gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={64} borderRadius={12} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={onRetry}
        retryLabel="Retry"
        style={{ borderRadius: 24, minHeight: 220 }}
        title="Today plan is out of sync"
        description="Retry to reload your saved tasks."
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        iconName="clipboard"
        title="Nothing planned for today"
        body="Add a task or goal to get started"
        actionLabel="Add first item"
        onAction={onAddItem}
      />
    );
  }

  return (
    <View style={{ padding: 20, gap: 10 }}>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInUp.delay(index * 60)}
        >
          <Pressable
            accessibilityHint="Starts a focus session from this task"
            accessibilityLabel={`Start ${item.title}`}
            accessibilityRole="button"
            onPress={() => onStartSession(item.id, item.title)}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? vexLightGlass.mint[50]
                : vexLightGlass.glass.fill,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: vexLightGlass.glass.border,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            })}
          >
            <Pressable
              accessibilityHint="Marks this task complete"
              accessibilityLabel={`Complete ${item.title}`}
              accessibilityRole="button"
              accessibilityState={{ checked: item.status === 'done' }}
              onPress={() => onCompleteItem(item.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: item.status === 'done'
                  ? vexLightGlass.mint[500]
                  : vexLightGlass.glass.border,
                backgroundColor: item.status === 'done'
                  ? vexLightGlass.mint[500]
                  : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                ...getMinTouchTargetStyle(),
              }}
            >
              {item.status === 'done' && (
                <Icon
                  color={vexLightGlass.text.inverse}
                  name="check"
                  size="sm"
                  variant="solid"
                />
              )}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 15,
                  fontWeight: '600',
                  textDecorationLine: item.status === 'done' ? 'line-through' : 'none',
                  opacity: item.status === 'done' ? 0.6 : 1,
                }}
              >
                {item.title}
              </Text>
              {item.description && (
                <Text
                  style={{
                    color: vexLightGlass.text.secondary,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  {item.description}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <View
                  style={{
                    backgroundColor: getPriorityColor(item.priority) + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: getPriorityColor(item.priority),
                      fontSize: 12,
                      fontWeight: '700',
                    }}
                  >
                    {item.priority}
                  </Text>
                </View>
                {item.estimatedMinutes && (
                  <Text
                    style={{
                      color: vexLightGlass.text.tertiary,
                      fontSize: 12,
                    }}
                  >
                    {item.estimatedMinutes} min
                  </Text>
                )}
              </View>
            </View>

            <Icon
              color={vexLightGlass.mint[500]}
              name="play-circle"
              size="lg"
              variant="solid"
            />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
