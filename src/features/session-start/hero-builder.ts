import {
  SessionStartHeroSchema,
  type SessionSetupNavigationParams,
  type SessionStartHero,
} from "./schemas";

export function buildSessionStartHero(input: {
  durationMinutes: number;
  params: SessionSetupNavigationParams;
  presetName: string;
  smartSuggestionDescription: string | null;
}): SessionStartHero {
  const { durationMinutes, params, presetName, smartSuggestionDescription } =
    input;
  if (params.source === "rescue") {
    return SessionStartHeroSchema.parse({
      body:
        params.rescueTaskDescription ??
        "No pressure — just one small action to keep moving forward.",
      eyebrow: "Rescue Block",
      title: `${durationMinutes} minutes to a small win`,
    });
  }
  if (params.source === "onboarding_first_session") {
    return SessionStartHeroSchema.parse({
      body: `Start with ${presetName} and get your first clean win on the board.`,
      eyebrow: "First Session",
      title: `${durationMinutes} minutes to prove this habit can stick`,
    });
  }
  if (
    params.source === "content-study" ||
    params.source === "learning-execution"
  ) {
    return SessionStartHeroSchema.parse({
      body: `We set up ${durationMinutes} minutes so you can act on the material before momentum fades.`,
      eyebrow: params.learningExecutionLabel ?? "Deep Work Sprint",
      title: "Turn this plan into a focused block now",
    });
  }
  if (params.comebackMultiplier && params.comebackMultiplier > 1) {
    return SessionStartHeroSchema.parse({
      body: `This ${durationMinutes}-minute block is your fastest path back into rhythm.`,
      eyebrow: "Comeback Session",
      title: params.comebackMessage ?? "Restart with a session that counts",
    });
  }
  if (smartSuggestionDescription) {
    return SessionStartHeroSchema.parse({
      body: smartSuggestionDescription,
      eyebrow: "Recommended For Today",
      title: `${presetName} is the cleanest start right now`,
    });
  }
  return SessionStartHeroSchema.parse({
    body: `Start a ${durationMinutes}-minute session now, or open options if you need to tune it first.`,
    eyebrow: "Fast Start",
    title: `${presetName} ready to launch`,
  });
}
