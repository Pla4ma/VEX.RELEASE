#!/usr/bin/env node
/**
 * P2-1: Replace hardcoded hex colors with theme tokens
 * 
 * Strategy:
 * - In .styles.ts / .helpers.ts / -constants.ts / -config.ts files (no React):
 *   → Use `lightColors.semantic.xxx` (static import)
 * - In .tsx component files (may use useTheme):
 *   → For inline styles and JSX props: use `lightColors.semantic.xxx` (static)
 *   → These are used at module level for StyleSheet-like objects
 * - After each replacement, ensure the import is present
 */

const fs = require('fs');
const path = require('path');

// Semantic color mapping: lowercase hex → token path via lightColors
const SEMANTIC_MAP = {
  // === Dark backgrounds ===
  '1a1a2e': 'lightColors.semantic.background',
  '2a2a3e': 'lightColors.semantic.backgroundElevated',
  '3a3a4e': 'lightColors.semantic.border',
  '111827': 'lightColors.semantic.backgroundMuted',
  '0d1117': 'lightColors.semantic.backgroundMuted',
  '1e293b': 'lightColors.semantic.backgroundMuted',
  '374151': 'lightColors.semantic.backgroundMuted',
  '2a2a4e': 'lightColors.semantic.backgroundElevated',
  '2a2a4a': 'lightColors.semantic.backgroundElevated',
  '2d2d44': 'lightColors.semantic.backgroundElevated',
  '3a3a5a': 'lightColors.semantic.backgroundElevated',
  '050914': 'lightColors.semantic.backgroundMuted',

  // === Light backgrounds ===
  'f7f9fc': 'lightColors.semantic.background',
  'f1f5f9': 'lightColors.surface.button',
  'e2e8f0': 'lightColors.surface.pressed',
  'e5e7eb': 'lightColors.border.light',
  'e1e4e8': 'lightColors.border.light',
  'f3f4f6': 'lightColors.surface.button',
  'e0e0e0': 'lightColors.border.light',
  'f5f5f5': 'lightColors.surface.button',
  'f0f0f0': 'lightColors.surface.button',
  'f9fafb': 'lightColors.surface.button',

  // === White / Black ===
  'fff': 'lightColors.text.inverse',
  'ffffff': 'lightColors.text.inverse',
  '000': 'lightColors.text.primary',
  '000000': 'lightColors.text.primary',

  // === Primary / brand colors ===
  'e94560': 'lightColors.semantic.danger',
  '6366f1': 'lightColors.semantic.primary',
  '4f46e5': 'lightColors.semantic.primary',
  '4338ca': 'lightColors.semantic.primaryPressed',
  '8b5cf6': 'lightColors.accent.purple',
  'a855f7': 'lightColors.accent.purple',
  '3b82f6': 'lightColors.accent.blue',
  '10b981': 'lightColors.accent.green',
  'ec4899': 'lightColors.accent.pink',
  'f59e0b': 'lightColors.semantic.warning',

  // === Semantic success ===
  '4caf50': 'lightColors.semantic.success',
  '22c55e': 'lightColors.semantic.success',
  '8bc34a': 'lightColors.semantic.success',

  // === Semantic danger / error ===
  'ef4444': 'lightColors.semantic.danger',
  'f44336': 'lightColors.semantic.danger',
  'dc2626': 'lightColors.semantic.danger',
  'c53030': 'lightColors.semantic.danger',
  'e53e3e': 'lightColors.semantic.danger',
  'b91c1c': 'lightColors.semantic.danger',
  'ee4044': 'lightColors.semantic.danger',
  'ff5252': 'lightColors.semantic.danger',

  // === Semantic warning ===
  'ffc107': 'lightColors.semantic.warning',
  'ffa500': 'lightColors.semantic.warning',
  'ff9800': 'lightColors.semantic.warning',
  'ff6b35': 'lightColors.semantic.warning',
  'fbbf24': 'lightColors.semantic.warning',
  'b45309': 'lightColors.semantic.warning',
  '92400e': 'lightColors.semantic.warning',

  // === Semantic info ===
  '3b82f6': 'lightColors.accent.blue',

  // === Text muted / disabled ===
  '9e9e9e': 'lightColors.text.muted',
  '9ca3af': 'lightColors.text.muted',
  '6b7280': 'lightColors.text.muted',
  '666': 'lightColors.text.muted',
  'bdbdbd': 'lightColors.text.muted',
  '94a3b8': 'lightColors.text.disabled',
  '64748b': 'lightColors.text.tertiary',
  '334155': 'lightColors.text.secondary',
  '4a5568': 'lightColors.text.tertiary',
  '333': 'lightColors.text.secondary',
  '555': 'lightColors.text.tertiary',
  '888': 'lightColors.text.disabled',
  '999': 'lightColors.text.disabled',
  '616161': 'lightColors.text.muted',
  '718096': 'lightColors.text.muted',
  'a0aec0': 'lightColors.text.disabled',

  // === VEX-specific brand ===
  'ffd700': 'lightColors.semantic.vexGold',
  '00e5ff': 'lightColors.semantic.vexCyan',
  '1a1a1a': 'lightColors.semantic.obsidian',
  '2a2a2a': 'lightColors.semantic.obsidian',

  // === Other common mapped colors ===
  'fde68a': 'lightColors.warning.light',
  'fef3c7': 'lightColors.warning[50]',
  'fee2e2': 'lightColors.error[50]',
  'fef2f2': 'lightColors.error[50]',
  'dbeafe': 'lightColors.info[50]',
  'f0fdf4': 'lightColors.success[50]',
  'dcfce7': 'lightColors.success[50]',
  'f87171': 'lightColors.error.light',
  'fca5a5': 'lightColors.error.light',
  '86efac': 'lightColors.success.light',

  // === Purple / violet spectrum ===
  '9333ea': 'lightColors.accent.purple',
  '6d28d9': 'lightColors.accent.purple',
  '7c3aed': 'lightColors.accent.purple',

  // === Teal / cyan ===
  '4ecdc4': 'lightColors.accent.teal',
  '14b8a6': 'lightColors.accent.teal',
  '06b6d4': 'lightColors.accent.teal',
  '0ea5e9': 'lightColors.accent.teal',

  // === Red accent (VEX specific) ===
  'ff6b6b': 'lightColors.semantic.danger',
  'e9456020': 'lightColors.semantic.dangerSoft',

  // === Amber / orange accents ===
  'ff4500': 'lightColors.semantic.danger',
  'ff5722': 'lightColors.semantic.danger',
  'f97316': 'lightColors.accent.orange',
  'ea580c': 'lightColors.accent.orange',
  'ed8936': 'lightColors.accent.orange',

  // === Green spectrum ===
  '16a34a': 'lightColors.semantic.success',
  '059669': 'lightColors.semantic.success',

  // === Blue spectrum ===
  '2563eb': 'lightColors.accent.blue',
  '1d4ed8': 'lightColors.info.DEFAULT',
  '3182ce': 'lightColors.accent.blue',
  '4299e1': 'lightColors.accent.blue',
  '60a5fa': 'lightColors.accent.blue',

  // === Pink spectrum ===
  'ec4899': 'lightColors.accent.pink',
  'f472b6': 'lightColors.accent.pink',

  // === Dark surfaces ===
  '070a12': 'lightColors.semantic.backgroundMuted',
  '0d1322': 'lightColors.semantic.backgroundMuted',
  '162033': 'lightColors.semantic.backgroundElevated',
};

