import { useQuery } from '@tanstack/react-query';

export interface BossEncounterStub {
  bossId: string;
  bossName: string;
  healthRemaining: number;
  maxHealth: number;
  timeRemaining: number;
  status: string;
  id: string;
}

interface BossTemplate {
  id: string;
  name: string;
  tier: number;
  minLevel: number;
  bossId?: string;
}

export function useActiveBoss(..._args: unknown[]) {
  _args;
  return useQuery<BossEncounterStub | null>({
    queryFn: () => Promise.resolve(null),
    queryKey: ['boss', 'active'],
  });
}

export function useAvailableBosses(..._args: unknown[]) {
  _args;
  return useQuery<BossTemplate[]>({
    queryFn: () => Promise.resolve([]),
    queryKey: ['boss', 'available'],
  });
}

export function useBossTemplates(..._args: unknown[]) {
  return useQuery<BossTemplate[]>({
    queryFn: () => Promise.resolve([]),
    queryKey: ['boss', 'templates'],
  });
}
