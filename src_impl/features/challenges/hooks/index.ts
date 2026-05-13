/**
 * Challenges Feature - TanStack Query Hooks
 *
 * Server state management for challenges with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { eventBus } from '../../../events';
import * as service from '../service';
import * as repository from '../repository';
import { economyKeys } from '../../economy/hooks';
import type {
  UpdateChallengeProgressInput,
} from '../schemas';

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Challenge Queries
// ============================================================================
// ============================================================================
// Challenge Mutations
// ============================================================================
// ============================================================================
// Challenge Event Hooks
// ============================================================================
// ============================================================================
// Challenge Stats Hook
// ============================================================================
export * from "./index.part1";
