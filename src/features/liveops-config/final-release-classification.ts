/**
 * Final Release Classification — machine-readable single source of truth.
 *
 * Every feature folder in src/features/ classified with exact permissions.
 * Tests enforce downstream configs match this source.
 * Docs generated from this file.
 *
 * Data lives in classification-data-*.ts files, one per status category.
 */

import { z } from "zod";
import { ACTIVE } from "./classification-data-active";
import { ARCHIVED } from "./classification-data-archived";
import { INTERNAL } from "./classification-data-internal";
import { LEGACY } from "./classification-data-legacy";
import { PROGRESSIVE } from "./classification-data-progressive";

// ── Schemas ──

export const ClassificationStatusSchema = z.enum([
  "final_release_active",
  "final_release_progressive",
  "final_release_internal",
  "archived_or_deactivated",
  "test_or_legacy",
]);

export type ClassificationStatus = z.infer<typeof ClassificationStatusSchema>;

export const FeatureClassificationEntrySchema = z.object({
  systemId: z.string().min(1),
  folder: z.string().min(1),
  status: ClassificationStatusSchema,
  featureKey: z.string().optional(),
  minSessions: z.number().int().min(0).optional(),
  routeAllowed: z.boolean(),
  homeAllowed: z.boolean(),
  queryAllowed: z.boolean(),
  subscriptionAllowed: z.boolean(),
  notificationAllowed: z.boolean(),
  completionAllowed: z.boolean(),
  premiumCopyAllowed: z.boolean(),
  appStoreCopyAllowed: z.boolean(),
  notes: z.string(),
});

export type FeatureClassificationEntry = z.infer<
  typeof FeatureClassificationEntrySchema
>;

// ── Combined ──

export const FINAL_RELEASE_CLASSIFICATION: readonly FeatureClassificationEntry[] =
  [...ACTIVE, ...PROGRESSIVE, ...INTERNAL, ...ARCHIVED, ...LEGACY];

export { ACTIVE, PROGRESSIVE, INTERNAL, ARCHIVED, LEGACY };

export function validateClassification(): FeatureClassificationEntry[] {
  return z
    .array(FeatureClassificationEntrySchema)
    .parse(FINAL_RELEASE_CLASSIFICATION);
}
