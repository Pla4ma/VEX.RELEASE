/**
 * Value Ladder Service
 *
 * Manages the progressive premium offering structure.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('monetization:value-ladder');

// Value ladder tier
// Tier configuration
// User's position on value ladder
// Tier configurations
// Calculate user's ladder position
// Get upgrade message based on position
// Get paywall timing recommendation
// Calculate discount for tier upgrade
// Format tier price with discount
// Get feature comparison for tier
// Track value ladder interaction
export * from "./value-ladder.types";
export * from "./value-ladder.part1";
export * from "./value-ladder.part2";
