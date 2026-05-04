/**
 * LiveOps Config Viewer Component
 *
 * Displays current remote configuration values.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Badge } from '../../../components';
import { useLiveOpsConfig } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

interface ConfigViewerProps {
  autoSync?: boolean;
}

export function ConfigViewer({ autoSync = true }: ConfigViewerProps): JSX.Element {
  const { data, isLoading, error, refetch } = useLiveOpsConfig({ autoSync });

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
        <Text style={styles.errorText}>Failed to load config</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </Card>
    );
  }

  if (!data?.config) {
    return (
      <Card style={styles.container}>
        <Text style={styles.emptyText}>No config available</Text>
      </Card>
    );
  }

  const config = data.config;

  return (
    <ScrollView style={styles.scrollView}>
      <Card style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading3">LiveOps Config</Text>
          <Badge variant="info">{`v${config.version}`}</Badge>
        </View>

        {/* Features Section */}
        {config.features && (
          <View style={styles.section}>
            <Text variant="heading4" style={styles.sectionTitle}>
              Features
            </Text>
            {Object.entries(config.features).map(([key, enabled]) => (
              <View key={key} style={styles.configRow}>
                <Text style={styles.configKey}>{key}</Text>
                <View style={styles.configValue}>
                  <Badge variant={enabled ? 'success' : 'default'}>
                    {enabled ? 'ON' : 'OFF'}
                  </Badge>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Maintenance Section */}
        {config.features.maintenanceMode && (
          <View style={styles.section}>
            <Text variant="heading4" style={styles.sectionTitle}>
              Maintenance
            </Text>
            <View style={styles.configRow}>
              <Text style={styles.configKey}>Status</Text>
              <Badge variant="error">
                DOWN
              </Badge>
            </View>
            {config.features.maintenanceMessage && (
              <Text style={styles.maintenanceMessage}>
                {config.features.maintenanceMessage}
              </Text>
            )}
          </View>
        )}

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Last updated: {new Date(data.lastSync).toLocaleString()}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = createSheet({
  scrollView: {
    flex: 1,
  },
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#6B7280',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  configKey: {
    fontSize: 14,
    fontWeight: '500',
  },
  configValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolloutText: {
    fontSize: 12,
    color: '#6B7280',
  },
  maintenanceMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#DC2626',
    fontStyle: 'italic',
  },
  lastUpdated: {
    marginTop: 16,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
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
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
});
