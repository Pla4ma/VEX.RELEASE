/**
 * Paywall State Machine
 *
 * Manages paywall presentation states and transitions.
 */

import { createDebugger } from '../../utils/debug';

const debug = createDebugger('monetization:paywall-sm');

// Paywall states
// Paywall events
// Paywall context
// State machine state
// Initial state
// State transition function
// Get state message for UI
// Check if state allows dismissal
// Check if state allows purchase
// Check if state is terminal
// Get retry action for failed state
// Create paywall trigger event
export * from "./paywall-state-machine.types";
export * from "./paywall-state-machine.part1";
export * from "./paywall-state-machine.part2";
