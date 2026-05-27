/**
 * Preflight Check Script
 *
 * Verifies UI/UX standards compliance before commits.
 * Run with: npx ts-node scripts/preflight-check.ts
 *
 * @phase 4
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MAX_LINES,
  PATTERNS,
  ALLOWED_COLOR_FILES,
  type CheckResult,
  type CheckSummary,
  checkFileSize,
  checkHardcodedColors,
  checkConsoleLog,
  checkStyleSheetCreate,
  checkPartNFiles,
  checkAnyTypes,
} from './preflight-checks';

// ============================================================================
// Configuration
// ============================================================================

const SRC_DIR = path.join(__dirname, '../src');

// ============================================================================
// File Scanner
// ============================================================================

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.includes('node_modules')) {
      files.push(...getAllTsFiles(fullPath));
    } else if (
      stat.isFile() &&
      (item.endsWith('.ts') || item.endsWith('.tsx')) &&
      !item.endsWith('.d.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// ============================================================================
// Main Check
// ============================================================================

function checkFile(filePath: string): CheckResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  const issues: string[] = [];

  const sizeIssue = checkFileSize(content, filePath);
  if (sizeIssue) issues.push(sizeIssue);

  const colorIssue = checkHardcodedColors(content, filePath);
  if (colorIssue) issues.push(colorIssue);

  const consoleIssue = checkConsoleLog(content);
  if (consoleIssue) issues.push(consoleIssue);

  const styleIssue = checkStyleSheetCreate(content);
  if (styleIssue) issues.push(styleIssue);

  const anyIssue = checkAnyTypes(content);
  if (anyIssue) issues.push(anyIssue);

  const partNIssue = checkPartNFiles(filePath);
  if (partNIssue) issues.push(partNIssue);

  return { file: relativePath, issues };
}

function runChecks(): CheckSummary {
  console.log('🔍 Running preflight checks...\n');

  const files = getAllTsFiles(SRC_DIR);
  const results: CheckResult[] = [];

  for (const file of files) {
    const result = checkFile(file);
    if (result.issues.length > 0) {
      results.push(result);
    }
  }

  return {
    totalFiles: files.length,
    filesWithIssues: results.length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
    results,
  };
}

// ============================================================================
// Output
// ============================================================================

function printResults(summary: CheckSummary): void {
  console.log(`\n📊 Summary:`);
  console.log(`  Total files scanned: ${summary.totalFiles}`);
  console.log(`  Files with issues: ${summary.filesWithIssues}`);
  console.log(`  Total issues: ${summary.totalIssues}\n`);

  if (summary.results.length === 0) {
    console.log('✅ All checks passed!\n');
    return;
  }

  console.log('❌ Issues found:\n');

  for (const result of summary.results) {
    console.log(`📄 ${result.file}`);
    for (const issue of result.issues) {
      console.log(`   • ${issue}`);
    }
    console.log('');
  }
}

// ============================================================================
// Run
// ============================================================================

const summary = runChecks();
printResults(summary);

process.exit(summary.totalIssues > 0 ? 1 : 0);
