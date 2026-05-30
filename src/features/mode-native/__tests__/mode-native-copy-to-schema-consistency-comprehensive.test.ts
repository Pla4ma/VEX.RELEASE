/**
 * Mode-Native Comprehensive Tests — Copy-to-Schema Consistency
 *
 * Covers: verifying that all copy objects validate against their
 * corresponding Zod schemas.
 */

import { describe, it, expect } from "@jest/globals";

// ── Schemas ───────────────────────────────────────────────────────────
import {
  ModeHomeSurfaceSchema,
  ModeQuickContractSchema,
  ModeActiveIndicatorSchema,
  ModeRescueSurfaceSchema,
  ModeWeeklyIntelligenceSchema,
} from "../schemas";

// ── Copy objects ──────────────────────────────────────────────────────
import {
  HOME_COPY,
  QUICK_CONTRACT_COPY,
  ACTIVE_INDICATOR_COPY,
  RESCUE_COPY,
  WEEKLY_INTELLIGENCE_COPY,
} from "../copy";

// ── Lane types ────────────────────────────────────────────────────────
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// CONSISTENCY: copy entries validate through schemas
// ═══════════════════════════════════════════════════════════════════════

describe("Copy-to-schema consistency", () => {
  it("all HOME_COPY entries pass ModeHomeSurfaceSchema when combined with lane", () => {
    for (const lane of ALL_LANES) {
      const result = ModeHomeSurfaceSchema.safeParse({ ...HOME_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all QUICK_CONTRACT_COPY entries pass ModeQuickContractSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeQuickContractSchema.safeParse({ ...QUICK_CONTRACT_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all ACTIVE_INDICATOR_COPY entries pass ModeActiveIndicatorSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeActiveIndicatorSchema.safeParse({ ...ACTIVE_INDICATOR_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all RESCUE_COPY entries pass ModeRescueSurfaceSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeRescueSurfaceSchema.safeParse({ ...RESCUE_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all WEEKLY_INTELLIGENCE_COPY entries pass ModeWeeklyIntelligenceSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeWeeklyIntelligenceSchema.safeParse({ ...WEEKLY_INTELLIGENCE_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });
});
