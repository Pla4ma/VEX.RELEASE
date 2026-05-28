import React from "react";
import { View } from "react-native";
import {
  Skeleton,
  SkeletonChart,
} from "../../../shared/ui/primitives/Skeleton";
import type { DashboardTimeRange } from "./AnalyticsDashboard.types";
import { styles } from "./AnalyticsDashboard.styles";

export function HeatmapSkeleton(): React.JSX.Element {
  return (
    <View style={styles.heatmapSkeleton}>
      <Skeleton width="45%" height={20} />
      <Skeleton width="70%" height={14} />
      <SkeletonChart height={180} />
    </View>
  );
}

export function timeRangeToWeeks(timeRange: DashboardTimeRange): number {
  switch (timeRange) {
    case "today":
      return 1;
    case "last_7_days":
      return 1;
    case "last_30_days":
      return 4;
    case "this_month":
      return 4;
  }
}

export function formatMetricName(metric: string): string {
  return metric
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatValue(value: number, metric: string): string {
  if (metric.includes("time")) {
    const hours = Math.floor(value / 3600);
    if (hours > 0) {
      return `${hours}h`;
    }
    const minutes = Math.floor(value / 60);
    return `${minutes}m`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}
