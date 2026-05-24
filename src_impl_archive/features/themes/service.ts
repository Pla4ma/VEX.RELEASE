import * as inventoryService from '../inventory/service';
import { spendCurrency } from '../economy/spending-service';
import type { Streak } from '../streaks/schemas';
import { getSessionThemeById, SESSION_THEMES, type SessionTheme } from './session-themes';

const LEGENDARY_THEME_ID = 'legendary';

export interface PurchaseThemeResult {
  success: boolean;
  errorMessage: string | null;
}

export async function getOwnedSessionThemeIds(userId: string): Promise<string[]> {
  return inventoryService.getOwnedSessionThemeIds(userId);
}

export async function getSelectableThemes(
  userId: string,
  streak: Pick<Streak, 'longestDays'> | null,
): Promise<SessionTheme[]> {
  const ownedIds = await getOwnedSessionThemeIds(userId);
  const longestDays = streak?.longestDays ?? 0;

  return SESSION_THEMES.map((theme) => ({
    ...theme,
    isOwned: theme.isFree || ownedIds.includes(theme.id),
    description:
      theme.id === LEGENDARY_THEME_ID && longestDays < 30
        ? 'Reach a 30 day streak record to unlock purchase'
        : theme.description,
  }));
}

export function canPurchaseTheme(
  themeId: string,
  streak: Pick<Streak, 'longestDays'> | null,
): { allowed: boolean; message: string | null } {
  const theme = getSessionThemeById(themeId);
  if (theme.isFree) {
    return { allowed: true, message: null };
  }

  if (theme.id === LEGENDARY_THEME_ID && (streak?.longestDays ?? 0) < 30) {
    return {
      allowed: false,
      message: 'Legendary Focus unlocks after your first 30 day streak record.',
    };
  }

  return { allowed: true, message: null };
}

export async function purchaseTheme(
  userId: string,
  themeId: string,
  streak: Pick<Streak, 'longestDays'> | null,
): Promise<PurchaseThemeResult> {
  const theme = getSessionThemeById(themeId);
  const gate = canPurchaseTheme(themeId, streak);

  if (!gate.allowed) {
    return { success: false, errorMessage: gate.message };
  }

  if (theme.isFree) {
    await inventoryService.addOwnedSessionTheme(userId, theme.id);
    return { success: true, errorMessage: null };
  }

  const spendResult = await spendCurrency({
    userId,
    amount: theme.coinCost,
    currency: 'COINS',
    sink: 'SHOP',
    description: `Unlocked session theme: ${theme.name}`,
    metadata: { themeId: theme.id, category: 'session_theme' },
  });

  if (!spendResult.success) {
    return {
      success: false,
      errorMessage:
        spendResult.error?.code === 'INSUFFICIENT_FUNDS'
          ? 'Not enough coins'
          : spendResult.error?.message ?? 'Unable to unlock theme right now.',
    };
  }

  await inventoryService.addOwnedSessionTheme(userId, theme.id);
  return { success: true, errorMessage: null };
}
