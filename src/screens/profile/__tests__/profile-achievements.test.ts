import {
  buildProfileAchievementCards,
  type ProfileAchievementStatus,
} from "../profile-achievements";

const makeAchievement = (
  input: Partial<ProfileAchievementStatus> &
    Pick<ProfileAchievementStatus, "id" | "title">,
): ProfileAchievementStatus => ({
  id: input.id,
  title: input.title,
  description: input.description ?? "Build the proof.",
  category: input.category ?? "SESSION",
  rarity: input.rarity ?? "COMMON",
  icon: input.icon ?? "star",
  isHidden: input.isHidden ?? false,
  progressMax: input.progressMax ?? 10,
  unlockCondition: input.unlockCondition ?? {
    type: "SESSION_COMPLETE",
    target: 10,
    comparator: "CUMULATIVE",
  },
  pointValue: input.pointValue ?? 10,
  reward: input.reward ?? {},
  shareText: input.shareText ?? "Proof built.",
  progress: input.progress ?? 0,
  isUnlocked: input.isUnlocked ?? false,
  unlockedAt: input.unlockedAt,
  completionPercentage: input.completionPercentage ?? 0,
});

describe("buildProfileAchievementCards", () => {
  it("prioritizes real unlocked achievements before in-progress achievements", () => {
    const cards = buildProfileAchievementCards([
      makeAchievement({
        id: "next",
        title: "Next Best Win",
        progress: 8,
        completionPercentage: 80,
      }),
      makeAchievement({
        id: "unlocked",
        title: "First Steps",
        isUnlocked: true,
        unlockedAt: 200,
      }),
    ]);

    expect(cards[0]?.id).toBe("unlocked");
    expect(cards[0]?.statusLabel).toBe("Unlocked");
    expect(cards[1]?.progressLabel).toBe("8 / 10");
  });

  it("does not reveal hidden locked achievements on profile", () => {
    const cards = buildProfileAchievementCards([
      makeAchievement({
        id: "secret",
        title: "Secret Win",
        isHidden: true,
        progress: 9,
        completionPercentage: 90,
      }),
      makeAchievement({
        id: "visible",
        title: "Visible Win",
        progress: 4,
        completionPercentage: 40,
      }),
    ]);

    expect(cards.map((card) => card.id)).toEqual(["visible"]);
  });
});
