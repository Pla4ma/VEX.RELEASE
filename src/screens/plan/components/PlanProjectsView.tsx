import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { PlanProject } from '../../../features/plan/types';
import { useTheme } from '../../../theme/ThemeContext';
import { PlanModeEmptyState } from './PlanModeEmptyState';

const PLAN_PROJECTS_ASSET = require('../../../../assets/vex/plan-projects-fire.png');

interface PlanProjectsViewProps {
  projects: PlanProject[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAddProject: () => void;
  onSelectProject: (projectId: string) => void;
}

export function PlanProjectsView({
  projects,
  isLoading,
  isError,
  onRetry,
  onAddProject,
  onSelectProject,
}: PlanProjectsViewProps): React.ReactNode {
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
        title="Could not load projects"
        description="Try again to see your projects"
        retryLabel="Retry"
        onRetry={onRetry}
      />
    );
  }

  if (projects.length === 0) {
    return (
      <PlanModeEmptyState
        body="Create a project to organize your tasks and goals"
        actionLabel="Create project"
        asset={PLAN_PROJECTS_ASSET}
        onAction={onAddProject}
        title="No projects yet"
      />
    );
  }

  return (
    <View style={{ gap: theme.spacing[3], padding: theme.spacing[4] }}>
      {projects.map((project, index) => (
        <Animated.View
          key={project.id}
          entering={FadeInUp.delay(index * 60)}
        >
          <Pressable
            accessibilityLabel={`Select project ${project.name}`}
            accessibilityRole="button"
            accessibilityHint="Opens the project details view"
            onPress={() => onSelectProject(project.id)}
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
                name="folder"
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
                {project.name}
              </Text>
              {project.description && (
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing[1],
                  }}
                  variant="caption"
                >
                  {project.description}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[2] }}>
                <Text
                  style={{
                    color: theme.colors.text.tertiary,
                  }}
                  variant="caption"
                >
                  {project.completedItemCount}/{project.itemCount} done
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
                      width: `${project.progress}%`,
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
