import { getSupabaseClient } from "../../config/supabase";
import type { Friend, FriendProfile, DuelChallenge, VictoryCard, Referral } from "./types";


export async function saveFriend(friend: Friend): Promise<void> {
  await supabase.from('friends').insert({
    id: friend.id, user_id: friend.userId, friend_id: friend.friendId,
    status: friend.status, created_at: new Date(friend.createdAt).toISOString(),
  });
}

export async function getFriendship(userId: string, friendId: string): Promise<Friend | null> {
  const { data } = await supabase.from('friends').select('*')
    .eq('user_id', userId).eq('friend_id', friendId).single();
  if (!data) {return null;}
  return { id: data.id, userId: data.user_id, friendId: data.friend_id, status: data.status, createdAt: new Date(data.created_at).getTime() };
}

export async function updateFriendStatus(userId: string, friendId: string, status: Friend['status']): Promise<void> {
  await supabase.from('friends').update({ status }).eq('user_id', userId).eq('friend_id', friendId);
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  await supabase.from('friends').delete().eq('user_id', userId).eq('friend_id', friendId);
}

export async function getFriendCount(userId: string): Promise<number> {
  const { count } = await supabase.from('friends').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).eq('status', 'ACCEPTED');
  return count ?? 0;
}

export async function getPendingRequests(userId: string): Promise<Friend[]> {
  const { data } = await supabase.from('friends').select('*')
    .eq('friend_id', userId).eq('status', 'PENDING');
  if (!data) {return [];}
  return data.map((r) => ({
    id: r.id, userId: r.user_id, friendId: r.friend_id, status: r.status, createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function getFriendProfiles(userId: string): Promise<FriendProfile[]> {
  const { data: friends } = await supabase.from('friends').select('friend_id')
    .eq('user_id', userId).eq('status', 'ACCEPTED');
  if (!friends || friends.length === 0) {return [];}
  const friendIds = friends.map((f) => f.friend_id);
  const { data: profiles } = await supabase.from('profiles').select('*')
    .in('id', friendIds);
  if (!profiles) {return [];}
  return profiles.map((p) => ({
    userId: p.id, displayName: p.display_name ?? 'Unknown', level: p.level ?? 1,
    currentStreak: p.current_streak ?? 0, weeklyFocusMinutes: p.weekly_focus_minutes ?? 0,
    lastActiveAt: p.last_active_at ? new Date(p.last_active_at).getTime() : 0,
  }));
}

export async function saveDuel(duel: DuelChallenge): Promise<void> {
  await supabase.from('duel_challenges').insert({
    id: duel.id, challenger_id: duel.challengerId, challenger_name: duel.challengerName,
    opponent_id: duel.opponentId, opponent_name: duel.opponentName, status: duel.status,
    mode: duel.mode, duration_minutes: duel.durationMinutes, challenger_score: duel.challengerScore,
    opponent_score: duel.opponentScore, winner_id: duel.winnerId, share_code: duel.shareCode,
    expires_at: new Date(duel.expiresAt).toISOString(), created_at: new Date(duel.createdAt).toISOString(),
    completed_at: duel.completedAt ? new Date(duel.completedAt).toISOString() : null,
  });
}

export async function getDuelById(duelId: string): Promise<DuelChallenge | null> {
  const { data } = await supabase.from('duel_challenges').select('*').eq('id', duelId).single();
  if (!data) {return null;}
  return mapDuel(data);
}

export async function getDuelByShareCode(code: string): Promise<DuelChallenge | null> {
  const { data } = await supabase.from('duel_challenges').select('*').eq('share_code', code).single();
  if (!data) {return null;}
  return mapDuel(data);
}

export async function getActiveDuels(userId: string): Promise<DuelChallenge[]> {
  const { data } = await supabase.from('duel_challenges').select('*')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .in('status', ['PENDING', 'ACCEPTED']).order('created_at', { ascending: false });
  if (!data) {return [];}
  return data.map(mapDuel);
}

export async function getDuelHistory(userId: string, limit: number): Promise<DuelChallenge[]> {
  const { data } = await supabase.from('duel_challenges').select('*')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .eq('status', 'COMPLETED').order('completed_at', { ascending: false }).limit(limit);
  if (!data) {return [];}
  return data.map(mapDuel);
}

export async function updateDuel(duel: DuelChallenge): Promise<void> {
  await supabase.from('duel_challenges').update({
    opponent_id: duel.opponentId, opponent_name: duel.opponentName, status: duel.status,
    challenger_score: duel.challengerScore, opponent_score: duel.opponentScore,
    winner_id: duel.winnerId, completed_at: duel.completedAt ? new Date(duel.completedAt).toISOString() : null,
  }).eq('id', duel.id);
}

export async function updateDuelStatus(duelId: string, status: DuelChallenge['status']): Promise<void> {
  await supabase.from('duel_challenges').update({ status }).eq('id', duelId);
}

export async function saveVictoryCard(card: VictoryCard): Promise<void> {
  await supabase.from('victory_cards').insert({
    id: card.id, user_id: card.userId, type: card.type, title: card.title,
    subtitle: card.subtitle, stats: card.stats, accent_color: card.accentColor,
    share_text: card.shareText, created_at: new Date(card.createdAt).toISOString(),
  });
}

export async function getVictoryCards(userId: string, limit: number): Promise<VictoryCard[]> {
  const { data } = await supabase.from('victory_cards').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (!data) {return [];}
  return data.map((r) => ({
    id: r.id, userId: r.user_id, type: r.type, title: r.title, subtitle: r.subtitle,
    stats: r.stats ?? [], accentColor: r.accent_color, shareText: r.share_text,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function saveReferral(referral: Referral): Promise<void> {
  await supabase.from('referrals').insert({
    id: referral.id, referrer_id: referral.referrerId, referred_id: referral.referredId,
    code: referral.code, status: referral.status, reward_claimed: referral.rewardClaimed,
    created_at: new Date(referral.createdAt).toISOString(),
    completed_at: referral.completedAt ? new Date(referral.completedAt).toISOString() : null,
  });
}

export async function getReferralByReferrer(userId: string): Promise<Referral | null> {
  const { data } = await supabase.from('referrals').select('*').eq('referrer_id', userId).limit(1).single();
  if (!data) {return null;}
  return mapReferral(data);
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const { data } = await supabase.from('referrals').select('*').eq('code', code).single();
  if (!data) {return null;}
  return mapReferral(data);
}

export async function updateReferral(referral: Referral): Promise<void> {
  await supabase.from('referrals').update({
    referred_id: referral.referredId, status: referral.status,
    reward_claimed: referral.rewardClaimed,
    completed_at: referral.completedAt ? new Date(referral.completedAt).toISOString() : null,
  }).eq('id', referral.id);
}

export async function getReferralCount(userId: string): Promise<number> {
  const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId).eq('status', 'COMPLETED');
  return count ?? 0;
}