/**
 * Classification codec — derived queries from FINAL_RELEASE_CLASSIFICATION.
 *
 * Provides Set lookups, folder-level queries, and validation.
 * Kept separate from classification data to stay under 200-line limit.
 */

import {
  FINAL_RELEASE_CLASSIFICATION,
  ClassificationStatusSchema,
  FeatureClassificationEntrySchema,
  ACTIVE,
  PROGRESSIVE,
  INTERNAL,
  ARCHIVED,
  LEGACY,
} from "./final-release-classification";
import type {
  FeatureClassificationEntry,
  ClassificationStatus,
} from "./final-release-classification";

export type { FeatureClassificationEntry, ClassificationStatus };

// ── Derived sets ──

const _archivedFolders: ReadonlySet<string> = new Set(
  [...ARCHIVED, ...LEGACY]
    .filter(
      (e) =>
        e.status === "archived_or_deactivated" || e.status === "test_or_legacy",
    )
    .map((e) => e.folder),
);

const _legacyFolders: ReadonlySet<string> = new Set(
  LEGACY.map((e) => e.folder),
);

const _activeSystemIds: ReadonlySet<string> = new Set(
  [...ACTIVE, ...PROGRESSIVE].map((e) => e.systemId),
);

const _internalSystemIds: ReadonlySet<string> = new Set(
  INTERNAL.map((e) => e.systemId),
);

export function getArchivedFolders(): ReadonlySet<string> {
  return _archivedFolders;
}

export function getLegacyFolders(): ReadonlySet<string> {
  return _legacyFolders;
}

export function getActiveSystemIds(): ReadonlySet<string> {
  return _activeSystemIds;
}

export function getInternalSystemIds(): ReadonlySet<string> {
  return _internalSystemIds;
}

export function getUniqueFolders(): string[] {
  return [...new Set(FINAL_RELEASE_CLASSIFICATION.map((e) => e.folder))];
}

export function getAllEntries(): FeatureClassificationEntry[] {
  return [...FINAL_RELEASE_CLASSIFICATION];
}

// ── Folder-level queries ──

export function isFolderActive(folder: string): boolean {
  return FINAL_RELEASE_CLASSIFICATION.filter((e) => e.folder === folder).some(
    (e) =>
      e.status === "final_release_active" ||
      e.status === "final_release_progressive",
  );
}

export function isFolderArchived(folder: string): boolean {
  const entries = FINAL_RELEASE_CLASSIFICATION.filter(
    (e) => e.folder === folder,
  );
  if (entries.length === 0) return false;
  return entries.every(
    (e) =>
      e.status === "archived_or_deactivated" || e.status === "test_or_legacy",
  );
}

export function getFolderStatus(folder: string): ClassificationStatus | null {
  const entry = FINAL_RELEASE_CLASSIFICATION.find((e) => e.folder === folder);
  return entry ? ClassificationStatusSchema.parse(entry.status) : null;
}

// ── Entry lookups ──

export function getEntryBySystemId(
  id: string,
): FeatureClassificationEntry | undefined {
  return FINAL_RELEASE_CLASSIFICATION.find((e) => e.systemId === id);
}

export function getEntriesByFolder(
  folder: string,
): FeatureClassificationEntry[] {
  return FINAL_RELEASE_CLASSIFICATION.filter((e) => e.folder === folder);
}

// ── Validation ──

export function validateAllEntries(): FeatureClassificationEntry[] {
  for (const entry of FINAL_RELEASE_CLASSIFICATION) {
    FeatureClassificationEntrySchema.parse(entry);
  }
  return [...FINAL_RELEASE_CLASSIFICATION];
}
