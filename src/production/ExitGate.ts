/**
 * PHASE 9 EXIT GATE - Production Hardening Verification
 * Final gate before production deployment.
 */

import { createDebugger } from "../utils/debug";
import type { OfflineSyncReport } from "../features/session-completion/offline-sync-service";
import type { PaywallVerificationResult } from "../monetization/PaywallVerification";
import type {
  ErrorBoundaryReport,
  AccessibilityReport,
  PerformanceReport,
  PrivacyComplianceReport,
  AppStoreSubmissionResult,
} from "./ExitGate.types";
import {
  verifyOfflineSync,
  verifyErrorBoundaries,
  verifyAccessibility,
  verifyPerformance,
  verifyPrivacy,
  verifyPaywall,
  verifyAppStore,
} from "./ExitGate.verifiers";

const debug = createDebugger("phase9-exit-gate");

export interface Phase9ExitGateResult {
  passed: boolean;
  score: number;
  results: {
    offlineSync: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: OfflineSyncReport;
      issues: string[];
    };
    errorBoundaries: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: ErrorBoundaryReport;
      issues: string[];
    };
    accessibility: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: AccessibilityReport;
      issues: string[];
    };
    performance: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: PerformanceReport;
      issues: string[];
    };
    privacy: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: PrivacyComplianceReport;
      issues: string[];
    };
    paywall: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: PaywallVerificationResult;
      issues: string[];
    };
    appStore: {
      status: "pass" | "fail" | "warning";
      score: number;
      report: AppStoreSubmissionResult;
      issues: string[];
    };
  };
  blockingIssues: Phase9BlockingIssue[];
  recommendations: string[];
  deploymentReady: boolean;
  timestamp: number;
}

export interface Phase9BlockingIssue {
  id: string;
  category:
    | "offline-sync"
    | "error-boundaries"
    | "accessibility"
    | "performance"
    | "privacy"
    | "paywall"
    | "app-store"
    | "general";
  severity: "critical" | "major";
  message: string;
  impact: string;
  recommendation: string;
  estimatedFixTime: string;
}

export interface Phase9GateConfig {
  minimumScores: {
    offlineSync: number;
    errorBoundaries: number;
    accessibility: number;
    performance: number;
    privacy: number;
    paywall: number;
    appStore: number;
  };
  overallMinimumScore: number;
  allowWarnings: boolean;
  requiredCategories: Array<keyof Phase9ExitGateResult["results"]>;
}

export class Phase9ExitGate {
  private static instance: Phase9ExitGate;
  private gateResults: Phase9ExitGateResult[] = [];
  private config: Phase9GateConfig;

  private constructor() {
    this.config = {
      minimumScores: {
        offlineSync: 85,
        errorBoundaries: 90,
        accessibility: 85,
        performance: 80,
        privacy: 95,
        paywall: 85,
        appStore: 90,
      },
      overallMinimumScore: 85,
      allowWarnings: false,
      requiredCategories: [
        "offlineSync",
        "errorBoundaries",
        "accessibility",
        "performance",
        "privacy",
        "paywall",
        "appStore",
      ],
    };
  }

  static getInstance(): Phase9ExitGate {
    if (!Phase9ExitGate.instance) {
      Phase9ExitGate.instance = new Phase9ExitGate();
    }
    return Phase9ExitGate.instance;
  }

  setConfig(config: Partial<Phase9GateConfig>): void {
    this.config = { ...this.config, ...config };
  }
  getConfig(): Phase9GateConfig {
    return { ...this.config };
  }

  async runExitGate(): Promise<Phase9ExitGateResult> {
    debug.info("Running Phase 9 Exit Gate verification...");
    const [
      offlineSync,
      errorBoundaries,
      accessibility,
      performance,
      privacy,
      paywall,
      appStore,
    ] = await Promise.all([
      verifyOfflineSync(),
      verifyErrorBoundaries(),
      verifyAccessibility(),
      verifyPerformance(),
      verifyPrivacy(),
      verifyPaywall(),
      verifyAppStore(),
    ]);
    const results = {
      offlineSync,
      errorBoundaries,
      accessibility,
      performance,
      privacy,
      paywall,
      appStore,
    };
    const scores = Object.values(results).map((r) => r.score);
    const overallScore = Math.round(
      scores.reduce((s, c) => s + c, 0) / scores.length,
    );
    const blockingIssues = this.identifyBlockingIssues(results);
    const recommendations = this.generateRecommendations(
      results,
      blockingIssues,
    );
    const deploymentReady =
      overallScore >= this.config.overallMinimumScore &&
      blockingIssues.filter((i) => i.severity === "critical").length === 0 &&
      this.config.requiredCategories.every(
        (c) => results[c].status !== "fail",
      ) &&
      (this.config.allowWarnings ||
        Object.values(results).every((r) => r.status === "pass"));
    const gateResult: Phase9ExitGateResult = {
      passed: deploymentReady,
      score: overallScore,
      results,
      blockingIssues,
      recommendations,
      deploymentReady,
      timestamp: Date.now(),
    };
    this.gateResults.push(gateResult);
    return gateResult;
  }

  private identifyBlockingIssues(
    results: Phase9ExitGateResult["results"],
  ): Phase9BlockingIssue[] {
    const issues: Phase9BlockingIssue[] = [];
    for (const [category, result] of Object.entries(results)) {
      if (result.status === "fail") {
        issues.push({
          id: `${category}-critical-failure`,
          category: category as Phase9BlockingIssue["category"],
          severity: "critical",
          message: `${category} verification failed critically`,
          impact: "Blocks production deployment",
          recommendation: `Fix all ${category} issues before deployment`,
          estimatedFixTime: "2-4 hours",
        });
      }
      const minScore =
        this.config.minimumScores[
          category as keyof typeof this.config.minimumScores
        ];
      if (result.score < minScore) {
        issues.push({
          id: `${category}-score-below-minimum`,
          category: category as Phase9BlockingIssue["category"],
          severity: "major",
          message: `${category} score (${result.score}) below minimum (${minScore})`,
          impact: "Reduces deployment confidence",
          recommendation: `Improve ${category} to meet minimum score`,
          estimatedFixTime: "1-2 hours",
        });
      }
    }
    return issues;
  }

  private generateRecommendations(
    results: Phase9ExitGateResult["results"],
    blockingIssues: Phase9BlockingIssue[],
  ): string[] {
    const recs: string[] = [];
    for (const [category, result] of Object.entries(results)) {
      if (result.status === "fail") {
        recs.push(`URGENT: Fix critical ${category} issues`);
      } else if (result.status === "warning") {
        recs.push(`Review ${category} warnings`);
      }
      if (result.score < 85) {
        recs.push(`Improve ${category} score from ${result.score} to 85+`);
      }
    }
    for (const issue of blockingIssues) {
      recs.push(issue.recommendation);
    }
    if (blockingIssues.length === 0) {
      recs.push("All systems ready for production deployment");
      recs.push("Proceed with final deployment checklist");
    } else {
      recs.push("Address all blocking issues before deployment");
      recs.push("Re-run exit gate after fixing issues");
    }
    return recs;
  }
}

export const phase9ExitGate = Phase9ExitGate.getInstance();
