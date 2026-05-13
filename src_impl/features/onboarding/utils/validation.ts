/**
 * Onboarding Validation Utilities
 *
 * Comprehensive validation for onboarding flow.
 * Ensures data integrity and provides actionable feedback.
 *
 * @phase 2 - Deepening: Validation layer
 */

import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import type { FocusGoal, FocusDuration } from '../schemas';

const debug = createDebugger('onboarding:validation');

// ============================================================================
// Schemas
// ============================================================================

const ValidGoals = ['WORK', 'STUDY', 'CREATIVE', 'PERSONAL'] as const;
const ValidDurations = [10, 15, 25, 45, 60] as const;
// ============================================================================
// Validation Result Types
// ============================================================================
// ============================================================================
// Field Validators
// ============================================================================
// ============================================================================
// Step Validation
// ============================================================================
// ============================================================================
// Cross-Step Validation
// ============================================================================
// ============================================================================
// Branching Logic
// ============================================================================
// ============================================================================
// Export
// ============================================================================
export default OnboardingValidation;

export * from "./validation.types";
export * from "./validation.part1";
export * from "./validation.part2";
export * from "./validation.part3";
