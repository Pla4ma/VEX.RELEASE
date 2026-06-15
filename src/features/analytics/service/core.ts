import { z } from 'zod';
import { fetchTimeSeriesData } from '../repository/time-series';
import { GetAnalyticsDataInputSchema } from '../schemas';
import * as Sentry from '@sentry/react-native';

export interface AnalyticsService {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
}

const analyticsServiceInstance: AnalyticsService = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: eventName,
      data: properties,
    });
  },
};

export function getAnalyticsService(): AnalyticsService {
  return analyticsServiceInstance;
}

export async function getAnalyticsData(
  input: z.infer<typeof GetAnalyticsDataInputSchema>,
) {
  const validated = GetAnalyticsDataInputSchema.parse(input);
  const results = await Promise.all(
    validated.metrics.map((metric) =>
      fetchTimeSeriesData(
        validated.userId,
        metric,
        validated.timeRange,
        validated.granularity,
        validated.dimensions,
        validated.filters,
      ),
    ),
  );
  return results;
}
