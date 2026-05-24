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
import { execSync } from 'child_process';

// ============================================================================
// Configuration
// ============================================================================

const MAX_LINES = 200;
const SRC_DIR = path.join(__dirname, '../src');

// Patterns to check
const PATTERNS = {
  hardcodedColors: /#[0-9A-Fa-f]{3,8}/g,
  consoleLog: /console\.(log|warn|info|debug)\(/g,
  styleSheetCreate: /StyleSheet\.create\(/g,
  anyType: /:\s*any\b/g,
};

// Allowed hardcoded colors (theme definitions)
const ALLOWED_COLOR_FILES = [
  'theme/tokens/colors.ts',
  'theme/createTheme.ts',
];

// ============================================================================
// Types
// ============================================================================

interface CheckResult {
  file: string;
  issues: string[];
}

interface CheckSummary {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  results: CheckResult[];
}

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
// Check Functions
// ============================================================================

function checkFileSize(content: string, filePath: string): string | null {
  const lines = content.split('\n').length;
  if (lines > MAX_LINES) {
    return `File has ${lines} lines (max ${MAX_LINES})`;
  }
  return null;
}

function checkHardcodedColors(
  content: string,
  filePath: string
): string | null {
  // Skip theme definition files
  if (ALLOWED_COLOR_FILES.some((f) => filePath.includes(f))) {
    return null;
  }

  const matches = content.match(PATTERNS.hardcodedColors);
  if (matches && matches.length > 0) {
    const uniqueColors = [...new Set(matches)].slice(0, 5); // Show first 5
    return `Hardcoded colors found: ${uniqueColors.join(', ')}${matches.length > 5 ? '...' : ''}`;
  }
  return null;
}

function checkConsoleLog(content: string): string | null {
  const matches = content.match(PATTERNS.consoleLog);
  if (matches && matches.length > 0) {
    return `Found ${matches.length} console.* statements (use createDebugger instead)`;
  }
  return null;
}

function checkStyleSheetCreate(content: string): string | null {
  if (PATTERNS.styleSheetCreate.test(content)) {
    return 'Uses StyleSheet.create (use inline styles with theme tokens)';
  }
  return null;
}

function checkPartNFiles(filePath: string): string | null {
  if (/\.part-\d+\.tsx?$/.test(filePath)) {
    return 'Uses .part-N.ts pattern — decompose by domain instead';
  }
  return null;
}

function checkAnyTypes(content: string): string | null {
  const matches = content.match(PATTERNS.anyType);
  if (matches && matches.length > 0) {
    return `Found ${matches.length} 'any' type(s) (must be typed)`;
  }
  return null;
}

// ============================================================================
// Main Check
// ============================================================================

function checkFile(filePath: string): CheckResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  const issues: string[] = [];

  // Run all checks
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

// Exit with error code if issues found
process.exit(summary.totalIssues > 0 ? 1 : 0);
