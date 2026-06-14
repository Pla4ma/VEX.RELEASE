import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useAuthStore } from '../../../store';
import { useProjects, useStudyPlans, useTodayItems, useWeekItems } from '../../../features/plan/hooks';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { PlanProjectsView } from './PlanProjectsView';
import { PlanStudyView } from './PlanStudyView';
import { PlanTodayView } from './PlanTodayView';
import { PlanWeekView } from './PlanWeekView';
import { usePlanScreenActions } from '../usePlanScreenActions';

const PLAN_SECTIONS = ['today', 'week', 'projects', 'study'] as const;
type PlanSection = typeof PLAN_SECTIONS[number];

export function PlanWorkspace(): JSX.Element {
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
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4, paddingHorizontal: 4 }}>
        <Text
          style={{
            color: vexLightGlass.mint[700],
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Plan
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.4,
          }}
        >
          Today, week, projects, study.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: vexLightGlass.glass.fill,
          borderColor: vexLightGlass.glass.border,
          borderRadius: 22,
          borderWidth: 1,
          flexDirection: 'row',
          padding: 4,
        }}
      >
        {PLAN_SECTIONS.map((section) => {
          const selected = activeSection === section;
          return (
            <Pressable
              accessibilityHint={`Show ${section} planning`}
              accessibilityLabel={`${section} planning tab`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={section}
              onPress={() => selectSection(section)}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: selected ? vexLightGlass.mint[100] : vexLightGlass.background.transparent,
                borderRadius: 18,
                flex: 1,
                minHeight: 44,
                justifyContent: 'center',
                opacity: pressed ? 0.82 : 1,
              })}
            >
              <Text
                style={{
                  color: selected ? vexLightGlass.mint[800] : vexLightGlass.text.tertiary,
                  fontSize: 12,
                  fontWeight: selected ? '800' : '600',
                  textTransform: 'capitalize',
                }}
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
