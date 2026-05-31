import type {
  AccessibilityAuditResult,
  AccessibilityIssue,
} from './auditor-types';

export function createAuditResult(
  issues: AccessibilityIssue[],
  passedChecks: string[],
  failedChecks: string[],
): AccessibilityAuditResult {
  const summary = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    major: issues.filter((i) => i.severity === 'major').length,
    moderate: issues.filter((i) => i.severity === 'moderate').length,
    minor: issues.filter((i) => i.severity === 'minor').length,
  };
  const weightedIssues =
    summary.critical * 10 +
    summary.major * 5 +
    summary.moderate * 2 +
    summary.minor * 1;
  const score = Math.max(0, 100 - weightedIssues);
  return {
    score,
    issues,
    passedChecks,
    failedChecks,
    summary,
    timestamp: Date.now(),
  };
}

export function createPassingResult(): AccessibilityAuditResult {
  return {
    score: 100,
    issues: [],
    passedChecks: ['no-audit-required'],
    failedChecks: [],
    summary: { critical: 0, major: 0, moderate: 0, minor: 0 },
    timestamp: Date.now(),
  };
}

export function generateAuditReport(
  auditResult: AccessibilityAuditResult,
): string {
  const { score, issues, summary } = auditResult;
  let report = '# Accessibility Audit Report\n\n';
  report += `**Overall Score: ${score}/100**\n\n`;
  report += '## Issue Summary\n';
  report += `- Critical: ${summary.critical}\n`;
  report += `- Major: ${summary.major}\n`;
  report += `- Moderate: ${summary.moderate}\n`;
  report += `- Minor: ${summary.minor}\n\n`;
  if (issues.length > 0) {
    report += '## Issues Found\n\n';
    issues.forEach((issue) => {
      report += `### ${issue.category.toUpperCase()}: ${issue.message}\n`;
      report += `- **Severity:** ${issue.severity}\n`;
      report += `- **WCAG Guideline:** ${issue.wcagGuideline}\n`;
      report += `- **Recommendation:** ${issue.recommendation}\n`;
      if (issue.element) {
        report += `- **Element:** ${issue.element}\n`;
      }
      report += `- **Automated:** ${issue.automated ? 'Yes' : 'No'}\n\n`;
    });
  } else {
    report += '## ✅ No accessibility issues found!\n';
  }
  return report;
}
