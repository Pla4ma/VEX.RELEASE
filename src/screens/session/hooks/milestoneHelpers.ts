import { SessionMode } from "../../../session/modes";

export const MILESTONES = [25, 50, 75, 90] as const;

export function getMilestoneLabel(milestone: number, mode: SessionMode): string {
  switch (milestone) {
    case 25:
      switch (mode) {
        case SessionMode.DEEP_WORK:
          return "Hold the line.";
        case SessionMode.SPRINT:
          return "Sprint 1 complete.";
        case SessionMode.CREATIVE:
          return "Keep the flow.";
        case SessionMode.STUDY:
          return "¼ done. Stay sharp.";
        default:
          return "Quarter way!";
      }
    case 50:
      switch (mode) {
        case SessionMode.DEEP_WORK:
          return "Halfway. Don't break now.";
        case SessionMode.SPRINT:
          return "Sprint 2 complete. Chain active.";
        case SessionMode.CREATIVE:
          return "You're in it. Keep going.";
        case SessionMode.STUDY:
          return "Halfway. Quiz break soon.";
        default:
          return "Halfway there!";
      }
    case 75:
      switch (mode) {
        case SessionMode.DEEP_WORK:
          return "Final stretch. Almost there.";
        case SessionMode.SPRINT:
          return "Sprint 3 done. One more.";
        case SessionMode.CREATIVE:
          return "Almost done. Great mood today.";
        case SessionMode.STUDY:
          return "Final quiz coming up.";
        default:
          return "Almost there!";
      }
    case 90:
      switch (mode) {
        case SessionMode.DEEP_WORK:
          return "Final 10%. Don't you dare pause.";
        case SessionMode.SPRINT:
          return "Last sprint. Chain bonus on the line.";
        default:
          return "Final stretch! Don't break now.";
      }
    default:
      return "Keep going.";
  }
}

export function getMilestoneHaptic(
  milestone: number,
): "impactLight" | "impactMedium" | "impactHeavy" {
  if (milestone === 75) {
    return "impactHeavy";
  }
  if (milestone === 50) {
    return "impactMedium";
  }
  return "impactLight";
}
