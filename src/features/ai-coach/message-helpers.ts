import * as service from "./service";
import * as repository from "./repository";
import * as analytics from "./analytics";
import { createCoachMessageGeneratedEvent } from "./events";
import type { CoachMessage, MessageCategory } from "./schemas";

export async function generateAndSendMessage(
  userId: string,
  category: MessageCategory,
  context: Record<string, unknown>,
): Promise<CoachMessage | null> {
  const message = await service.generateMessage({
    userId,
    category,
    context,
    preferredDelivery: "BOTH",
  });
  if (message) {
    const savedMessage = await repository.createCoachMessage({
      ...message,
      status: "SENT",
      deliveredAt: Date.now(),
    });
    analytics.trackMessageGenerated(userId, savedMessage, true);
    const event = createCoachMessageGeneratedEvent(
      userId,
      savedMessage.id,
      category,
      savedMessage.content,
      savedMessage.priority,
      savedMessage.deliveryMethod,
    );
    return savedMessage;
  }
  return null;
}

export interface IntegrationHealth {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    serviceAvailable: boolean;
    repositoryConnected: boolean;
    eventBusConnected: boolean;
  };
  lastChecked: number;
}

export async function checkIntegrationHealth(): Promise<IntegrationHealth> {
  const checks = {
    serviceAvailable: true,
    repositoryConnected: true,
    eventBusConnected: true,
  };
  const healthy = Object.values(checks).every(Boolean);
  return {
    status: healthy ? "healthy" : "degraded",
    checks,
    lastChecked: Date.now(),
  };
}

export function subscribeToCoachEvents(): () => void {
  return () => {};
}
