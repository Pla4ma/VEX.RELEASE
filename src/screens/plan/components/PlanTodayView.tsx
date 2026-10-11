import React from 'react';
import { Image, View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { PlanItem } from '../../../features/plan/types';
import { getPriorityColor } from '../../../features/plan/service';
import { useTheme } from '../../../theme/ThemeContext';

const EMPTY_STATE_EMBER = require('../../../../assets/vex/empty-state-ember-core.png');

interface PlanTodayViewProps {
  items: PlanItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAddItem: () => void;
  onCompleteItem: (itemId: string) => void;
  onStartSession: (itemId: string, title: string) => void;
}

function PlanEmptyState({ onAddItem }: { onAddItem: () => void }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: theme.spacing[3], paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[10] }}>
      <Image accessibilityLabel="Ember core" accessibilityIgnoresInvertColors source={EMPTY_STATE_EMBER} style={{ borderRadius: theme.borderRadius.full, height: theme.spacing[24], width: theme.spacing[24] }} />
      <Text color="text.primary" textAlign="center" variant="h3">Nothing planned for today</Text>
      <Text color="text.secondary" textAlign="center" variant="bodyLarge">Add a task or goal to get started</Text>
      <Pressable accessibilityHint="Adds the first item to today’s plan" accessibilityLabel="Add first item" accessibilityRole="button" onPress={onAddItem} style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.ember, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[12], opacity: pressed ? theme.opacity[80] : theme.opacity[100], paddingHorizontal: theme.spacing[6] })}>
        <Text style={{ color: vexFire.ember, fontWeight: theme.fontWeights.bold }} variant="button">Add first item</Text>
      </Pressable>
    </View>
  );
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
          <Skeleton key={`item-${i}`} width="100%" height={64} borderRadius={12} />
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
    return <PlanEmptyState onAddItem={onAddItem} />;
  }

  return (
    <View style={{ padding: 20, gap: 12 }}>
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
              backgroundColor: pressed ? vexFire.backgroundSoft : vexFire.panel,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: vexFire.border,
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
              style={{}}
            >
              {item.status === 'done' && (
                <Icon
                  color={vexFire.background}
                  name="check"
                  size="sm"
                  variant="solid"
                />
              )}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: vexFire.cream,
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
                    color: vexFire.textSecondary,
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
                      color: vexFire.textMuted,
                      fontSize: 12,
                    }}
                  >
                    {item.estimatedMinutes} min
                  </Text>
                )}
              </View>
            </View>

            <Icon
              color={vexFire.ember}
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
