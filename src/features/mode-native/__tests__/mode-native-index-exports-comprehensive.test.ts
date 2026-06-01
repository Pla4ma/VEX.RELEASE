/**
 * Mode-Native Comprehensive Tests — Index Exports
 *
 * Covers: verify that the barrel index re-exports all service
 * functions, schemas, and copy objects.
 */

import { describe, it, expect } from '@jest/globals';

// ═══════════════════════════════════════════════════════════════════════
// INDEX EXPORTS
// ═══════════════════════════════════════════════════════════════════════

describe('mode-native index exports', () => {

  const indexExports = require('../index');

  it('exports all service functions', () => {
    expect(typeof indexExports.deriveHomeSurface).toBe('function');
    expect(typeof indexExports.deriveQuickContract).toBe('function');
    expect(typeof indexExports.deriveActiveIndicator).toBe('function');
    expect(typeof indexExports.deriveRescueSurface).toBe('function');
    expect(typeof indexExports.deriveCompletionSurface).toBe('function');
    expect(typeof indexExports.deriveWeeklyIntelligence).toBe('function');
  });

  it('exports all schemas', () => {
    expect(indexExports.SurfaceIdSchema).toBeDefined();
    expect(indexExports.ModeHomeSurfaceSchema).toBeDefined();
    expect(indexExports.ModeQuickContractSchema).toBeDefined();
    expect(indexExports.ModeActiveIndicatorSchema).toBeDefined();
    expect(indexExports.ModeCompletionSurfaceSchema).toBeDefined();
    expect(indexExports.ModeRescueSurfaceSchema).toBeDefined();
    expect(indexExports.ModeWeeklyIntelligenceSchema).toBeDefined();
  });

  it('exports all copy objects', () => {
    expect(indexExports.HOME_COPY).toBeDefined();
    expect(indexExports.QUICK_CONTRACT_COPY).toBeDefined();
    expect(indexExports.ACTIVE_INDICATOR_COPY).toBeDefined();
    expect(indexExports.COMPLETION_COPY).toBeDefined();
    expect(indexExports.RESCUE_COPY).toBeDefined();
    expect(indexExports.WEEKLY_INTELLIGENCE_COPY).toBeDefined();
  });
});
