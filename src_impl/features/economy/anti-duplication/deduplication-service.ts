/**
 * Anti-Duplication Service - Barrel File
 *
 * Phase 6.04 - Anti-Duplication Systems
 * Re-exports deduplication functionality from split modules
 * Maintains backward compatibility while complying with file size limits
 */

export { antiDuplicationService } from './deduplication-main';
export { antiDuplicationCore } from './deduplication-core';
