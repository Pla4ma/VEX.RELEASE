/**
 * Analytics Hooks
 * TanStack Query hooks for analytics data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import * as service from '../service';
import * as repository from '../repository';
import { GetAnalyticsDataInputSchema, CreateExportJobInputSchema, UpdateDashboardWidgetInputSchema, type TimeRange, type AnalyticsMetric, type AnalyticsDimension, type AnalyticsFilter, type ExportFormat } from '../schemas';

// Query keys
// Hook: Get analytics data for multiple metrics
// Hook: Get trend analysis for a specific metric
// Hook: Get insights for user
// Hook: Get unread insights count
// Hook: Mark insight as read
// Hook: Get detected patterns
// Hook: Get dashboard layout
// Hook: Update dashboard widget
// Hook: Get export jobs
// Hook: Create export job
// Hook: Create export job (alias for useExportAnalytics)
export { useCreateExportJob as useExportAnalytics };

// Hook: Get analytics preferences
// Hook: Update analytics preferences
// Hook: Get analytics summary
// Hook: Generate insights manually
// Hook: Detect patterns manually
// Hook: Get comparative stats
// Hook: Degraded mode detection
export * from "./index.part1";
export * from "./index.part2";
