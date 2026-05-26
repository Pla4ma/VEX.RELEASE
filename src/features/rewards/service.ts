export function calculateReward(): { coins: number; gems: number; xp: number } { return { coins: 0, gems: 0, xp: 0 }; }
export async function createReward(_input?: unknown): Promise<{ id: string }> { return Promise.resolve({ id: '' }); }
export async function claimReward(): Promise<void> { return Promise.resolve(); }
