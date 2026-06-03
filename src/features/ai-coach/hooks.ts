/**
 * AI Coach Hooks - Barrel Export
 *
 * Re-exports all hooks from the hooks/ directory.
 *
 * ARCHITECTURE NOTE: This file is the PUBLIC API barrel for ai-coach hooks.
 * All hook implementations live in the hooks/ directory.
 * Do NOT add hook implementations here — only re-exports.
 */

export { COACH_QUERY_KEYS } from './constants';

export * from './hooks';
