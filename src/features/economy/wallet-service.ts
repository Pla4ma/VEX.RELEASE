export interface CurrencyGrant {
  userId: string;
  amount: number;
  currency: "COINS" | "GEMS" | "XP" | "SEASONAL" | "FOCUS_POINTS";
  source: string;
  sourceId?: string | null;
  description?: string;
  skipEvents?: boolean;
  metadata?: Record<string, unknown>;
}

export async function addCurrency(_grant: CurrencyGrant): Promise<boolean> {
  return true;
}

export async function spendCurrency(_input: {
  userId: string;
  currency: string;
  amount: number;
  sink: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: { code: string; message: string } }> {
  return { success: true };
}
