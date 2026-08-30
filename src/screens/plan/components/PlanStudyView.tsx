import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { PlanStudyPlan } from '../../../features/plan/types';
import { useTheme } from '../../../theme/ThemeContext';
import { PlanModeEmptyState } from './PlanModeEmptyState';

const PLAN_STUDY_ASSET = require('../../../../assets/vex/plan-study-fire.png');

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
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ padding: 20, gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`item-${i}`} width="100%" height={80} borderRadius={12} />
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
      <PlanModeEmptyState
        body="Create a study plan to organize your learning goals"
        actionLabel="Create study plan"
        asset={PLAN_STUDY_ASSET}
        onAction={onAddStudyPlan}
        title="No study plans yet"
      />
    );
  }

  return (
    <View style={{ gap: theme.spacing[3], padding: theme.spacing[4] }}>
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
              backgroundColor: pressed ? theme.colors.primary[900] : theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.primary[800],
              padding: theme.spacing[4],
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing[3],
            })}
          >
            <View
              style={{
                width: theme.spacing[10],
                height: theme.spacing[10],
                borderRadius: theme.borderRadius.lg,
                backgroundColor: theme.colors.primary[950],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                color={theme.colors.semantic.primary}
                name="book-open"
                size="md"
                variant="solid"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: theme.fontWeights.bold,
                }}
                variant="bodySmall"
              >
                {plan.name}
              </Text>
              <Text
                style={{
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing[1],
                }}
                variant="caption"
              >
                {plan.subject}
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[2] }}>
                <Text
                  style={{
                    color: theme.colors.text.tertiary,
                  }}
                  variant="caption"
                >
                  {plan.completedItemCount}/{plan.itemCount} done
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: theme.spacing[1],
                    backgroundColor: theme.colors.primary[950],
                    borderRadius: theme.borderRadius.full,
                    marginTop: theme.spacing[2],
                  }}
                >
                  <View
                    style={{
                      width: `${plan.progress}%`,
                      height: theme.spacing[1],
                      backgroundColor: theme.colors.semantic.primary,
                      borderRadius: theme.borderRadius.full,
                    }}
                  />
                </View>
              </View>
            </View>

            <Icon
              color={theme.colors.primary[700]}
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
