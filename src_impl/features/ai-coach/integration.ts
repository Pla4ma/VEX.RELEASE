/**
 * AI Coach Integration Layer
 *
 * Cross-system wiring for AI Coach feature
 * Subscribes to events from other features and emits coach events
 *
 * Dependencies:
 * - Sessions (session data for personalization)
 * - Streaks (streak risk detection)
 * - Progression (level-based advice)
 * - Challenges (challenge suggestions)
 * - Boss (boss encounter status)
 * - Notifications (message delivery)
 * - Analytics (effectiveness tracking)
 */

import * as service from './service';
import * as repository from './repository';
import * as analytics from './analytics';
import { AI_COACH_EVENT_CHANNELS, createCoachMessageGeneratedEvent, createStreakRiskDetectedEvent, createComebackActivatedEvent, createBehaviorSignalDetectedEvent, type AICoachEventPayloadMap } from './events';
import { type CoachMessage, type MessageCategory, type TriggerType, type SignalType } from './schemas';

// Event bus would be imported from shared/events
// import { eventBus } from '@/shared/events';

// ============================================================================
// Session Integration
// ============================================================================
// ============================================================================
// Streak Integration
// ============================================================================
// ============================================================================
// Progression Integration
// ============================================================================
// ============================================================================
// Challenge Integration
// ============================================================================
// ============================================================================
// Boss Integration
// ============================================================================
// ============================================================================
// User Activity Integration
// ============================================================================
// ============================================================================
// Helper Functions
// ============================================================================

async function generateAndSendMessage(userId: string, category: MessageCategory, context: Record<string, unknown>): Promise<CoachMessage | null> {
  const message = await service.generateMessage({
    userId,
    category,
    context,
    preferredDelivery: 'BOTH',
  });

  if (message) {
    const savedMessage = await repository.createCoachMessage({
      ...message,
      status: 'SENT',
      deliveredAt: Date.now(),
    });

    // Track analytics
    analytics.trackMessageGenerated(userId, savedMessage, true);

    // Emit event
    const event = createCoachMessageGeneratedEvent(userId, savedMessage.id, category, savedMessage.content, savedMessage.priority, savedMessage.deliveryMethod);
    // eventBus.publish(AI_COACH_EVENT_CHANNELS.MESSAGE_GENERATED, event);

    return savedMessage;
  }

  return null;
}

// ============================================================================
// Event Subscription Setup
// ============================================================================
// ============================================================================
// Integration Health Check
// ============================================================================
export * from "./integration.types";
export * from "./integration.part1";
export * from "./integration.part2";
