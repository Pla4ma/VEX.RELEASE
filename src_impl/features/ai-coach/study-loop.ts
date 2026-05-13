/**
 * AI Coach Study Loop
 *
 * Manages study plan creation, tracking, and completion.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('ai-coach:study-loop');

// Study plan schema
// Study session result
// Create new study plan
// Start study plan
// Complete study session
// Get next incomplete session
// Calculate study progress
// Generate study streak message
// Check if study plan needs attention
// Adjust study plan difficulty
// Abandon study plan
// Get study insights
// Schedule study reminder
// Compare study plans
export * from "./study-loop.types";
export * from "./study-loop.part1";
export * from "./study-loop.part2";
