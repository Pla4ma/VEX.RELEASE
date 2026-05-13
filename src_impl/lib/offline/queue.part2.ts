import { captureSilentFailure } from "../../utils/silent-failure";
import { v4 } from "../../utils/uuid";
import { z } from "zod";
import { getConnectionState, subscribeToConnectionChanges, type ConnectionState } from "../repository/base";


export function stopAutoProcessing(): void {
  isAutoProcessingEnabled = false;
  if (autoProcessInterval) {
    clearInterval(autoProcessInterval);
    autoProcessInterval = null;
  }
}

export function resolveConflict(
  serverData: Record<string, unknown>,
  clientData: Record<string, unknown>,
  strategy: ConflictResolution['strategy']
): Record<string, unknown> {
  switch (strategy) {
    case 'client-wins':
      return { ...serverData, ...clientData, _resolvedAt: Date.now() };
    case 'server-wins':
      return { ...serverData, _resolvedAt: Date.now() };
    case 'merge':
      return { ...serverData, ...clientData, _resolvedAt: Date.now() };
    default:
      throw new Error('Manual conflict resolution required');
  }
}