import { triggerHaptic, triggerHapticPattern } from "./haptics-types";

export async function sessionStart(): Promise<void> {
  await triggerHaptic("impactMedium");
}

export async function sessionComplete(): Promise<void> {
  await triggerHaptic("success");
}

export async function sessionPause(): Promise<void> {
  await triggerHaptic("impactLight");
}

export async function sessionResume(): Promise<void> {
  await triggerHaptic("impactLight");
}

export async function gradeReveal(
  grade: "S" | "A" | "B" | "C" | "D",
): Promise<void> {
  switch (grade) {
    case "S":
      await triggerHapticPattern(["impactHeavy", "success"], 100);
      break;
    case "A":
      await triggerHapticPattern(["impactMedium", "success"], 100);
      break;
    case "B":
      await triggerHaptic("impactMedium");
      break;
    case "C":
      await triggerHaptic("impactLight");
      break;
    case "D":
      await triggerHaptic("error");
      break;
  }
}

export async function levelUp(): Promise<void> {
  await triggerHapticPattern(["success", "impactMedium", "impactMedium"], 150);
}

export async function bossDefeated(): Promise<void> {
  await triggerHapticPattern(
    [
      "impactHeavy",
      "impactHeavy",
      "success",
      "impactMedium",
      "impactMedium",
      "impactMedium",
    ],
    120,
  );
}

export async function streakMilestone(days: number): Promise<void> {
  if (days >= 100) {
    await triggerHapticPattern(
      [
        "impactHeavy",
        "impactHeavy",
        "impactHeavy",
        "success",
        "success",
        "impactMedium",
      ],
      100,
    );
  } else if (days >= 30) {
    await triggerHapticPattern(["impactHeavy", "impactHeavy", "success"], 150);
  } else if (days >= 7) {
    await triggerHapticPattern(["impactMedium", "success"], 150);
  } else {
    await triggerHaptic("success");
  }
}

export async function chestOpen(
  tier: "common" | "uncommon" | "rare" | "epic" | "legendary",
): Promise<void> {
  switch (tier) {
    case "legendary":
      await triggerHapticPattern(
        ["impactHeavy", "impactHeavy", "success", "success"],
        100,
      );
      break;
    case "epic":
      await triggerHapticPattern(
        ["impactHeavy", "success", "impactMedium"],
        120,
      );
      break;
    case "rare":
      await triggerHapticPattern(["impactMedium", "success"], 150);
      break;
    case "uncommon":
      await triggerHaptic("impactMedium");
      break;
    case "common":
    default:
      await triggerHaptic("impactLight");
      break;
  }
}

export async function achievementUnlocked(): Promise<void> {
  await triggerHaptic("success");
}

export async function buttonTap(): Promise<void> {
  await triggerHaptic("selection");
}

export async function error(): Promise<void> {
  await triggerHaptic("error");
}

export async function wagerWon(): Promise<void> {
  await triggerHapticPattern(["success", "impactMedium", "success"], 150);
}

export async function companionEvolution(): Promise<void> {
  await triggerHapticPattern(
    [
      "impactLight",
      "impactMedium",
      "impactHeavy",
      "success",
      "impactHeavy",
      "success",
    ],
    120,
  );
}

export async function studyPlanGenerated(): Promise<void> {
  await triggerHapticPattern(["impactLight", "impactMedium", "success"], 100);
}

export async function cardSelection(): Promise<void> {
  await triggerHaptic("impactLight");
}

export async function pullToRefresh(): Promise<void> {
  await triggerHaptic("selection");
}

export async function stepCompleted(): Promise<void> {
  await triggerHaptic("impactMedium");
}

export async function aiThinkingPulse(): Promise<void> {
  await triggerHaptic("impactLight");
}

export async function tabSwitch(): Promise<void> {
  await triggerHaptic("selection");
}

export async function toggleSwitch(enabled: boolean): Promise<void> {
  if (enabled) {
    await triggerHaptic("impactMedium");
  } else {
    await triggerHaptic("impactLight");
  }
}

export async function scrollSnap(): Promise<void> {
  await triggerHaptic("selection");
}

export async function studyProgressMilestone(
  progressPercent: number,
): Promise<void> {
  if (progressPercent >= 100) {
    await triggerHapticPattern(["impactMedium", "success"], 100);
  } else if (progressPercent >= 50) {
    await triggerHaptic("impactMedium");
  } else {
    await triggerHaptic("impactLight");
  }
}

export async function deepLinkOpened(): Promise<void> {
  await triggerHapticPattern(["impactLight", "impactMedium"], 80);
}

export async function featureUnlocked(): Promise<void> {
  await triggerHapticPattern(
    ["impactLight", "impactMedium", "impactHeavy", "success"],
    120,
  );
}

export async function selection(): Promise<void> {
  await triggerHaptic("selection");
}
