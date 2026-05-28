import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useExportAnalytics, useExportJobs } from "../hooks";
import { ExportProgress } from "./ExportProgress";
import { ErrorBoundary } from "../../../errors/ErrorBoundary";
import { SkeletonList } from "../../../shared/ui/primitives/Skeleton";
import { launchColors } from "@theme/tokens/launch-colors";
import { styles } from "./DataExportScreen.styles";
import {
  type DataExportScreenProps,
  type DataCategory,
  type ExportFormat,
  CATEGORIES,
  CategorySelector,
  FormatSelector,
  DangerZoneSection,
  ConfirmExportModal,
} from "./data-export-helpers";

export type { DataExportScreenProps, ExportFormat, DataCategory };

export function DataExportScreen({ userId, onClose }: DataExportScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>("all");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { data: exportJobs, isLoading: jobsLoading } = useExportJobs(userId);
  const exportMutation = useExportAnalytics(userId);

  const handleExport = useCallback(() => { setShowConfirmModal(true); }, []);

  const confirmExport = useCallback(async () => {
    setShowConfirmModal(false);
    try {
      await exportMutation.mutateAsync({
        format: selectedFormat,
        dataTypes: [selectedCategory],
        dateRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
      });
      Alert.alert("Export Started", "Your data export has been queued. You'll be notified when it's ready.", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert("Export Failed", "Unable to start export. Please try again.", [{ text: "OK" }]);
    }
  }, [exportMutation, selectedFormat, selectedCategory]);

  const handleDownload = useCallback((jobId: string) => {
    Alert.alert("Download", `Downloading export ${jobId}...`);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Close button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Data Export</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ErrorBoundary>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Your Data</Text>
            <Text style={styles.description}>
              Download a copy of your data. Exports are prepared securely and available for 7 days.
            </Text>
          </View>

          <CategorySelector selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          <FormatSelector selectedFormat={selectedFormat} onSelect={setSelectedFormat} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Include Metadata</Text>
                <Text style={styles.optionSubtitle}>Timestamps, device info, app version</Text>
              </View>
              <Switch
                value={includeMetadata}
                onValueChange={setIncludeMetadata}
                trackColor={{ false: launchColors.hex_e5e7eb, true: launchColors.hex_6366f1 }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Category</Text>
                <Text style={styles.previewValue}>
                  {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Format</Text>
                <Text style={styles.previewValue}>{selectedFormat.toUpperCase()}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Metadata</Text>
                <Text style={styles.previewValue}>{includeMetadata ? "Included" : "Excluded"}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.exportButton, pressed && { opacity: 0.8 }]}
            onPress={handleExport}
            disabled={exportMutation.isPending}
            accessibilityLabel="Start Export button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.exportButtonText}>
              {exportMutation.isPending ? "Preparing..." : "Start Export"}
            </Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Exports</Text>
            {jobsLoading ? (
              <SkeletonList count={2} />
            ) : exportJobs && exportJobs.length > 0 ? (
              exportJobs.map((job) => (
                <ExportProgress
                  key={job.id}
                  job={job}
                  onDownload={() => handleDownload(job.id)}
                  onRetry={() =>
                    exportMutation.mutateAsync({
                      format: selectedFormat,
                      dataTypes: ["analytics"],
                      dateRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyExports}>
                <Text style={styles.emptyExportsText}>No exports yet</Text>
              </View>
            )}
          </View>

          <DangerZoneSection />
        </ErrorBoundary>
      </ScrollView>

      <ConfirmExportModal
        visible={showConfirmModal}
        selectedCategory={selectedCategory}
        selectedFormat={selectedFormat}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmExport}
      />
    </View>
  );
}
