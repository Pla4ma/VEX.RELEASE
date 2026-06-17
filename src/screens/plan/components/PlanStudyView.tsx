import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { PlanStudyPlan } from '../../../features/plan/types';

interface PlanStudyViewProps {
  studyPlans: PlanStudyPlan[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAddStudyPlan: () => void;
  onSelectStudyPlan: (studyPlanId: string) => void;
}

export function PlanStudyView({
  studyPlans,
  isLoading,
  isError,
  onRetry,
  onAddStudyPlan,
  onSelectStudyPlan,
}: PlanStudyViewProps): React.ReactNode {
  if (isLoading) {
    return (
      <View style={{ padding: 20, gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={80} borderRadius={12} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load study plans"
        description="Try again to see your study plans"
        retryLabel="Retry"
        onRetry={onRetry}
      />
    );
  }

  if (studyPlans.length === 0) {
    return (
      <EmptyState
        iconName="book-open"
        title="No study plans yet"
        body="Create a study plan to organize your learning goals"
        actionLabel="Create study plan"
        onAction={onAddStudyPlan}
      />
    );
  }

  return (
    <View style={{ padding: 20, gap: 10 }}>
      {studyPlans.map((plan, index) => (
        <Animated.View
          key={plan.id}
          entering={FadeInUp.delay(index * 60)}
        >
          <Pressable
            accessibilityLabel={`Select study plan ${plan.name}`}
            accessibilityRole="button"
            accessibilityHint="Opens the study plan detail view"
            onPress={() => onSelectStudyPlan(plan.id)}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? vexLightGlass.mint[50]
                : vexLightGlass.background.pageMid,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: vexLightGlass.glass.borderSubtle,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: vexLightGlass.semantic.info + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                color={vexLightGlass.semantic.info}
                name="book-open"
                size="md"
                variant="solid"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 15,
                  fontWeight: '600',
                }}
              >
                {plan.name}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {plan.subject}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <Text
                  style={{
                    color: vexLightGlass.text.tertiary,
                    fontSize: 12,
                  }}
                >
                  {plan.completedItemCount}/{plan.itemCount} done
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: vexLightGlass.glass.borderSubtle,
                    borderRadius: 2,
                    marginTop: 6,
                  }}
                >
                  <View
                    style={{
                      width: `${plan.progress}%`,
                      height: 4,
                      backgroundColor: vexLightGlass.semantic.info,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            </View>

            <Icon
              color={vexLightGlass.text.tertiary}
              name="chevron-right"
              size="sm"
              variant="solid"
            />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
