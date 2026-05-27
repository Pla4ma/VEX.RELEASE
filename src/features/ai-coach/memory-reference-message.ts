import type { MessageCategory } from "./types";
import type { CoachMemory } from "./memory-schemas";
import { getRelevantMemories, canClaimStrongPattern } from "./CoachMemory";

type Persona = "MENTOR" | "CHEERLEADER" | "DRILL_SERGEANT";

function safeString(value: unknown, fallback: string = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeNumber(value: unknown, fallback: number = 0): number {
  return typeof value === "number" ? value : fallback;
}

const MENTOR_TEMPLATES: Partial<Record<string, string>> = {
  FIRST_S_GRADE:
    "You hit your first S grade {{daysSince}} days ago — since then, you've earned {{extraAchievements}}. You're improving faster than you realize.",
  LONGEST_SESSION:
    "Remember when you completed that {{duration}}-minute session {{daysSince}} days ago? That was a breakthrough moment. You have that capacity within you.",
  BEST_STREAK:
    "Your {{streakDays}}-day streak record still stands. You built that through consistency, not intensity. That's the path forward.",
  FIRST_BOSS_DEFEATED:
    "Your first boss victory against {{bossName}} showed you what focused effort can accomplish. That same determination is available to you now.",
  ONBOARDING_GOAL:
    "When you started, you said you wanted to {{goal}}. Let's look at how you're doing — you've made more progress than you might think.",
};

const CHEERLEADER_TEMPLATES: Partial<Record<string, string>> = {
  FIRST_S_GRADE:
    "OMG! You got your first S grade {{daysSince}} days ago and you've been CRUSHING IT since! You've earned {{extraAchievements}}! Keep that momentum!",
  LONGEST_SESSION:
    "Remember that EPIC {{duration}}-minute session?! That was {{daysSince}} days ago and you HAVEN'T forgotten how to focus! You've got this!",
  BEST_STREAK:
    "Your {{streakDays}}-day streak LEGEND is still alive! You built that through showing up every day! That's the champion spirit!",
  FIRST_BOSS_DEFEATED:
    "Your first boss takedown of {{bossName}}?! That was AMAZING! You have that SAME POWER right now! Use it!",
  ONBOARDING_GOAL:
    "You told me you wanted to {{goal}} — and LOOK AT YOU GO! You're making it happen! I'm so proud!",
};

const DRILL_SERGEANT_TEMPLATES: Partial<Record<string, string>> = {
  FIRST_S_GRADE:
    "You got your first S grade {{daysSince}} days ago. What happened since? Complacency. You were capable of excellence then, and you're capable now. PROVE IT.",
  LONGEST_SESSION:
    "{{duration}} minutes. That was your record. Set {{daysSince}} days ago. Pathetic that you haven't beaten it. TODAY IS THE DAY.",
  BEST_STREAK:
    "{{streakDays}} days. That was your best. You had discipline then. Where is it now? Find it. Or admit you're weak.",
  FIRST_BOSS_DEFEATED:
    "{{bossName}} went down because you had FOCUS. Now you make excuses. Enough. Get back to work.",
  ONBOARDING_GOAL:
    "You said you'd {{goal}}. Words are easy. Actions are hard. Which are you choosing today?",
};

const templates: Record<Persona, Partial<Record<string, string>>> = {
  MENTOR: MENTOR_TEMPLATES,
  CHEERLEADER: CHEERLEADER_TEMPLATES,
  DRILL_SERGEANT: DRILL_SERGEANT_TEMPLATES,
};

function formatTemplate(
  template: string,
  replacements: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return String(replacements[key] ?? `{{${key}}}`);
  });
}

export async function generateMemoryReferenceMessage(
  userId: string,
  category: MessageCategory,
  persona: Persona = "MENTOR",
  sessionCount: number = 0,
): Promise<string | null> {
  if (!canClaimStrongPattern(sessionCount)) {
    return null;
  }

  const memories = await getRelevantMemories(userId, category, 2);
  if (memories.length === 0) {
    return null;
  }
  const primaryMemory = memories[0]!;
  const daysSince = Math.floor(
    (Date.now() - primaryMemory.occurredAt) / (1000 * 60 * 60 * 24),
  );
  const personaTemplates = templates[persona];
  const rawTemplate = personaTemplates[primaryMemory.type];

  if (!rawTemplate) {
    return null;
  }

  const extraAchievements =
    memories.length > 1 ? "several more" : "another one";
  const metadata = primaryMemory.metadata;
  const duration = safeNumber(metadata.duration);
  const streakDays = safeNumber(metadata.streakDays);
  const bossName = safeString(metadata.bossName, "Unknown Boss");
  const goal = safeString(metadata.goal, "improve");

  const message = formatTemplate(rawTemplate, {
    daysSince,
    extraAchievements,
    duration,
    streakDays,
    bossName,
    goal,
  });

  return message;
}
