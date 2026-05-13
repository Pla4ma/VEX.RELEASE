/**
 * Progression Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import * as service from '../service';
import * as repository from '../repository';
import {
  getProgressionEnhanced,
  getProgressionSummaryEnhanced,
} from '../service-enhanced-read';
import {
  AddXpInputSchema,
  PrestigeInputSchema,
  type AddXpInput,
  type PrestigeInput,
} from '../schemas';
import {
  getProgressionService,
  type LevelState,
} from '../../../progression/ProgressionService';
import type { AddXpOperationResult } from '../service-enhanced';

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Read Hooks
// ============================================================================
// ============================================================================
// Mutation Hooks
// ============================================================================
// ============================================================================
// Optimistic XP Hook
// ============================================================================
export * from "./index.part1";
