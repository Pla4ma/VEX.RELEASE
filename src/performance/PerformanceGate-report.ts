import type {
  PerformanceGateResult,
  PerformanceIssue,
} from './PerformanceGate-types';

export function generateRecommendations(issues: PerformanceIssue[]): string[] {
  const recommendations: string[] = [];
  const categories = new Set(issues.map((issue) => issue.category));
  if (categories.has('fps') || categories.has('animation')) {
    recommendations.push(
      'Enable hardware acceleration and use optimized rendering techniques',
    );
  }
  if (categories.has('memory')) {
    recommendations.push(
      'Implement memory pooling and optimize data structures',
    );
  }
  if (categories.has('network')) {
    recommendations.push('Optimize API calls and implement request caching');
  }
  if (categories.has('bundle')) {
    recommendations.push('Use code splitting and remove unused dependencies');
  }
  issues.forEach((issue) => {
    if (!recommendations.includes(issue.recommendation)) {
      recommendations.push(issue.recommendation);
    }
  });
  return recommendations;
}

export function generateReport(result: PerformanceGateResult): string {
  let report = '# Performance Gate Report\n\n';
  report += `**Overall Status: ${result.passed ? 'PASSED' : 'FAILED'}**\n`;
  report += `**Score: ${result.score}/100**\n\n`;
  report += '## Metrics\n\n';
  report += '### FPS\n';
  report += `- Current: ${result.metrics.fps.current}\n`;
  report += `- Average: ${result.metrics.fps.average}\n`;
  report += `- Target: ${result.metrics.fps.target}\n`;
  report += `- Status: ${result.metrics.fps.passed ? 'PASSED' : 'FAILED'}\n\n`;
  report += '### Memory\n';
  report += `- Current: ${result.metrics.memory.current}MB\n`;
  report += `- Limit: ${result.metrics.memory.limit}MB\n`;
  report += `- Status: ${result.metrics.memory.passed ? 'PASSED' : 'FAILED'}\n\n`;
  report += '### Animations\n';
  report += `- Average Duration: ${result.metrics.animations.averageDuration.toFixed(2)}ms\n`;
  report += `- Limit: ${result.metrics.animations.limit}ms\n`;
  report += `- Status: ${result.metrics.animations.passed ? 'PASSED' : 'FAILED'}\n\n`;
  report += '### Network\n';
  report += `- Average Response: ${result.metrics.network.averageResponseTime.toFixed(2)}ms\n`;
  report += `- Limit: ${result.metrics.network.limit}ms\n`;
  report += `- Status: ${result.metrics.network.passed ? 'PASSED' : 'FAILED'}\n\n`;
  report += '### Bundle\n';
  report += `- Size: ${result.metrics.bundle.size}KB\n`;
  report += `- Limit: ${result.metrics.bundle.limit}KB\n`;
  report += `- Status: ${result.metrics.bundle.passed ? 'PASSED' : 'FAILED'}\n\n`;
  if (result.issues.length > 0) {
    report += '## Issues Found\n\n';
    result.issues.forEach((issue) => {
      report += `### ${issue.category.toUpperCase()}: ${issue.message}\n`;
      report += `- **Severity:** ${issue.severity}\n`;
      report += `- **Recommendation:** ${issue.recommendation}\n\n`;
    });
  }
  if (result.recommendations.length > 0) {
    report += '## General Recommendations\n\n';
    result.recommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });
  }
  return report;
}
