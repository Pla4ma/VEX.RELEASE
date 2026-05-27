import { z } from "zod";

export const AIActionIntentSchema = z.enum([
  "START_SESSION",
  "VIEW_PROGRESS",
  "VIEW_SETTINGS",
  "START_COMEBACK",
  "VIEW_BOSS",
  "VIEW_CHALLENGES",
  "OPEN_COACH",
  "OPEN_CONTENT_STUDY",
  "NONE",
]);

export type AIActionIntent = z.infer<typeof AIActionIntentSchema>;

export interface SafeRoute {
  screen: string;
  params?: Record<string, unknown>;
  allowed: boolean;
  allowedUserTiers: string[];
  minLevel?: number;
}

export const INTENT_ROUTE_MAP: Record<AIActionIntent, SafeRoute> = {
  START_SESSION: {
    screen: "SessionSetup",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
  },
  VIEW_PROGRESS: {
    screen: "Progress",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
  },
  VIEW_SETTINGS: {
    screen: "SettingsMain",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
  },
  START_COMEBACK: {
    screen: "Comeback",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
  },
  VIEW_BOSS: {
    screen: "BossTab",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
    minLevel: 5,
  },
  VIEW_CHALLENGES: {
    screen: "ChallengesTab",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
  },
  OPEN_COACH: {
    screen: "CoachScreen",
    allowed: true,
    allowedUserTiers: ["free", "paid", "internal"],
  },
  OPEN_CONTENT_STUDY: {
    screen: "ContentInput",
    allowed: true,
    allowedUserTiers: ["paid", "internal"],
    minLevel: 7,
  },
  NONE: {
    screen: "",
    allowed: false,
    allowedUserTiers: [],
  },
};

export const ActionRouteMappingSchema = z.object({
  intent: AIActionIntentSchema,
  screen: z.string(),
  params: z.record(z.unknown()).optional(),
});

export type ActionRouteMapping = z.infer<typeof ActionRouteMappingSchema>;

export function validateIntent(rawIntent: unknown): AIActionIntent {
  const parsed = AIActionIntentSchema.safeParse(rawIntent);
  if (parsed.success) return parsed.data;
  return "NONE";
}

export function resolveRouteFromIntent(
  intent: AIActionIntent,
  userTier: string,
  userLevel: number,
): ActionRouteMapping {
  const route = INTENT_ROUTE_MAP[intent];

  if (intent === "NONE" || !route.allowed) {
    return { intent: "NONE", screen: "" };
  }

  if (!route.allowedUserTiers.includes(userTier)) {
    return { intent: "NONE", screen: "" };
  }

  if (route.minLevel !== undefined && userLevel < route.minLevel) {
    return { intent: "NONE", screen: "" };
  }

  return {
    intent,
    screen: route.screen,
    params: route.params,
  };
}

export function isIntentRoutable(
  intent: AIActionIntent,
  userTier: string,
  userLevel: number,
): boolean {
  const resolved = resolveRouteFromIntent(intent, userTier, userLevel);
  return resolved.screen !== "";
}
