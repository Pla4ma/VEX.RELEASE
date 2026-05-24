/**
 * AI Coach Repository (Barrel Export)
 *
 * Re-exports all repository functions from the repository/ directory.
 * This file exists for backward compatibility.
 *
 * Domain-specific repositories:
 * - personas: Coach personas and message templates
 * - behavior: Behavior profiles and signals
 * - recommendations: Session recommendations
 * - reminders: Reminder plans and comeback plans
 * - difficulty: Difficulty profiles
 * - messages: Coach messages
 */

export * from './repository/index';

