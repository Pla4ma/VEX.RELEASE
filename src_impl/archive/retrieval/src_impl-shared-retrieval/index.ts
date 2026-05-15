/**
 * Retrieval Shared Module - Server-Side Pinecone Integration
 *
 * Centralized exports for retrieval types, events, constants, and contracts.
 *
 * CRITICAL: This module contains NO Pinecone API keys.
 * Vector queries happen server-side only (Edge Functions / Trigger.dev).
 */

// Types
export * from './retrieval-types';

// Events
export * from './retrieval-events';

// Constants
export * from './retrieval-constants';

// Client Contracts
export * from './retrieval-client-contracts';
