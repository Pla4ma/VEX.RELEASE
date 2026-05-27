/**
 * Performance Audit Helpers
 *
 * Performance rules and recommendation logic.
 * Extracted from performance-audit.js for file size compliance.
 */

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
      const flatLists = content.match(/<FlatList/g) || [];
      const flashLists = content.match(/<FlashList/g) || [];
      return flatLists.length - flashLists.length;
    }
  }
};

/**
 * Generate recommendations based on findings
 */
function generateRecommendations(results) {
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

module.exports = { RULES, generateRecommendations };
