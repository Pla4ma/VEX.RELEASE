/**
 * Social Share — Generate shareable content for external platforms
 *
 * Victory cards + duel links shared via iMessage/Instagram/Twitter
 * This is the VIRAL mechanic that grows the population.
 */

import type { VictoryCard, DuelChallenge, VictoryCardType } from './types';
import { DUEL_REWARDS } from './types';

// ── Deep Link Base ───────────────────────────────────────────────────────────

const APP_LINK_BASE = 'https://vex.app';
const APP_STORE_LINK = 'https://apps.apple.com/app/vex-focus/id000000000';

// ── Victory Card Sharing ─────────────────────────────────────────────────────

export function buildVictorySharePayload(card: VictoryCard): {
  text: string;
  url: string;
  hashtags: string;
} {
  const emoji = getVictoryEmoji(card.type);
  const statsText = card.stats.map((s) => `${s.label}: ${s.value}`).join('\n');
  const text = [
    `${emoji} ${card.title}`,
    card.subtitle,
    '',
    statsText,
    '',
    'Focus with me on VEX!',
  ].join('\n');

  return {
    text,
    url: `${APP_LINK_BASE}/card/${card.id}`,
    hashtags: 'VEX,Focus,Productivity',
  };
}

export function buildVictoryClipboardText(card: VictoryCard): string {
  const payload = buildVictorySharePayload(card);
  return `${payload.text}\n\n${payload.url}`;
}

// ── Duel Link Sharing ────────────────────────────────────────────────────────

export function buildDuelSharePayload(duel: DuelChallenge): {
  text: string;
  url: string;
  inviteText: string;
} {
  const modeLabel = duel.mode === 'SPRINT' ? '10min Sprint'
    : duel.mode === 'FOCUS' ? '25min Focus' : '45min Deep Work';
  const reward = DUEL_REWARDS.WIN;

  const text = [
    `\u2694\uFE0F ${duel.challengerName} challenges you to a focus duel!`,
    `Mode: ${modeLabel}`,
    `Win reward: +${reward.xp} XP, +${reward.coins} coins`,
    '',
    'Accept the challenge:',
  ].join('\n');

  return {
    text,
    url: `${APP_LINK_BASE}/duel/${duel.shareCode}`,
    inviteText: `${text}\n${APP_LINK_BASE}/duel/${duel.shareCode}`,
  };
}

export function buildDuelInviteLink(shareCode: string): string {
  return `${APP_LINK_BASE}/duel/${shareCode}`;
}

// ── Referral Link Sharing ────────────────────────────────────────────────────

export function buildReferralSharePayload(code: string): {
  text: string;
  url: string;
} {
  const text = [
    'I\'ve been using VEX to stay focused and productive!',
    '',
    'Join me and we both get bonus XP + coins.',
    'It\'s like a focus timer, but with boss battles and streaks.',
  ].join('\n');

  return {
    text,
    url: `${APP_LINK_BASE}/invite/${code}`,
  };
}

export function buildReferralInviteLink(code: string): string {
  return `${APP_LINK_BASE}/invite/${code}`;
}

// ── Clipboard Helpers ────────────────────────────────────────────────────────

export function getShareUrl(type: 'card' | 'duel' | 'invite', id: string): string {
  return `${APP_LINK_BASE}/${type}/${id}`;
}

export function getDeepLink(type: 'card' | 'duel' | 'invite', id: string): string {
  return `vex://${type}/${id}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVictoryEmoji(type: VictoryCardType): string {
  switch (type) {
    case 'DUEL_WIN': return '\u2694\uFE0F';
    case 'BOSS_DEFEAT': return '\uD83D\uDC80';
    case 'STREAK_MILESTONE': return '\uD83D\uDD25';
    case 'LEVEL_UP': return '\u2B50';
    case 'PERFECT_SESSION': return '\u2728';
  }
}
