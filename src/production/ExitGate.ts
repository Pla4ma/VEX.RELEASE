/**
 * PHASE 9 EXIT GATE - Production Hardening Verification
 * Final gate before production deployment.
 */

import { createDebugger } from "../utils/debug";
import {
  verifyOfflineSync,
  verifyErrorBoundaries,
  verifyAccessibility,
  verifyPerformance,
  verifyPrivacy,
  verifyPaywall,
  verifyAppStore,
} from "./ExitGate.verifiers";
import type {
  Phase9ExitGateResult,
  Phase9BlockingIssue,
  Phase9GateConfig,
} from "./ExitGate.config";
import { DEFAULT_GATE_CONFIG } from "./ExitGate.config";

const debug = createDebugger("phase9-exit-gate");

export { Phase9ExitGateResult, Phase9BlockingIssue, Phase9GateConfig } from "./ExitGate.config";

export class Phase9ExitGate {
  private static instance: Phase9ExitGate;
  private gateResults: Phase9ExitGateResult[] = [];
  private config: Phase9GateConfig;

  private constructor() {
    this.config = { ...DEFAULT_GATE_CONFIG };
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
