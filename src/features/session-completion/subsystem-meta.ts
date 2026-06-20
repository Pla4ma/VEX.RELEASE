export interface SubsystemMetaEntry {
  kind: 'FEATURE_DEPENDENT' | 'ALWAYS_ON' | 'DEGRADED';
  featureKey?: string;
}

export const SUBSYSTEM_META: Record<string, SubsystemMetaEntry> = {
  boss: { kind: 'FEATURE_DEPENDENT', featureKey: 'boss_tab' },
  streak: { kind: 'ALWAYS_ON' },
  progression: { kind: 'ALWAYS_ON' },
  rewards: { kind: 'ALWAYS_ON' },
  companion: { kind: 'FEATURE_DEPENDENT', featureKey: 'companion_detail' },
};
