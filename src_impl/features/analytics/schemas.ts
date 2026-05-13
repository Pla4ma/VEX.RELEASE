/**
 * Analytics Feature Schemas
 * Zod schemas for validation at all boundaries
 */

import { z } from 'zod';

// Export inferred types for use in other files
// Metric types
// Dimension types for filtering/grouping
// Trend direction
// Time ranges
// Insight severity
// Insight types
// Dashboard widget types
// Export formats
// Analytics filter
// Time series data point
// Time series data
// Trend analysis
// Insight schema
// Dashboard widget
// Dashboard layout
// Comparative stats
// Detected pattern
// Export job
// Analytics preferences
// Aggregated stats
// Input schemas
// Time range to date conversion
export * from "./schemas.types";
export * from "./schemas.part1";
export * from "./schemas.part2";
