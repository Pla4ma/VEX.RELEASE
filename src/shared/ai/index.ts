/**
 * AI Shared Module - Server-Side Gemini Integration
 *
 * Centralized exports for AI types, events, constants, and contracts.
 *
 * CRITICAL: This module contains NO Gemini API keys.
 * AI calls happen server-side only (Edge Functions / Trigger.dev).
 */

// Types
export * from './ai-types';

// Events
export * from './ai-events';

// Constants
export * from './ai-constants';

// Client Contracts
export * from './ai-client-contracts';

// Client implementation
export * from './edge-client';
