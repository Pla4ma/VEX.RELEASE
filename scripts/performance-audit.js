/**
 * Performance Audit Script
 * 
 * Analyzes codebase for performance issues and opportunities
 * Run with: node scripts/performance-audit.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const METRICS_FILE = path.join(__dirname, '..', 'docs', 'performance-metrics.json');

// Performance rules to check
const RULES = {
  // React optimization patterns
  missingUseMemo: {
    severity: 'warning',
    pattern: /useCallback\([^)]+\)\s*\n[^}]*\{[^}]*map\(|filter\(|reduce\(/g,
    message: 'useCallback with array methods may benefit from useMemo for the computation',
    check: (content) => {
      const callbacks = content.match(/useCallback\([^)]+\)/g) || [];
      return callbacks.filter(cb => 
        /map\(|filter\(|reduce\(/.test(cb)
      ).length;
    }
  },
  
  // Animation patterns
  inlineAnimatedStyles: {
    severity: 'warning',
    message: 'Avoid inline animated style objects - use useAnimatedStyle hook',
    pattern: /style=\{\{\s*transform:\s*\[.*animated/g,
    check: (content) => (content.match(/style=\{\{[^}]*transform:/g) || []).length
  },
  
  // Re-renders
  inlineObjectsInProps: {
    severity: 'warning',
    message: 'Inline objects in JSX props can cause unnecessary re-renders',
    pattern: /\s[a-zA-Z]+=\{\{[^}]+\}\}/g,
    check: (content) => {
      // Count inline style objects and other inline objects
      return (content.match(/\sstyle=\{\{[^}]+\}\}/g) || []).length +
             (content.match(/\soptions=\{\{[^}]+\}\}/g) || []).length;
    }
  },
  
  // Memory leaks
  missingCleanup: {
    severity: 'error',
    message: 'useEffect may be missing cleanup function for subscriptions',
    pattern: /useEffect\([^)]+subscribe|addEventListener|setInterval|setTimeout/,
    check: (content) => {
      const effects = content.match(/useEffect\([^)]+\)/gs) || [];
      return effects.filter(effect => 
        /subscribe|addEventListener|setInterval|setTimeout/.test(effect) &&
        !/return\s*\(\s*\)/.test(effect) &&
        !/return\s*[^;]+;/.test(effect)
      ).length;
    }
  },
  
  // Image optimization
  unoptimizedImages: {
    severity: 'warning',
    message: 'Images should use react-native-fast-image for better performance',
    pattern: /<Image[^>]*source=/g,
    check: (content) => {
      const images = content.match(/<Image[^>]*source=/g) || [];
      const fastImages = content.match(/<FastImage[^>]*source=/g) || [];
      return images.length - fastImages.length;
    }
  },
  
  // List virtualization
  nonVirtualizedLists: {
    severity: 'error',
    message: 'Large lists should use FlashList instead of ScrollView or FlatList',
    pattern: /<ScrollView[^>]*>[\s\S]*?\{[^}]*\.map\(/g,
    check: (content) => {
      const scrollViewsWithMap = content.match(/<ScrollView[^>]*>[\s\S]{0,500}\{/g) || [];
      const flatLists = content.match(/<FlatList/g) || [];
      const flashLists = content.match(/<FlashList/g) || [];
      // If using FlatList but not FlashList
      return flatLists.length - flashLists.length;
    }
  }
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: 0,
    issues: { error: 0, warning: 0, info: 0 },
    filesWithIssues: 0,
  },
  files: [],
};

/**
 * Recursively find all TypeScript/TSX files
 */
function findFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = [];
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('__tests__')) {
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  const fileResults = {
    path: relativePath,
    issues: [],
  };

  for (const [ruleName, rule] of Object.entries(RULES)) {
    const count = rule.check(content);
    if (count > 0) {
      fileResults.issues.push({
        rule: ruleName,
        severity: rule.severity,
        message: rule.message,
        count,
      });
      results.summary.issues[rule.severity] += count;
    }
  }

  if (fileResults.issues.length > 0) {
    results.files.push(fileResults);
    results.summary.filesWithIssues++;
  }

  results.summary.totalFiles++;
}

