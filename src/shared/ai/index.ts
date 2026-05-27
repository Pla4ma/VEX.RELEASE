/**
 * AI Shared Module - Server-Side Gemini Integration
 *
 * Centralized exports for AI types, events, constants, contracts,
 * quota system, fallback tiers, and intent routing.
 *
 * CRITICAL: This module contains NO Gemini API keys.
 * AI calls happen server-side only (Edge Functions / Trigger.dev).
 */

// Types
export * from "./ai-types";

// Events
export * from "./ai-events";

// Constants
export * from "./ai-constants";

// Client Contracts
export * from "./ai-client-contracts";

// Quota System
export * from "./ai-quota-types";
export * from "./ai-quota-strategies";
export * from "./ai-quota-service";
export * from "./ai-quota-repository";

// Tiered Fallback
export * from "./ai-fallback-tiers";

// Intent Routing (AI → safe route mapping)
export * from "./ai-intent-routing";

// Client implementation
export * from "./edge-client";
