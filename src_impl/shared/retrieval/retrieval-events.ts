/**
 * Retrieval Events - Server-Side Pinecone Integration
 *
 * Event definitions for retrieval/memory operations across the app.
 * Used for tracking, analytics, and cross-feature communication.
 *
 * CRITICAL: These events contain NO Pinecone API keys.
 * Vector queries happen server-side only.
 */

import { z } from 'zod';
import { RetrievalQueryTypeSchema, RetrievalErrorCodeSchema } from './retrieval-types';

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
export * from "./retrieval-events.types";
export * from "./retrieval-events.part1";
export * from "./retrieval-events.part2";
