/**
 * Preflight Check Helpers
 *
 * Types, constants, and individual check functions.
 * Extracted from preflight-check.ts for file size compliance.
 */

// ============================================================================
// Configuration
// ============================================================================

export const MAX_LINES = 200;

// Patterns to check
export const PATTERNS = {
  hardcodedColors: /#[0-9A-Fa-f]{3,8}/g,
  consoleLog: /console\.(log|warn|info|debug)\(/g,
  styleSheetCreate: /StyleSheet\.create\(/g,
  anyType: /:\s*any\b/g,
};

// Allowed hardcoded colors (theme definitions)
export const ALLOWED_COLOR_FILES = [
  'theme/tokens/colors.ts',
  'theme/createTheme.ts',
];

// ============================================================================
// Types
// ============================================================================

export interface CheckResult {
  file: string;
  issues: string[];
}

export interface CheckSummary {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  results: CheckResult[];
}

// ============================================================================
// Check Functions
// ============================================================================

export function checkFileSize(content: string, filePath: string): string | null {
  const lines = content.split('\n').length;
  if (lines > MAX_LINES) {
    return `File has ${lines} lines (max ${MAX_LINES})`;
  }
  return null;
}

export function checkHardcodedColors(
  content: string,
  filePath: string
): string | null {
  if (ALLOWED_COLOR_FILES.some((f) => filePath.includes(f))) {
    return null;
  }

  const matches = content.match(PATTERNS.hardcodedColors);
  if (matches && matches.length > 0) {
    const uniqueColors = [...new Set(matches)].slice(0, 5);
    return `Hardcoded colors found: ${uniqueColors.join(', ')}${matches.length > 5 ? '...' : ''}`;
  }
  return null;
}

export function checkConsoleLog(content: string): string | null {
  const matches = content.match(PATTERNS.consoleLog);
  if (matches && matches.length > 0) {
    return `Found ${matches.length} console.* statements (use createDebugger instead)`;
  }
  return null;
}

export function checkStyleSheetCreate(content: string): string | null {
  if (PATTERNS.styleSheetCreate.test(content)) {
    return 'Uses StyleSheet.create (use inline styles with theme tokens)';
  }
  return null;
}

export function checkPartNFiles(filePath: string): string | null {
  if (/\.part-\d+\.tsx?$/.test(filePath)) {
    return 'Uses .part-N.ts pattern — decompose by domain instead';
  }
  return null;
}

export function checkAnyTypes(content: string): string | null {
  const matches = content.match(PATTERNS.anyType);
  if (matches && matches.length > 0) {
    return `Found ${matches.length} 'any' type(s) (must be typed)`;
  }
  return null;
}
