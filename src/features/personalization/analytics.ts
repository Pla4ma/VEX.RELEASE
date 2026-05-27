import Sentry from "@sentry/react-native";

import type { VexExperience } from "./types";

export function trackVexExperienceResolved(experience: VexExperience): void {
  Sentry.addBreadcrumb({
    category: "personalization",
    data: {
      bossIntensity: experience.boss.intensity,
      bossVisible: experience.boss.isVisible,
      completionSteps: experience.completion.sequence.length,
      premiumTeased: experience.premium.shouldTease,
    },
    level: "info",
    message: "Resolved VEX experience",
  });
}
