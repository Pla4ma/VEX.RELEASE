/**
 * Performance Audit Script
 * 
 * Analyzes codebase for performance issues and opportunities
 * Run with: node scripts/performance-audit.js
 */

const fs = require('fs');
const path = require('path');
const { RULES, generateRecommendations } = require('./performance-audit-helpers');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const METRICS_FILE = path.join(__dirname, '..', 'docs', 'performance-metrics.json');

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
    for (const file of results.files.slice(0, 20)) {
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

  const recommendations = generateRecommendations(results);
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
    recommendations: generateRecommendations(results),
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