// Colors that exist in the hex token registry (launchColors)
const HEX_TOKEN_COLORS = new Set([
  '95e1d3', 'a8e6cf', 'ffd93d', 'ff6b6b', 'ff1744', 'ff0000',
  'e91e63', 'be185d', 'db2777', 'f4511e', 'ff1493', 'ff00ff',
  'fdba74', 'fcd34d', 'fecaca', 'fed7d7', 'fee2e2', 'fef2f2',
  'fef9c3', 'fef3c7', 'ffe0b2', 'ffeb3b', 'ffd54f', 'fff8e1',
  'fff3e0', 'fffacd', 'fffbcd', 'ffebee', 'f5a623', 'f7931e',
  'f6ad55', 'f6bf26', 'f6e05e', 'f87171', 'fc8181', 'fca5a5',
  'fecaca', 'fed7d7', 'b9f2ff', 'e6e6fa', 'e8f4fd', 'e8f5e9',
  'ecfdf5', 'e3f2fd', 'f0f8ff', 'f3e5f5', 'f3e8ff', 'fdf4ff',
  'faf5ff', 'e9d5ff', 'ede9fe', 'eef2ff', 'e0e7ff', 'eff6ff',
  'c7d2fe', 'a5b4fc', '818cf8', '93c5fd', 'bfdbfe', 'dbeafe',
  'c084fc', 'd8b4fe', '8b5cf6', '9f7aea', 'a855f7', 'c084fc',
  'f472b6', 'fb923c', 'fdba74', 'b98cff', 'f56c8f',
  '654321', '8b4513', 'deb887', 'cd7f32',
  '2e7d32', '0b8043', '15803d', '166534', '1b4332', '2d6a4f',
  '276749', '2f855a', '38a169', '48bb78', '52b788', '68d391',
  '9acd32', 'b9fbc0',
  'e9456020', 'e9456080', 'ffffff20',
  'ef444420', 'ef444430', 'ef444440',
  'f59e0b20', '22c55e30', '10b98120',
  'eef2ff20',
]);

const SRC_DIR = '/root/projects/VEX.RELEASE/src';

function getAllTargetFiles() {
  const { execSync } = require('child_process');
  const result = execSync(
    `grep -rln '#[0-9A-Fa-f]\\{6\\}\\|#[0-9A-Fa-f]\\{3\\}' ${SRC_DIR}/ --include='*.ts' --include='*.tsx' ` +
    `| grep -v 'theme/tokens\\|__tests__\\|node_modules\\|archive'`,
    { encoding: 'utf-8' }
  ).trim();
  return result.split('\n').filter(Boolean);
}