/**
 * Generate recommendations based on findings
 */
function generateRecommendations() {
  const recommendations = [];
  
  if (results.summary.issues.error > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Memory Leaks & Performance',
      action: 'Fix critical performance issues identified',
      files: results.files
        .filter(f => f.issues.some(i => i.severity === 'error'))
        .map(f => f.path),
    });
  }

  const listIssues = results.files.filter(f => 
    f.issues.some(i => i.rule === 'nonVirtualizedLists')
  );
  if (listIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'List Virtualization',
      action: 'Migrate to FlashList for better list performance',
      files: listIssues.map(f => f.path),
    });
  }

  const memoIssues = results.files.filter(f => 
    f.issues.some(i => i.rule === 'missingUseMemo')
  );
  if (memoIssues.length > 5) {
    recommendations.push({
      priority: 'medium',
      category: 'React Optimization',
      action: 'Add useMemo for expensive computations in useCallback',
      count: memoIssues.length,
    });
  }

  const imageIssues = results.files.filter(f =>
    f.issues.some(i => i.rule === 'unoptimizedImages')
  );
  if (imageIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Image Loading',
      action: 'Consider using react-native-fast-image for better image caching',
      count: imageIssues.length,
    });
  }

  return recommendations;
}

/**
 * Print report to console
 */
function printReport() {
  console.log('\n🔍 Performance Audit Report\n');
  console.log('=' .repeat(60));
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total files analyzed: ${results.summary.totalFiles}`);
  console.log(`  Files with issues: ${results.summary.filesWithIssues}`);
  console.log(`  Errors: ${results.summary.issues.error}`);
  console.log(`  Warnings: ${results.summary.issues.warning}`);
  console.log(`  Info: ${results.summary.issues.info}`);

  if (results.files.length > 0) {
    console.log(`\n📁 Files with Issues:`);
    for (const file of results.files.slice(0, 20)) { // Show first 20
      console.log(`\n  ${file.path}`);
      for (const issue of file.issues) {
        const icon = issue.severity === 'error' ? '🔴' : 
                     issue.severity === 'warning' ? '🟡' : '🔵';
        console.log(`    ${icon} ${issue.message} (${issue.count} occurrences)`);
      }
    }
    
    if (results.files.length > 20) {
      console.log(`\n  ... and ${results.files.length - 20} more files`);
    }
  }

  const recommendations = generateRecommendations();
  if (recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    for (const rec of recommendations) {
      const icon = rec.priority === 'high' ? '🔴' : '🟡';
      console.log(`\n  ${icon} ${rec.category}`);
      console.log(`     ${rec.action}`);
      if (rec.files) {
        console.log(`     Affected files: ${rec.files.length}`);
      }
    }
  }

  // Performance targets
  console.log(`\n🎯 Performance Targets:`);
  console.log(`  Bundle Size: < 15MB (iOS), < 20MB (Android)`);
  console.log(`  Time to Interactive: < 2s`);
  console.log(`  First Contentful Paint: < 1.5s`);
  console.log(`  Animation Frame Rate: 60fps`);

  console.log('\n' + '='.repeat(60));
  console.log(`\nFull report saved to: ${METRICS_FILE}\n`);
}

/**
 * Save results to JSON
 */
function saveResults() {
  const docsDir = path.dirname(METRICS_FILE);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const output = {
    ...results,
    recommendations: generateRecommendations(),
  };

  fs.writeFileSync(METRICS_FILE, JSON.stringify(output, null, 2));
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Running performance audit...');
  
  try {
    const files = findFiles(SRC_DIR);
    console.log(`Found ${files.length} files to analyze...`);
    
    for (const file of files) {
      analyzeFile(file);
    }
    
    saveResults();
    printReport();
    
    // Exit with error code if critical issues found
    if (results.summary.issues.error > 0) {
      console.log('\n❌ Critical performance issues found!\n');
      process.exit(1);
    }
    
    console.log('\n✅ Performance audit complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('Error during audit:', error);
    process.exit(1);
  }
}

main();
