/**
 * Challenge Manager — owns all challenge state and business logic.
 * EventService composes this and delegates challenge operations.
 */
import { eventBus } from "./EventBus";
import { getAnalyticsService } from "../analytics/AnalyticsService";
import { createDebugger } from "../utils/debug";
import { ChallengeSchema } from "./EventSchemas";
import type { Challenge, ChallengeType } from "./EventSchemas";

const debug = createDebugger("events:challenges");

export class ChallengeManager {
  private activeChallenges: Map<string, Challenge> = new Map();
  private userProgress: Map<string, { challengeId: string; progress: number }> =
    new Map();

  constructor(
    private getUserId: () => string | null,
    private onStateChange: () => Promise<void>,
    private onEventCompletionCheck: (eventId: string) => void,
  ) {}

  registerChallenge(challenge: Challenge): Challenge {
    const fullChallenge = ChallengeSchema.parse(challenge);
    this.activeChallenges.set(fullChallenge.id, fullChallenge);
    debug.info("Challenge registered: %s", fullChallenge.title);
    return fullChallenge;
  }

  joinChallenge(challengeId: string): void {
    const userId = this.getUserId();
    if (!userId) return;
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge || challenge.status === "EXPIRED") return;
    if (challenge.status === "LOCKED" && challenge.prerequisites) {
      for (const prereqId of challenge.prerequisites) {
        const prereq = this.activeChallenges.get(prereqId);
        if (!prereq || !prereq.completedBy.includes(userId)) {
          debug.debug("Challenge prerequisite not met: %s", prereqId);
          return;
        }
      }
    }
    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
    }
    if (challenge.status === "LOCKED") {
      challenge.status = "ACTIVE";
    }
    debug.info("User joined challenge: %s", challengeId);
  }

  updateChallengeProgress(type: ChallengeType, amount: number): void {
    const userId = this.getUserId();
    if (!userId) return;
    for (const challenge of this.activeChallenges.values()) {
      if (challenge.type !== type) continue;
      if (!challenge.participants.includes(userId)) continue;
      if (challenge.status !== "ACTIVE") continue;
      const oldProgress = challenge.progress;
      challenge.progress = Math.min(
        challenge.requirement.target,
        challenge.progress + amount,
      );
      challenge.progressHistory.push({ timestamp: Date.now(), value: challenge.progress });
      this.userProgress.set(`${userId}:${challenge.id}`, {
        challengeId: challenge.id,
        progress: challenge.progress,
      });
      if (
        challenge.progress >= challenge.requirement.target &&
        !challenge.completedBy.includes(userId)
      ) {
        this.completeChallenge(challenge.id);
      }
      if (oldProgress !== challenge.progress) {
        eventBus.publish("challenge:progress", {
          userId,
          challengeId: challenge.id,
          progress: challenge.progress,
          target: challenge.requirement.target,
          percent: Math.floor((challenge.progress / challenge.requirement.target) * 100),
        });
      }
    }
    void this.onStateChange();
  }

  claimChallengeReward(challengeId: string): void {
    const userId = this.getUserId();
    if (!userId) return;
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge) throw new Error(`Challenge not found: ${challengeId}`);
    if (!challenge.completedBy.includes(userId)) throw new Error("Challenge not completed");
    if (challenge.claimedBy.includes(userId)) throw new Error("Reward already claimed");
    challenge.claimedBy.push(userId);
    challenge.status = "CLAIMED";
    eventBus.publish("challenge:reward_claimed", { userId, challengeId, claimedAt: Date.now() });
    void this.onStateChange();
  }

  private completeChallenge(challengeId: string): void {
    const userId = this.getUserId();
    if (!userId) return;
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge) return;
    challenge.completedBy.push(userId);
    challenge.status = "COMPLETED";
    eventBus.publish("challenge:completed", { userId, challengeId, completedAt: Date.now() });
    this.grantChallengeRewards(challenge);
    const analytics = getAnalyticsService();
    analytics.track("challenge_completed", {
      user_id: userId,
      challenge_id: challengeId,
      challenge_type: challenge.type,
      difficulty: challenge.difficulty,
    });
    if (challenge.eventId) this.onEventCompletionCheck(challenge.eventId);
    debug.info("Challenge completed: %s", challengeId);
  }

  private grantChallengeRewards(challenge: Challenge): void {
    const userId = this.getUserId();
    if (!userId) return;
    for (const reward of challenge.rewards) {
      if (reward.type === "XP") {
        eventBus.publish("progression:add_xp", {
          userId,
          amount: reward.amount,
          source: "CHALLENGE_BONUS",
        });
      }
    }
  }

  getActiveChallenges(): Challenge[] {
    const userId = this.getUserId();
    return Array.from(this.activeChallenges.values()).filter(
      (c) => c.status === "ACTIVE" && c.participants.includes(userId!),
    );
  }

  getChallengeById(id: string): Challenge | undefined {
    return this.activeChallenges.get(id);
  }

  getUserChallengeProgress(challengeId: string): number {
    const userId = this.getUserId();
    if (!userId) return 0;
    const progress = this.userProgress.get(`${userId}:${challengeId}`);
    return progress?.progress || 0;
  }

  getCompletedChallenges(): Challenge[] {
    const userId = this.getUserId();
    if (!userId) return [];
    return Array.from(this.activeChallenges.values()).filter((c) =>
      c.completedBy.includes(userId),
    );
  }

  getUserProgressData(): Map<string, { challengeId: string; progress: number }> {
    return this.userProgress;
  }

  setUserProgressData(
    data: Map<string, { challengeId: string; progress: number }>,
  ): void {
    this.userProgress = data;
  }
}
