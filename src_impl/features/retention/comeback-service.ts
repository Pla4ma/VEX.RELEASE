/**
 * Comeback Flow Service
 *
 * Manages user re-engagement after breaks or streak losses.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('retention:comeback');

// Comeback quest types
// Comeback quest status
// Comeback quest schema
// Comeback context
// Generate comeback quest based on context
// Check if user qualifies for comeback flow
// Calculate comeback motivation message
// Create comeback notification
// Simulate storage (replace with actual Supabase calls)
const activeQuests = new Map<string, ComebackQuest>();
// Calculate re-engagement probability
export * from "./comeback-service.types";
export * from "./comeback-service.part1";
export * from "./comeback-service.part2";
