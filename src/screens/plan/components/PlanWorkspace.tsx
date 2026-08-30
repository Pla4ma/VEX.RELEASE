import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useAuthStore } from '../../../store';
import { useProjects, useStudyPlans, useTodayItems, useWeekItems } from '../../../features/plan/hooks';
import { useTheme } from '../../../theme/ThemeContext';
import { PlanProjectsView } from './PlanProjectsView';
import { PlanStudyView } from './PlanStudyView';
import { PlanTodayView } from './PlanTodayView';
import { PlanWeekView } from './PlanWeekView';
import { usePlanScreenActions } from '../usePlanScreenActions';

const PLAN_SECTIONS = ['today', 'week', 'projects', 'study'] as const;
type PlanSection = typeof PLAN_SECTIONS[number];

export function PlanWorkspace(): React.ReactNode {
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [activeSection, setActiveSection] = useState<PlanSection>('today');
  const todayQuery = useTodayItems(userId);
  const weekQuery = useWeekItems(userId);
  const projectsQuery = useProjects(userId);
  const studyPlansQuery = useStudyPlans(userId);
  const actions = usePlanScreenActions();

  const selectSection = useCallback((section: PlanSection): void => {
    setActiveSection(section);
  }, []);

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <View style={{ gap: theme.spacing[1], paddingHorizontal: theme.spacing[1] }}>
        <Text color={theme.colors.semantic.primary} variant="label">Plan</Text>
        <Text variant="h2">Today, week, projects, study.</Text>
      </View>

      <View
        style={{
          borderBottomColor: theme.colors.primary[800],
          borderBottomWidth: 1,
          flexDirection: 'row',
          padding: theme.spacing[1],
        }}
      >
        {PLAN_SECTIONS.map((section) => {
          const selected = activeSection === section;
          return (
            <Pressable
              accessibilityHint={`Show ${section} planning`}
              accessibilityLabel={`${section} planning tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={section}
              onPress={() => selectSection(section)}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: selected ? theme.colors.primary[100] : 'transparent',
                borderRadius: selected ? theme.borderRadius.md : 0,
                flex: 1,
                minHeight: 44,
                justifyContent: 'center',
                opacity: pressed ? 0.82 : 1,
              })}
            >
              <Text
                color={selected ? theme.colors.semantic.primary : 'text.tertiary'}
                style={{ textTransform: 'capitalize' }}
                variant="label"
              >
                {section}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Animated.View entering={FadeInUp.delay(40)}>
        {activeSection === 'today' ? (
          <PlanTodayView
            isError={todayQuery.isError}
            isLoading={todayQuery.isPending}
            items={todayQuery.data ?? []}
            onAddItem={actions.openAddItemSheet}
            onCompleteItem={actions.completeItem}
            onRetry={todayQuery.refetch}
            onStartSession={actions.startSessionFromItem}
          />
        ) : null}
        {activeSection === 'week' ? (
          <PlanWeekView
            isError={weekQuery.isError}
            isLoading={weekQuery.isPending}
            items={weekQuery.data ?? []}
            onAddItem={actions.openAddItemSheet}
            onRetry={weekQuery.refetch}
            onStartSession={actions.startSessionFromItem}
          />
        ) : null}
        {activeSection === 'projects' ? (
          <PlanProjectsView
            isError={projectsQuery.isError}
            isLoading={projectsQuery.isPending}
            onAddProject={actions.openAddProjectSheet}
            onRetry={projectsQuery.refetch}
            onSelectProject={actions.selectProject}
            projects={projectsQuery.data ?? []}
          />
        ) : null}
        {activeSection === 'study' ? (
          <PlanStudyView
            isError={studyPlansQuery.isError}
            isLoading={studyPlansQuery.isPending}
            onAddStudyPlan={actions.openAddStudyPlanSheet}
            onRetry={studyPlansQuery.refetch}
            onSelectStudyPlan={actions.selectStudyPlan}
            studyPlans={studyPlansQuery.data ?? []}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}
