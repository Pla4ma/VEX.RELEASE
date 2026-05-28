/**
 * Challenges Event Definitions
 *
 * Event interfaces for the challenges system: progress checks, completion,
 * and progress updates.
 */

export type ChallengesEventType =
  | "challenges:check_progress"
  | "challenges:check_economy"
  | "challenges:check_crafting"
  | "challenges:check_level"
  | "challenges:completed"
  | "challenges:progress_updated";

export interface ChallengesCheckProgressEvent {
  userId: string;
  challengeIds?: string[];
  progress: {
    sessionsCompleted?: number;
    duration?: number;
    xpEarned?: number;
    purityScore?: number;
    [key: string]: number | undefined;
  };
}

export interface ChallengesCompletedEvent {
  userId: string;
  challengeId: string;
  challengeType: string;
  rewards: { xp: number; coins: number; gems?: number; items?: string[] };
  completedAt: number;
}

export interface ChallengesProgressUpdatedEvent {
  userId: string;
  challengeId: string;
  previousProgress: number;
  newProgress: number;
  target: number;
  percentComplete: number;
  nearCompletion: boolean;
}
