/**
 * Classification enforcement — folders and routing
 *
 * Verifies:
 * 1. Every src/features/ folder has a classification entry
 * 2. Archived features cannot route
 * 3. Archived feature keys not in route registry
 */

import { readdirSync } from 'fs';
import { join } from 'path';
import {
  FINAL_RELEASE_CLASSIFICATION,
  ARCHIVED,
  validateClassification,
} from '../final-release-classification';
import {
  getArchivedFolders,
  getUniqueFolders,
  getEntriesByFolder,
  getAllEntries,
} from '../classification-codec';
import type { FeatureKey } from '../feature-access';
import { FEATURE_ROUTE_REGISTRY } from '../../../navigation/feature-route-registry';

const PROJECT_ROOT = process.cwd();
const FEATURES_DIR = join(PROJECT_ROOT, 'src', 'features');
const ARCHIVE_FEATURES_DIR = join(PROJECT_ROOT, 'archive', 'features');
const SKIP_FOLDERS = new Set(['components']);

function actualFeatureFolders(): string[] {
  return readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !SKIP_FOLDERS.has(e.name))
    .map((e) => e.name);
}

describe('Classification — every feature folder classified', () => {
  it('classification entries pass schema validation', () => {
    const validated = validateClassification();
    expect(validated).toHaveLength(FINAL_RELEASE_CLASSIFICATION.length);
  });

  it('every folder in src/features/ has at least one classification entry', () => {
    const folders = actualFeatureFolders();
    const classifiedFolders = new Set(getUniqueFolders());
    for (const folder of folders) {
      expect(classifiedFolders.has(folder)).toBe(true);
    }
  });

  it('no classification entry references non-existent folder', () => {
    const folders = new Set(actualFeatureFolders());
    for (const entry of getAllEntries()) {
      expect(folders.has(entry.folder) || readdirSync(ARCHIVE_FEATURES_DIR).includes(entry.folder)).toBe(true);
    }
  });

  it('no duplicate systemIds', () => {
    const ids = getAllEntries().map((e) => e.systemId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('multientry folders (economy, themes, ai-coach, content-study, monetization) have split classification', () => {
    const economyEntries = getEntriesByFolder('economy');
    expect(economyEntries.length).toBeGreaterThanOrEqual(2);
    const economyStatuses = new Set(economyEntries.map((e) => e.status));
    expect(economyStatuses.has('final_release_internal')).toBe(true);
    expect(economyStatuses.has('archived_or_deactivated')).toBe(true);

    const themesEntries = getEntriesByFolder('themes');
    expect(themesEntries.length).toBeGreaterThanOrEqual(2);
    const themesStatuses = new Set(themesEntries.map((e) => e.status));
    expect(themesStatuses.has('final_release_active')).toBe(true);
    expect(themesStatuses.has('archived_or_deactivated')).toBe(true);

    const coachEntries = getEntriesByFolder('ai-coach');
    expect(coachEntries.length).toBeGreaterThanOrEqual(2);
    const coachStatuses = new Set(coachEntries.map((e) => e.status));
    expect(coachStatuses.has('final_release_active')).toBe(true);
    expect(coachStatuses.has('final_release_progressive')).toBe(true);

    const studyEntries = getEntriesByFolder('content-study');
    expect(studyEntries.length).toBeGreaterThanOrEqual(3);

    const monetizationEntries = getEntriesByFolder('monetization');
    expect(monetizationEntries.length).toBeGreaterThanOrEqual(2);
    const monStatuses = new Set(monetizationEntries.map((e) => e.status));
    expect(monStatuses.has('final_release_internal')).toBe(true);
    expect(monStatuses.has('final_release_progressive')).toBe(true);
  });
});

describe('Classification — archived features cannot route', () => {
  const archivedFolders = getArchivedFolders();

  it('no archived feature folder has a route in FEATURE_ROUTE_REGISTRY', () => {
    for (const entry of FEATURE_ROUTE_REGISTRY) {
      expect(archivedFolders.has(entry.feature)).toBe(false);
    }
  });

  it('archived feature keys are not in FEATURE_ROUTE_REGISTRY', () => {
    const registryFeatures = new Set(FEATURE_ROUTE_REGISTRY.map((r) => r.feature));
    const archivedKeys = ARCHIVED
      .filter((e) => typeof e.featureKey === 'string')
      .map((e) => e.featureKey as FeatureKey);

    for (const key of archivedKeys) {
      expect(registryFeatures.has(key)).toBe(false);
    }
  });

  it('active/progressive feature keys that need routes ARE in FEATURE_ROUTE_REGISTRY', () => {
    const registryFeatures = new Set(FEATURE_ROUTE_REGISTRY.map((r) => r.feature));
    const expectedRouted: FeatureKey[] = [
      'companion_detail', 'boss_tab', 'challenges',
      'ai_coach_advanced', 'achievements', 'content_study',
    ];
    for (const key of expectedRouted) {
      expect(registryFeatures.has(key)).toBe(true);
    }
  });
});
