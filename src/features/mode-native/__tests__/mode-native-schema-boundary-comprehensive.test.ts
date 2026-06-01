/**
 * Mode-Native Comprehensive Tests — Schema Boundary Tests
 *
 * Covers: ModeHomeSurfaceSchema, ModeQuickContractSchema,
 * ModeRescueSurfaceSchema, ModeActiveIndicatorSchema boundary validation.
 */

import { describe, it, expect } from '@jest/globals';

// ── Schemas ───────────────────────────────────────────────────────────
import {
  ModeHomeSurfaceSchema,
  ModeQuickContractSchema,
  ModeActiveIndicatorSchema,
  ModeRescueSurfaceSchema,
} from '../schemas';

// ═══════════════════════════════════════════════════════════════════════
// SCHEMAS — exhaustive boundary tests
// ═══════════════════════════════════════════════════════════════════════

describe('Schema boundary tests', () => {
  describe('ModeHomeSurfaceSchema', () => {
    it('rejects extra fields (strict mode)', () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: 'student',
        primaryFeeling: 'Test',
        headline: 'Test',
        body: 'Test',
        primaryAction: 'start_study_block',
        primaryActionLabel: 'Start',
        suggestedDurationMinutes: 20,
        secondaryHint: null,
        rhythmLabel: null,
        extraField: 'not allowed',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty string for primaryFeeling', () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: 'student',
        primaryFeeling: '',
        headline: 'Test',
        body: 'Test',
        primaryAction: 'start_study_block',
        primaryActionLabel: 'Start',
        suggestedDurationMinutes: 20,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(false);
    });

    it('accepts max duration of 120', () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: 'student',
        primaryFeeling: 'Test',
        headline: 'Test',
        body: 'Test',
        primaryAction: 'start_study_block',
        primaryActionLabel: 'Start',
        suggestedDurationMinutes: 120,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects duration of 121', () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: 'student',
        primaryFeeling: 'Test',
        headline: 'Test',
        body: 'Test',
        primaryAction: 'start_study_block',
        primaryActionLabel: 'Start',
        suggestedDurationMinutes: 121,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ModeQuickContractSchema', () => {
    it('rejects more than 3 questions', () => {
      const result = ModeQuickContractSchema.safeParse({
        lane: 'student',
        title: 'Test',
        questions: [
          { key: 'a', label: 'A', placeholder: 'a' },
          { key: 'b', label: 'B', placeholder: 'b' },
          { key: 'c', label: 'C', placeholder: 'c' },
          { key: 'd', label: 'D', placeholder: 'd' },
        ],
        durationLabel: 'Duration',
        suggestedDurationMinutes: 20,
        startLabel: 'Start',
        showAdvancedSettings: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ModeRescueSurfaceSchema', () => {
    it('accepts exact min duration of 3', () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: 'student',
        headline: 'Test',
        body: 'Test',
        suggestedDurationMinutes: 3,
        actionLabel: 'Start',
      });
      expect(result.success).toBe(true);
    });

    it('accepts exact max duration of 15', () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: 'student',
        headline: 'Test',
        body: 'Test',
        suggestedDurationMinutes: 15,
        actionLabel: 'Start',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ModeActiveIndicatorSchema', () => {
    it('accepts all valid density values', () => {
      for (const density of ['low', 'medium', 'medium_high']) {
        const result = ModeActiveIndicatorSchema.safeParse({
          lane: 'student',
          targetLabel: 'Test',
          topLine: 'Test',
          showProgressBar: true,
          showCompanion: false,
          allowNotes: false,
          density,
          quiet: true,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
