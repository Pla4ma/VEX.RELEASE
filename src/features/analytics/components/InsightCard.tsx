import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { InsightSchema } from '../schemas';
import type { z } from 'zod';
import {
  SEVERITY_CONFIG,
  formatMetricName,
  formatDate,
  formatActionLabel,
  styles,
} from './InsightCardStyles';

type Insight = z.infer<typeof InsightSchema>;
interface InsightCardProps {
  insight: Insight;
  onPress?: () => void;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function InsightCard({
  insight,
  onPress,
  onAction,
  onDismiss,
}: InsightCardProps) {
  const severity = SEVERITY_CONFIG[insight.severity];
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: severity.bgColor, borderColor: severity.color },
        insight.isRead && styles.readContainer,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Insight: ${insight.title}`}
      accessibilityHint="Double tap to select"
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{severity.icon}</Text>
        <Text style={[styles.title, { color: severity.color }]}>
          {insight.title}
        </Text>
        {insight.isActioned && (
          <View style={[styles.badge, { backgroundColor: severity.color }]}>
            <Text style={styles.badgeText}>Done</Text>
          </View>
        )}
        {!insight.isRead && !insight.isActioned && (
          <View
            style={[styles.unreadDot, { backgroundColor: severity.color }]}
          />
        )}
      </View>

      <Text style={styles.description}>{insight.description}</Text>

      {insight.metric && (
        <View style={styles.tagContainer}>
          <View
            style={[styles.tag, { backgroundColor: severity.color + '30' }]}
          >
            <Text style={[styles.tagText, { color: severity.color }]}>
              {formatMetricName(insight.metric)}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(insight.detectedAt)}</Text>
        </View>
      )}

      {insight.actionType && !insight.isActioned && (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: severity.color },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel="Perform action"
            accessibilityHint="Double tap to select"
          >
            <Text style={styles.actionButtonText}>
              {formatActionLabel(insight.actionType)}
            </Text>
          </Pressable>

          {onDismiss && (
            <Pressable
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Dismiss insight"
              accessibilityHint="Double tap to select"
            >
              <Text style={[styles.dismissText, { color: severity.color }]}>
                Dismiss
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
