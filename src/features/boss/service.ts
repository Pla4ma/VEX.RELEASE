export function calculateDamage(): number { return 0; }
export function createEncounter(): Promise<null> { return Promise.resolve(null); }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function applyDamage(_input?: { encounterId: string; sessionId: string; damage: number }): Promise<null> { return Promise.resolve(null); }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getActiveEncounter(_userId: string): Promise<{ status: string; bossId: string; id: string } | null> { return Promise.resolve(null); }
export function getAvailableBosses(): Promise<Array<{ unlocked: boolean }>> { return Promise.resolve([]); }
export function canUserFightBoss(): Promise<{ allowed: boolean; reason: string | null }> { return Promise.resolve({ allowed: false, reason: 'archived' }); }
