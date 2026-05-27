import { eventBus } from "../../events";
import type { CompanionMemory } from "./memory-types";

export function emitCompanionMemoryCreated(memory: CompanionMemory): void {
  eventBus.publish("companion:memory_created", {
    createdAt: memory.createdAt,
    memoryId: memory.id,
    sessionId: memory.sessionId,
    type: memory.type,
    userId: memory.userId,
  });
}
