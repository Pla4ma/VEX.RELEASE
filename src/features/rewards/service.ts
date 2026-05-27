/** Active rewards: XP receipt only. Coins/gems economy archived. */
export function calculateXpReward(): number {
  return 0;
}

export async function createReward(_input?: unknown): Promise<{ id: string }> {
  return Promise.resolve({ id: '' });
}

export async function claimReward(): Promise<void> {
  return Promise.resolve();
}
