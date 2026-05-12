/**
 * Squad War Repository - Stub Implementation
 */

import type { SquadWar } from './squad-war-types';

export async function getActiveSquadWar(_squadId: string): Promise<SquadWar | null> {
  return null;
}

export async function recordWarDamage(
  warId: string,
  userId: string,
  damage: number
): Promise<void> {
  void warId;
  void userId;
  void damage;
}

export function subscribeToSquadWar(
  _squadId: string,
  _onUpdate: (war: SquadWar) => void,
  _onError?: (error: Error) => void
): () => void {
  return () => {};
}

export function subscribeToSquadWarDamage(
  _warId: string,
  _onUpdate: (damage: number) => void
): () => void {
  return () => {};
}

export async function fetchWarLeaderboard(_warId: string): Promise<{
  userId: string;
  damage: number;
  rank: number;
}[]> {
  return [];
}