function normalizeHex(hex) {
  return hex.replace('#', '').toLowerCase();
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Skip theme/tokens files
  if (filePath.includes('theme/tokens')) return { changed: false, replacements: 0 };
  // Skip test files
  if (filePath.includes('__tests__')) return { changed: false, replacements: 0 };
  // Skip archive
  if (filePath.includes('archive')) return { changed: false, replacements: 0 };
  
  let replacements = 0;
  let needsLightColorsImport = false;
  let needsLaunchColorsImport = false;
  
  // Replace hex colors with semantic tokens
  // Match patterns like '#1a1a2e' or '#fff' (3 or 6 hex digits)
  // Must NOT be inside a string that's already a token definition
  
  const hexPattern = /'#([0-9A-Fa-f]{3,8})'/g;
  
  content = content.replace(hexPattern, (match, hexVal) => {
    // Handle 8-digit hex (with alpha) - normalize to 6 first for lookup
    let lookupHex = hexVal.toLowerCase();
    if (lookupHex.length === 3) {
      // Expand 3-digit hex: #fff → ffffff
      lookupHex = lookupHex[0]+lookupHex[0]+lookupHex[1]+lookupHex[1]+lookupHex[2]+lookupHex[2];
    }
    
    // Check semantic map first
    if (SEMANTIC_MAP[lookupHex]) {
      replacements++;
      needsLightColorsImport = true;
      return SEMANTIC_MAP[lookupHex];
    }
    
    // Check if it's a known hex token (3-4 or 6-8 digit)
    if (HEX_TOKEN_COLORS.has(lookupHex) || HEX_TOKEN_COLORS.has(hexVal.toLowerCase())) {
      replacements++;
      needsLaunchColorsImport = true;
      return `launchColors.hex_${hexVal.toLowerCase()}`;
    }
    
    // Leave unmapped colors with a TODO comment
    return match; // don't replace
  });
  
  // Also handle hex colors in JSX props without quotes: color="#xxx"
  const jsxHexPattern = /="#([0-9A-Fa-f]{3,8})"/g;
  content = content.replace(jsxHexPattern, (match, hexVal) => {
    let lookupHex = hexVal.toLowerCase();
    if (lookupHex.length === 3) {
      lookupHex = lookupHex[0]+lookupHex[0]+lookupHex[1]+lookupHex[1]+lookupHex[2]+lookupHex[2];
    }
    
    if (SEMANTIC_MAP[lookupHex]) {
      replacements++;
      needsLightColorsImport = true;
      return `"${SEMANTIC_MAP[lookupHex]}"`;
    }
    
    if (HEX_TOKEN_COLORS.has(lookupHex)) {
      replacements++;
      needsLaunchColorsImport = true;
      return `"launchColors.hex_${hexVal.toLowerCase()}"`;
    }
    
    return match;
  });
  
  if (content !== original) {
    // Add imports if needed
    const hasLightColorsImport = content.includes('lightColors');
    const hasLaunchColorsImport = content.includes('launchColors');
    
    if (needsLightColorsImport && !hasLightColorsImport) {
      // Find the last import line
      const importLine = "import { lightColors } from '@/theme/tokens/colors';\n";
      const firstNonImport = content.match(/^import[^\n]*\n/);
      if (firstNonImport) {
        // Add after last import
        const lastImportMatch = content.match(/(?:^import[^\n]*\n)+/);
        if (lastImportMatch) {
          const insertPos = lastImportMatch.index + lastImportMatch[0].length;
          if (!content.substring(0, insertPos).includes('lightColors')) {
            content = content.substring(0, insertPos) + importLine + content.substring(insertPos);
          }
        }
      } else {
        content = importLine + content;
      }
    }
    
    if (needsLaunchColorsImport && !hasLaunchColorsImport) {
      const importLine = "import { launchColors } from '@/theme/tokens/launch-colors';\n";
      const lastImportMatch = content.match(/(?:^import[^\n]*\n)+/);
      if (lastImportMatch) {
        const insertPos = lastImportMatch.index + lastImportMatch[0].length;
        if (!content.substring(0, insertPos).includes('launchColors')) {
          content = content.substring(0, insertPos) + importLine + content.substring(insertPos);
        }
      } else {
        content = importLine + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return { changed: true, replacements };
  }
  
  return { changed: false, replacements: 0 };
}

// Main
const files = getAllTargetFiles();
console.log(`Processing ${files.length} files...`);

let totalReplacements = 0;
let filesChanged = 0;

for (const file of files) {
  try {
    const result = processFile(file);
    if (result.changed) {
      filesChanged++;
      totalReplacements += result.replacements;
      console.log(`✓ ${path.relative(SRC_DIR, file)}: ${result.replacements} replacements`);
    }
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

console.log(`\nTotal: ${filesChanged} files changed, ${totalReplacements} replacements`);
