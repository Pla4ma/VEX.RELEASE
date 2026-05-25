/**
 * Final Release Source Truth Test
 *
 * Verifies:
 * - src/ is canonical
 * - src_impl_archive/ was deleted (source migration complete)
 * - No production import references src_impl or src_impl_archive
 * - Docs use final-release language
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const SRC = join(PROJECT_ROOT, 'src');
const ARCHIVE = join(PROJECT_ROOT, 'src_impl_archive');

function findAllTsFiles(root: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(root, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        results.push(...findAllTsFiles(fullPath));
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch {
    // directory may not exist
  }
  return results;
}

function findAllMarkdownFiles(root: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(root, entry.name);
      if (entry.isDirectory() && entry.name !== 'archive') {
        results.push(...findAllMarkdownFiles(fullPath));
      } else if (/\.md$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch {
    // directory may not exist
  }
  return results;
}

describe('Source Truth — src is canonical', () => {
  it('src/ directory exists', () => {
    expect(existsSync(SRC)).toBe(true);
  });

  it('src_impl_archive/ does not exist — source migration complete', () => {
    expect(existsSync(ARCHIVE)).toBe(false);
  });

  it('no production file in src/ imports from src_impl_archive', () => {
    const srcFiles = findAllTsFiles(SRC).filter(
      (f) => !f.includes('__tests__') && !f.includes('node_modules'),
    );
    const violations: string[] = [];

    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf8');
      const hasImport = content.includes("'../src_impl_archive")
        || content.includes("'../../src_impl_archive")
        || content.includes("'../../../src_impl_archive")
        || content.includes("'src_impl_archive")
        || content.includes('"src_impl_archive');

      if (hasImport) {
        violations.push(file.replace(PROJECT_ROOT, ''));
      }
    }

    expect(violations).toEqual([]);
  });
});

describe('Docs — final release language', () => {
  const docsDir = join(PROJECT_ROOT, 'docs');

  it('VEX_FINAL_RELEASE_SCOPE.md exists', () => {
    expect(existsSync(join(docsDir, 'VEX_FINAL_RELEASE_SCOPE.md'))).toBe(true);
  });

  it('VEX_FINAL_RELEASE_SCOPE.md uses final-release language', () => {
    const content = readFileSync(
      join(docsDir, 'VEX_FINAL_RELEASE_SCOPE.md'),
      'utf8',
    );
    expect(content).toMatch(/final release/i);
    expect(content).not.toMatch(/public[-\s]?v1|beta/i);
  });

  it('VEX_PRODUCT_CONSTITUTION.md exists', () => {
    expect(existsSync(join(docsDir, 'VEX_PRODUCT_CONSTITUTION.md'))).toBe(true);
  });

  it('FINAL_RELEASE_BLOAT_FIREWALL.md exists', () => {
    expect(existsSync(join(docsDir, 'FINAL_RELEASE_BLOAT_FIREWALL.md'))).toBe(
      true,
    );
  });

  it('FINAL_RELEASE_FEATURE_CLASSIFICATION.md exists', () => {
    expect(
      existsSync(join(docsDir, 'FINAL_RELEASE_FEATURE_CLASSIFICATION.md')),
    ).toBe(true);
  });

  it('AI_AGENT_RULES_FOR_VEX.md references FINAL_RELEASE_SCOPE.md not V1', () => {
    const content = readFileSync(
      join(docsDir, 'AI_AGENT_RULES_FOR_VEX.md'),
      'utf8',
    );
    expect(content).toContain('VEX_FINAL_RELEASE_SCOPE.md');
    expect(content).toContain('src/ is the canonical');
    expect(content).not.toMatch(/public[-\s]?v1|beta/i);
  });

  it('active docs do not use beta/public-v1 or instruct edits in src_impl', () => {
    const docs = findAllMarkdownFiles(docsDir);
    const violations: string[] = [];

    for (const doc of docs) {
      const content = readFileSync(doc, 'utf8');
      if (
        /public[-\s]?v1|beta/i.test(content)
        || /source of truth:\s*`?src_impl/i.test(content)
        || /must target src_impl/i.test(content)
      ) {
        violations.push(doc.replace(PROJECT_ROOT, ''));
      }
    }

    expect(violations).toEqual([]);
  });

  it('legacy V1 scope doc no longer exists', () => {
    expect(existsSync(join(docsDir, 'FINAL_RELEASE_SCOPE.md'))).toBe(false);
  });
});
