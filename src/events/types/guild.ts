/**
 * Guild Events
 */

export interface GuildEventDefinitions {
  'guild:created': { guildId: string; userId: string; name: string };
  'guild:updated': { guildId: string; userId: string; updates: unknown };
  'guild:deleted': { guildId: string; userId: string };
  'guild:member_joined': { guildId: string; userId: string; role: string };
  'guild:member_left': { guildId: string; userId: string; wasMaster: boolean };
  'guild:member_kicked': { guildId: string; userId: string; kickedBy: string };
  'guild:role_changed': { guildId: string; userId: string; newRole: string };
  'guild:tier_upgraded': { guildId: string; newTier: number; userId: string };
  'guild:quest_completed': {
    guildId: string;
    questId: string;
    contributionReward: number;
  };
  'guild:contribution': {
    guildId: string;
    userId: string;
    points: number;
    source: string;
  };
  'guild:activity': {
    guildId: string;
    userId: string;
    activityType: string;
    data: Record<string, unknown>;
  };
}
