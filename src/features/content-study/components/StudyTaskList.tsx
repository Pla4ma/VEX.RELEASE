import React, { useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import type { StudyTaskListProps, StudyTask } from '../types';
import { TaskCard } from './TaskCard';
import { styles } from './study-task-list-styles';

export const StudyTaskList: React.FC<StudyTaskListProps> = ({
  tasks,
  completedIds,
  activeId,
  onTaskComplete,
  onTaskSelect,
  showDependencies = true,
  readOnly = false,
  estimatedTotalTime,
  completedTime,
}) => {
  const { theme } = useTheme();
  const sortedTasks = useMemo(() => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...tasks].sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.estimatedMinutes - b.estimatedMinutes;
    });
  }, [tasks]);
  const isTaskUnlocked = useCallback(
    (task: StudyTask): boolean => {
      if (!task.dependsOn || task.dependsOn.length === 0) {
        return true;
      }
      return task.dependsOn.every((depId) => completedIds.has(depId));
    },
    [completedIds],
  );
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  const completionPercentage =
    tasks.length > 0 ? (completedIds.size / tasks.length) * 100 : 0;
  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Icon
            name="check-square"
            size="sm"
            color={theme.colors.primary[500]}
          />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Study Tasks ({completedIds.size}/{tasks.length})
          </Text>
        </View>
        <View style={styles.progressInfo}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.background.primary },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.success[500],
                  width: `${completionPercentage}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.timeText, { color: theme.colors.text.muted }]}>
            {formatDuration(completedTime)} /{' '}
            {formatDuration(estimatedTotalTime)}
          </Text>
        </View>
      </View>

      {}
      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {sortedTasks.map((task) => {
          const isCompleted = completedIds.has(task.id);
          const isActive = activeId === task.id;
          const isLocked = !isTaskUnlocked(task) && !isCompleted;
          return (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={isCompleted}
              isActive={isActive}
              isLocked={isLocked}
              readOnly={readOnly}
              showDependencies={showDependencies}
              onComplete={onTaskComplete}
              onSelect={onTaskSelect}
              formatDuration={formatDuration}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
