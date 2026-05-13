/**
 * Settings Feature Schemas
 * Zod schemas for validation at all boundaries
 */

import { z } from 'zod';

// Enum schemas
// Export types
// Setting value schema
// Setting schema
// User preferences schema
// Notification settings schema
// Coach settings schema
// Appearance settings schema
// Privacy settings schema
// Data control settings schema
// Sync state schema
// Settings export schema
// Input schemas
// Return type imports (using z.infer to avoid circular deps)
// Default settings factory
// Default notification settings
// Default coach settings
// Default appearance settings
// Default privacy settings
// Default data control settings
export * from "./schemas.types";
export * from "./schemas.part1";
export * from "./schemas.part2";
export * from "./schemas.part3";
