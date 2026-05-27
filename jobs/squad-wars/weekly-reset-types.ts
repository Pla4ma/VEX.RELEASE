export const DEFAULT_REWARD_MULTIPLIER = 1.5;

export const BOSS_ROTATION = [
  { name: 'The Iron Leviathan', maxHealth: 120000 },
  { name: 'The Ember Matron', maxHealth: 135000 },
  { name: 'The Null Titan', maxHealth: 150000 },
  { name: 'The Glass Colossus', maxHealth: 145000 },
];

export type WarRow = {
  id: string;
  squad_id: string;
  boss_name: string;
  boss_max_health: number;
  boss_current_health: number;
  reward_multiplier: number | null;
  week_starts_at: string;
  week_ends_at: string;
};

export type WarDamageRow = {
  user_id: string;
  damage: number;
  session_id?: string;
  users?: {
    display_name?: string | null;
    username?: string | null;
  } | null;
};

export type PushTokenRow = {
  user_id: string;
  token: string;
  platform: string;
};

export type WeeklyResetResult = {
  processedWars: number;
  winners: number;
  losers: number;
  rewardsGranted: number;
  notificationsSent: number;
  nextWarsCreated: number;
};
