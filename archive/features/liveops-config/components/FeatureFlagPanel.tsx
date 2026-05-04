/**
 * Feature Flag Panel Component
 *
 * Admin panel for viewing and managing feature flags.
 */

import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Text, Card, Badge, Button } from '../../../components';
import { useLiveOpsConfig } from '../hooks';
import type { LiveOpsConfig } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

interface FeatureFlagPanelProps {
  onToggleFeature?: (feature: string, enabled: boolean) => void;
  onUpdateRollout?: (feature: string, percentage: number) => void;
  readOnly?: boolean;
}

export function FeatureFlagPanel({
  onToggleFeature,
  onUpdateRollout,
  readOnly = true,
}: FeatureFlagPanelProps): JSX.Element {
  const { data, isLoading, error } = useLiveOpsConfig();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [rolloutInput, setRolloutInput] = useState<string>('');

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonRow} />
        <View style={styles.skeletonRow} />
        <View style={styles.skeletonRow} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Failed to load features</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </Card>
    );
  }

  const config = data?.config as LiveOpsConfig | undefined;
  const features = config?.features || {};

  if (Object.keys(features).length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.emptyText}>No feature flags configured</Text>
      </Card>
    );
  }

  const handleToggle = (featureKey: string, currentEnabled: boolean) => {
    if (readOnly || !onToggleFeature) {return;}
    onToggleFeature(featureKey, !currentEnabled);
  };

  const handleRolloutUpdate = (featureKey: string) => {
    if (readOnly || !onUpdateRollout) {return;}
    const percentage = parseInt(rolloutInput, 10);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      onUpdateRollout(featureKey, percentage);
      setRolloutInput('');
      setExpandedFeature(null);
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading3">Feature Flags</Text>
        <Badge variant="info">{`${Object.keys(features).length} flags`}</Badge>
      </View>

      {Object.entries(features).map(([key, enabled]) => (
        <View key={key} style={styles.featureRow}>
          <Pressable
            style={({ pressed }) => [styles.featureHeader, pressed && { opacity: 0.8 }]}
            onPress={() => setExpandedFeature(expandedFeature === key ? null : key)}
            accessibilityLabel="Feature header button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <View style={styles.featureInfo}>
              <Text style={styles.featureName}>{key}</Text>
              <Text style={styles.featureDescription}>
                Feature flag
              </Text>
            </View>
            <View style={styles.featureStatus}>
              <Pressable
                onPress={() => handleToggle(key, Boolean(enabled))}
                disabled={readOnly}
                style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                accessibilityLabel="Toggle feature button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                <Badge
                  variant={enabled ? 'success' : 'default'}
                  style={readOnly ? undefined : styles.clickableBadge}
                >
                  {enabled ? 'ON' : 'OFF'}
                </Badge>
              </Pressable>
            </View>
          </Pressable>

          {expandedFeature === key && !readOnly && onUpdateRollout && (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedLabel}>Update Rollout %</Text>
              <View style={styles.rolloutInputRow}>
                <TextInput
                  style={styles.rolloutInput}
                  value={rolloutInput}
                  onChangeText={setRolloutInput}
                  placeholder="0-100"
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Button
                  variant="primary"
                  size="small"
                  onPress={() => handleRolloutUpdate(key)}
                  disabled={!rolloutInput}

                accessibilityLabel="Update button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  Update
                </Button>
              </View>
            </View>
          )}
        </View>
      ))}
    </Card>
  );
}

const styles = createSheet({
  container: {
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  featureRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureInfo: {
    flex: 1,
    marginRight: 12,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  featureStatus: {
    alignItems: 'flex-end',
  },
  clickableBadge: {
    cursor: 'pointer',
  },
  rolloutText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  expandedSection: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4B5563',
  },
  rolloutInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolloutInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    paddingVertical: 32,
  },
  errorContainer: {
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#991B1B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  skeletonHeader: {
    height: 24,
    width: '60%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonRow: {
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
});
