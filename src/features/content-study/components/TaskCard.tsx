import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { Icon } from "../../../icons";
import type { StudyTask } from "../types";
import { TASK_PRIORITY_CONFIG } from "../constants";
import { styles } from "./study-task-list-styles";

interface TaskCardProps {
  task: StudyTask;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  readOnly: boolean;
  showDependencies: boolean;
  onComplete: (id: string) => void;
  onSelect: (id: string) => void;
  formatDuration: (minutes: number) => string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompleted,
  isActive,
  isLocked,
  readOnly,
  showDependencies,
  onComplete,
  onSelect,
  formatDuration,
}) => {
  const { theme } = useTheme();
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  return (
    <Pressable
      style={({ pressed }) => [
        styles.taskCard,
        {
          backgroundColor: isCompleted
            ? theme.colors.success[50]
            : isActive
              ? theme.colors.primary[50]
              : theme.colors.background.secondary,
          borderColor: isActive
            ? theme.colors.primary[500]
            : theme.colors.border.DEFAULT,
          opacity: isLocked ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
      onPress={() => !isLocked && onSelect(task.id)}
      disabled={isLocked || readOnly}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: isLocked }}
      accessibilityLabel="Interactive control"
      accessibilityHint="Activates this control"
    >
      {}
      <Pressable
        style={({ pressed }) => [
          styles.checkbox,
          {
            borderColor: isCompleted
              ? theme.colors.success[500]
              : theme.colors.border.DEFAULT,
            backgroundColor: isCompleted
              ? theme.colors.success[500]
              : "transparent",
            opacity: pressed && !isLocked && !readOnly ? 0.8 : 1,
          },
        ]}
        onPress={() => !readOnly && onComplete(task.id)}
        disabled={isLocked || readOnly}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        {isCompleted && (
          <Icon
            name="check"
            size="xs"
            color={theme.colors.background.primary}
          />
        )}
      </Pressable>

      {}
      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskText,
            {
              color: theme.colors.text.primary,
              textDecorationLine: isCompleted ? "line-through" : "none",
            },
          ]}
        >
          {task.content}
        </Text>

        <View style={styles.taskMeta}>
          {}
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityConfig.color },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: priorityConfig.textColor },
              ]}
            >
              {priorityConfig.label}
            </Text>
          </View>

          {}
          <View style={styles.durationBadge}>
            <Icon
              name="clock"
              size="xs"
              color={theme.colors.text.muted}
            />
            <Text
              style={[
                styles.durationText,
                { color: theme.colors.text.muted },
              ]}
            >
              {formatDuration(task.estimatedMinutes)}
            </Text>
          </View>

          {}
          {showDependencies &&
            task.dependsOn &&
            task.dependsOn.length > 0 && (
              <View style={styles.dependencyBadge}>
                <Icon
                  name="link"
                  size="xs"
                  color={theme.colors.text.muted}
                />
                <Text
                  style={[
                    styles.dependencyText,
                    { color: theme.colors.text.muted },
                  ]}
                >
                  {task.dependsOn.length} prerequisite
                  {task.dependsOn.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}
        </View>
      </View>

      {}
      {isLocked && (
        <Icon name="lock" size="sm" color={theme.colors.text.muted} />
      )}
    </Pressable>
  );
};
