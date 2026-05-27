import { z } from "zod";

export const EvidenceConfidenceSchema = z.enum([
  "none",
  "weak",
  "medium",
  "strong",
]);
export type EvidenceConfidence = z.infer<typeof EvidenceConfidenceSchema>;

export const EvidenceSourceSchema = z.enum([
  "cold_start",
  "historical_session",
  "user_preference",
  "pattern_detected",
  "rescue_history",
  "streak_data",
  "lane_profile",
  "focus_identity",
]);
export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;

export const CoachingMessageBasisSchema = z.enum([
  "evidence_backed",
  "cold_start_honest",
  "user_confirmed_preference",
  "simple_neutral_guidance",
]);
export type CoachingMessageBasis = z.infer<typeof CoachingMessageBasisSchema>;

export const CoachMessageContextSchema = z.enum([
  "home",
  "session_setup",
  "completion",
  "rescue",
  "premium",
  "day_retention",
  "pause",
  "comeback",
]);
export type CoachMessageContext = z.infer<typeof CoachMessageContextSchema>;

export const EvidenceContractSchema = z
  .object({
    basis: CoachingMessageBasisSchema,
    evidenceSummary: z.string().min(1).max(200),
    confidence: EvidenceConfidenceSchema,
    sources: z.array(EvidenceSourceSchema).min(1),
    lane: z
      .enum(["student", "game_like", "deep_creative", "minimal_normal"])
      .optional(),
    context: CoachMessageContextSchema,
    message: z.string().min(1).max(200),
    nextAction: z.string().min(1).max(120),
    sessionCount: z.number().int().min(0),
    coldStart: z.boolean(),
    timeToEvidenceSeconds: z.number().int().min(0).optional(),
  })
  .strict();

export type EvidenceContract = z.infer<typeof EvidenceContractSchema>;

export function buildEvidenceContract(input: {
  basis: CoachingMessageBasis;
  confidence: EvidenceConfidence;
  evidenceSummary: string;
  lane: string | undefined;
  message: string;
  nextAction: string;
  sessionCount: number;
  sources: EvidenceSource[];
}): EvidenceContract {
  const coldStart = input.sessionCount < 3;

  return EvidenceContractSchema.parse({
    basis: input.basis,
    confidence:
      coldStart && input.confidence !== "none" ? "weak" : input.confidence,
    context: resolveContext(input.basis),
    evidenceSummary:
      input.basis === "cold_start_honest"
        ? "Cold start — still learning your rhythm."
        : input.evidenceSummary,
    lane: input.lane as
      | "student"
      | "game_like"
      | "deep_creative"
      | "minimal_normal"
      | undefined,
    message: input.message.slice(0, 200),
    nextAction: input.nextAction.slice(0, 120),
    sessionCount: input.sessionCount,
    coldStart,
    sources: coldStart ? ["cold_start"] : input.sources,
  });
}

function resolveContext(basis: CoachingMessageBasis): CoachMessageContext {
  if (basis === "evidence_backed") return "home";
  if (basis === "cold_start_honest") return "session_setup";
  if (basis === "user_confirmed_preference") return "home";
  return "home";
}

export function buildColdStartMessage(
  lane: string | undefined,
): EvidenceContract {
  const laneMsg = resolveColdStartByLane(lane);
  return buildEvidenceContract({
    basis: "cold_start_honest",
    confidence: "none",
    evidenceSummary: "",
    lane,
    message: laneMsg.message,
    nextAction: laneMsg.nextAction,
    sessionCount: 0,
    sources: ["cold_start"],
  });
}

function resolveColdStartByLane(
  lane: string | undefined,
): { message: string; nextAction: string } {
  switch (lane) {
    case "student":
      return {
        message:
          "I am still learning your rhythm. Start with one clean 15-minute study block.",
        nextAction: "Start a study block",
      };
    case "game_like":
      return {
        message:
          "No run data yet. Bank one clean block for the first mark.",
        nextAction: "Start the first run",
      };
    case "deep_creative":
      return {
        message:
          "I am still learning your project rhythm. Start one clean creative block.",
        nextAction: "Start a project block",
      };
    case "minimal_normal":
      return {
        message:
          "Start one clean block. I will learn from real sessions.",
        nextAction: "Start focus",
      };
    default:
      return {
        message:
          "I am still learning your rhythm. Start with one clean 15-minute block.",
        nextAction: "Start focus",
      };
  }
}

export function buildEvidenceBackedMessage(input: {
  confidence: EvidenceConfidence;
  evidence: string;
  lane: string | undefined;
  message: string;
  nextAction: string;
  sessionCount: number;
  sources: EvidenceSource[];
}): EvidenceContract {
  return buildEvidenceContract({
    basis: "evidence_backed",
    confidence: input.confidence,
    evidenceSummary: input.evidence,
    lane: input.lane,
    message: input.message,
    nextAction: input.nextAction,
    sessionCount: input.sessionCount,
    sources: input.sources,
  });
}

export const BANNED_EVIDENCE_PRETENSE = [
  "I noticed you",
  "I can see your patterns",
  "Based on your habits",
  "Your data tells me",
] as const;

export function messageClaimsEvidence(message: string): boolean {
  return BANNED_EVIDENCE_PRETENSE.some((phrase) =>
    message.toLowerCase().includes(phrase.toLowerCase()),
  );
}
