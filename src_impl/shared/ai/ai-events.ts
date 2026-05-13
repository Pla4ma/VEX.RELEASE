/**
 * AI Events - Server-Side Gemini Integration
 *
 * Event definitions for AI operations across the app.
 * Used for tracking, analytics, and cross-feature communication.
 *
 * CRITICAL: These events contain NO Gemini API keys.
 * AI calls happen server-side only.
 */

import { z } from 'zod';
import { AIRequestTypeSchema, AIErrorCodeSchema } from './ai-types';

// ============================================================================
// Event Channel Names
// ============================================================================
// ============================================================================
// Event Schemas
// ============================================================================
// ============================================================================
// Event Payload Map
// ============================================================================
// ============================================================================
// Validation Functions
// ============================================================================
// ============================================================================
// Event Factory Functions
// ============================================================================
export * from "./ai-events.types";
export * from "./ai-events.part1";
export * from "./ai-events.part2";
