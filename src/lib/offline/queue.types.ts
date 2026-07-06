export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolvedData?: Record<string, unknown>;
}

export function resolveConflict(
  serverData: Record<string, unknown>,
  clientData: Record<string, unknown>,
  strategy: ConflictResolution['strategy'],
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
