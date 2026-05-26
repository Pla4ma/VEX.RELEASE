export async function spendCurrency(_input: unknown): Promise<boolean> { return false; }
export async function getOrCreateWallet(_userId: string): Promise<{ coins: number; gems: number }> { return { coins: 0, gems: 0 }; }
export async function getWalletSummary(): Promise<{ coins: number; gems: number }> { return { coins: 0, gems: 0 }; }
export async function getBalance(): Promise<number> { return 0; }
export async function hasEnoughBalance(): Promise<boolean> { return false; }
export async function addCurrency(): Promise<void> {}
