import React, { useState } from "react";
import { View, Text, Modal, ScrollView, Pressable } from "react-native";
import { AnalyticsMetricSchema } from "../schemas";
import type { z } from "zod";
import { styles } from "./metric-selector.styles";

type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;

interface MetricSelectorProps {
  selected: AnalyticsMetric[];
  onChange: (metrics: AnalyticsMetric[]) => void;
  maxSelection?: number;
  disabled?: boolean;
}

const AVAILABLE_METRICS: {
  value: AnalyticsMetric;
  label: string;
  category: string;
}[] = [
  { value: "sessions_completed", label: "Sessions Completed", category: "Sessions" },
  { value: "sessions_abandoned", label: "Sessions Abandoned", category: "Sessions" },
  { value: "total_focus_time", label: "Total Focus Time", category: "Sessions" },
  { value: "average_session_duration", label: "Avg Session Duration", category: "Sessions" },
  { value: "streak_days", label: "Streak Days", category: "Progress" },
  { value: "longest_streak", label: "Longest Streak", category: "Progress" },
  { value: "xp_earned", label: "XP Earned", category: "Progress" },
  { value: "level_progression", label: "Level Progression", category: "Progress" },
  { value: "boss_damage_dealt", label: "Boss Damage", category: "Combat" },
  { value: "items_crafted", label: "Items Crafted", category: "Economy" },
  { value: "coins_spent", label: "Coins Spent", category: "Economy" },
  { value: "challenges_completed", label: "Challenges Completed", category: "Social" },
];

export function MetricSelector({
  selected,
  onChange,
  maxSelection = 5,
  disabled,
}: MetricSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const groupedMetrics = AVAILABLE_METRICS.reduce(
    (acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category]!.push(metric);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_METRICS>,
  );

  const toggleMetric = (metric: AnalyticsMetric) => {
    if (selected.includes(metric)) {
      onChange(selected.filter((m) => m !== metric));
    } else if (selected.length < maxSelection) {
      onChange([...selected, metric]);
    }
  };

  const isSelected = (metric: AnalyticsMetric) => selected.includes(metric);
  const canSelectMore = selected.length < maxSelection;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Metrics ({selected.length}/{maxSelection})
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.selector,
          disabled && styles.selectorDisabled,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        accessibilityLabel="Metric selector"
        accessibilityRole="button"
        accessibilityHint="Double tap to select"
      >
        <View style={styles.selectedContainer}>
          {selected.length === 0 ? (
            <Text style={styles.placeholder}>Select metrics...</Text>
          ) : (
            <Text style={styles.selectedChipText}>
              {selected.length} selected:{" "}
              {selected
                .map(
                  (metric) =>
                    AVAILABLE_METRICS.find((m) => m.value === metric)?.label ||
                    metric,
                )
                .join(", ")}
            </Text>
          )}
        </View>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
          accessibilityLabel="Metric selector"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Metrics</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                accessibilityLabel="Done selecting metrics"
                accessibilityRole="button"
                accessibilityHint="Double tap to select"
              >
                <Text style={styles.closeButton}>Done</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {Object.entries(groupedMetrics).map(([category, metrics]) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {metrics.map((metric) => {
                    const selected_metric = isSelected(metric.value);
                    const disabled_metric = !selected_metric && !canSelectMore;
                    return (
                      <Pressable
                        key={metric.value}
                        style={({ pressed }) => [
                          styles.metricOption,
                          selected_metric && styles.metricOptionSelected,
                          disabled_metric && styles.metricOptionDisabled,
                          pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => toggleMetric(metric.value)}
                        disabled={disabled_metric}
                        accessibilityLabel="Metric selector"
                        accessibilityRole="button"
                        accessibilityHint="Double tap to select"
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selected_metric && styles.checkboxSelected,
                          ]}
                        >
                          {selected_metric && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.metricLabel,
                            selected_metric && styles.metricLabelSelected,
                            disabled_metric && styles.metricLabelDisabled,
                          ]}
                        >
                          {metric.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
