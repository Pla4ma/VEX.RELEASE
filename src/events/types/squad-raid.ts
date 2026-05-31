/**
 * Squad Raid & Extended Event Definitions
 */

export interface SquadRaidEventDefinitions {
  'raid:sync': {
    raidId: string;
    squadId: string;
    progress: number;
    timestamp: number;
  };
  'raid:participant_ready': {
    raidId: string;
    userId: string;
    squadId: string;
    timestamp: number;
  };
  'raid:phase2': {
    raidId: string;
    squadId: string;
    timestamp: number;
  };
  'raid:phase3': {
    raidId: string;
    squadId: string;
    timestamp: number;
  };
  'raid:completed': {
    raidId: string;
    squadId: string;
    success: boolean;
    timestamp: number;
  };
  'notifications:squad_broadcast': {
    squadId: string;
    type: string;
    message?: string;
    data?: Record<string, unknown>;
  };
  'squad:invite_sent': {
    squadId: string;
    inviterId: string;
    inviteeId: string;
    inviteId: string;
  };
  'squad:weekly_goal_completed': {
    squadId: string;
    totalProgress: number;
    targetMinutes: number;
  };
  'squad:notification': {
    squadId: string;
    userId: string;
    type: string;
    message: string;
    data?: Record<string, unknown>;
  };
}
