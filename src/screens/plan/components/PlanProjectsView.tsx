import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { PlanProject } from '../../../features/plan/types';

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
      <EmptyState
        iconName="folder"
        title="No projects yet"
        body="Create a project to organize your tasks and goals"
        actionLabel="Create project"
        onAction={onAddProject}
      />
    );
  }

  return (
    <View style={{ padding: 20, gap: 10 }}>
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
                backgroundColor: project.color ?? vexLightGlass.mint[100],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                color={project.color ?? vexLightGlass.mint[600]}
                name={project.icon ?? 'folder'}
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
                {project.name}
              </Text>
              {project.description && (
                <Text
                  style={{
                    color: vexLightGlass.text.secondary,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  {project.description}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <Text
                  style={{
                    color: vexLightGlass.text.tertiary,
                    fontSize: 12,
                  }}
                >
                  {project.completedItemCount}/{project.itemCount} done
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
                      width: `${project.progress}%`,
                      height: 4,
                      backgroundColor: vexLightGlass.mint[500],
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
