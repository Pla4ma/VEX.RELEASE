import { supabase } from './weekly-reset-database';

interface WalletGrantParams {
  userId: string;
  coinsBonus: number;
  description: string;
  metadata: Record<string, unknown>;
}

export async function grantCoinsToWallet(params: WalletGrantParams): Promise<void> {
  const { userId, coinsBonus, description, metadata } = params;
  if (coinsBonus <= 0) {
    return;
  }

  const nowMs = Date.now();

  const { data: walletRow, error: walletFetchError } = await supabase
    .from('wallets')
    .select('id, coins, total_coins_earned')
    .eq('user_id', userId)
    .maybeSingle();

  if (walletFetchError) throw walletFetchError;

  if (!walletRow) {
    const { data: createdWallet, error: walletInsertError } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        coins: coinsBonus,
        gems: 0,
        seasonal: {},
        total_coins_earned: coinsBonus,
        total_coins_spent: 0,
        total_gems_earned: 0,
        total_gems_spent: 0,
        created_at: nowMs,
        updated_at: nowMs,
      })
      .select('id')
      .single();

    if (walletInsertError) throw walletInsertError;

    const { error: txError } = await supabase.from('wallet_transactions').insert({
      wallet_id: createdWallet.id,
      user_id: userId,
      type: 'EARN',
      currency: 'COINS',
      amount: coinsBonus,
      balance_before: 0,
      balance_after: coinsBonus,
      source: 'SQUAD',
      source_id: null,
      description,
      metadata,
      created_at: nowMs,
    });

    if (txError) throw txError;
    return;
  }

  const beforeBalance = walletRow.coins ?? 0;
  const afterBalance = beforeBalance + coinsBonus;

  const { error: walletUpdateError } = await supabase
    .from('wallets')
    .update({
      coins: afterBalance,
      total_coins_earned: (walletRow.total_coins_earned ?? 0) + coinsBonus,
      updated_at: nowMs,
    })
    .eq('user_id', userId);

  if (walletUpdateError) throw walletUpdateError;

  const { error: txError } = await supabase.from('wallet_transactions').insert({
    wallet_id: walletRow.id,
    user_id: userId,
    type: 'EARN',
    currency: 'COINS',
    amount: coinsBonus,
    balance_before: beforeBalance,
    balance_after: afterBalance,
    source: 'SQUAD',
    source_id: null,
    description,
    metadata,
    created_at: nowMs,
  });

  if (txError) throw txError;
}
