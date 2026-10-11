/**
 * Conservative performance checks for React Native source files.
 * These rules are intentionally small and dependency-free; findings are review
 * prompts, not claims that a component is slow at runtime.
 */
const RULES = {
  nonVirtualizedLists: {
    severity: 'error',
    message: 'Replace FlatList with the project-standard FlashList',
    check: content => (content.match(/<FlatList\b/g) || []).length,
  },
  mappedScrollViews: {
    severity: 'warning',
    message: 'Review data-backed vertical ScrollView rows that may grow; FlashList is available',
    check: countGrowingScrollCollections,
  },
  indexListKeys: {
    severity: 'warning',
    message: 'Index-based React keys can cause avoidable list item remounts',
    check: content => (content.match(/\bkey\s*=\s*\{\s*(?:index|i)\s*\}/g) || []).length,
  },
};

function countGrowingScrollCollections(content) {
  const spans = findScrollViewSpans(content);
  const mapPattern = /\b([A-Za-z_$][\w$]*)\.map\s*\(/g;
  let count = 0;
  let match;
  while ((match = mapPattern.exec(content)) !== null) {
    const container = spans
      .filter(span => span.start <= match.index && match.index < span.end)
      .sort((left, right) => right.depth - left.depth)[0];
    if (container && !container.horizontal && isGrowingCollectionName(match[1])) {
      count += 1;
    }
  }
  return count;
}

function findScrollViewSpans(content) {
  const spans = [];
  const stack = [];
  const tagPattern = /<\/?ScrollView\b[^>]*>/g;
  let match;
  while ((match = tagPattern.exec(content)) !== null) {
    if (match[0].startsWith('</')) {
      const opened = stack.pop();
      if (opened) {
        spans.push({ ...opened, end: match.index, depth: stack.length + 1 });
      }
    } else if (!match[0].endsWith('/>')) {
      stack.push({
        start: match.index + match[0].length,
        horizontal: /\bhorizontal(?:\s|=|>)/.test(match[0]),
      });
    }
  }
  return spans;
}

function isGrowingCollectionName(name = '') {
  return /(?:jobs|notifications|memories|history|sessions|tasks|items|entries|records|challenges|cosmetics|results|exports|quizzes|lessons|packs|achievements|messages)/i.test(name);
}

function generateRecommendations(results) {
  const recommendations = [];
  const flatListFiles = results.files
    .filter(file => file.issues.some(issue => issue.rule === 'nonVirtualizedLists'))
    .map(file => file.path);
  if (flatListFiles.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'List virtualization',
      action: 'Replace FlatList usage with the existing FlashList dependency.',
      files: flatListFiles,
    });
  }

  const reviewFiles = results.files
    .filter(file => file.issues.some(issue => issue.rule !== 'nonVirtualizedLists'))
    .map(file => file.path);
  if (reviewFiles.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Rendering review',
      action: 'Review mapped scroll content and index-based keys where collection identity can change.',
      files: reviewFiles,
    });
  }

  return recommendations;
}

module.exports = { RULES, generateRecommendations };
