import type {
  StudyStuckInput,
  DistractionDetectedInput,
  OptimalBreakInput,
  InterventionMessage,
  InterventionAction,
} from "./intervention-types";

export function detectStudyStuck(input: StudyStuckInput): {
  detected: boolean;
  severity: "MILD" | "MODERATE" | "SEVERE";
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { minutesOnSameSection, documentName, sectionName } = input;
  const isStuck = minutesOnSameSection >= 30;
  if (!isStuck)
    return {
      detected: false,
      severity: "MILD",
      intervention: { content: "", tone: "supportive", quickResponses: [] },
      suggestedAction: { type: "SEND_NOTIFICATION", data: {} },
    };
  const severity: "MILD" | "MODERATE" | "SEVERE" =
    minutesOnSameSection >= 60
      ? "SEVERE"
      : minutesOnSameSection >= 45
        ? "MODERATE"
        : "MILD";
  const sectionText = sectionName ? ` on "${sectionName}"` : "";
  return {
    detected: true,
    severity,
    intervention: {
      content: `You've been on ${documentName}${sectionText} for ${minutesOnSameSection} minutes. Are you stuck? I can help summarize, quiz you, or suggest a different section.`,
      tone: "supportive",
      quickResponses: ["Summarize this", "Quiz me", "Skip section", "I'm fine"],
    },
    suggestedAction: {
      type: "SUGGEST_SESSION",
      data: { action: "STUDY_HELP", documentId: input.documentId },
    },
  };
}

export function detectDistraction(input: DistractionDetectedInput): {
  detected: boolean;
  severity: "MILD" | "MODERATE" | "SEVERE";
  intervention: InterventionMessage;
  technique: "REFocus" | "BREAK" | "END_SESSION";
} {
  const {
    currentPurityScore,
    purityScoreTrend,
    pausesInLast10Min,
    backgroundSwitches,
  } = input;
  const isDistracted =
    purityScoreTrend === "DECLINING" ||
    pausesInLast10Min >= 2 ||
    backgroundSwitches >= 3;
  if (!isDistracted)
    return {
      detected: false,
      severity: "MILD",
      intervention: { content: "", tone: "motivational", quickResponses: [] },
      technique: "REFocus",
    };
  let severity: "MILD" | "MODERATE" | "SEVERE" = "MILD";
  if (currentPurityScore < 50 || pausesInLast10Min >= 4) severity = "SEVERE";
  else if (currentPurityScore < 70 || pausesInLast10Min >= 3)
    severity = "MODERATE";
  let technique: "REFocus" | "BREAK" | "END_SESSION" = "REFocus";
  if (severity === "SEVERE") technique = "END_SESSION";
  else if (severity === "MODERATE") technique = "BREAK";
  return {
    detected: true,
    severity,
    intervention: {
      content: `Your session shows ${pausesInLast10Min} pauses recently — focus may be drifting. Want to try the REFocus technique, take a short break, or end the session early?`,
      tone: "supportive",
      quickResponses: [
        "Try REFocus",
        "Take break",
        "End early",
        "Push through",
      ],
    },
    technique,
  };
}

export function detectOptimalBreak(input: OptimalBreakInput): {
  shouldBreak: boolean;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  intervention: InterventionMessage;
  recommendedBreakDuration: number;
} {
  const {
    sessionDuration,
    currentPurityScore,
    focusPattern,
    timeSinceLastBreak,
    userPreferredBreakInterval,
  } = input;
  const interval = userPreferredBreakInterval ?? 52;
  const timeBased = timeSinceLastBreak >= interval;
  const patternBased =
    focusPattern === "FRAGMENTED" ||
    (focusPattern === "MODERATE" && sessionDuration > 45);
  const purityBased = currentPurityScore < 80 && sessionDuration > 30;
  const shouldBreak = timeBased || patternBased || purityBased;
  if (!shouldBreak)
    return {
      shouldBreak: false,
      confidence: "LOW",
      intervention: { content: "", tone: "supportive", quickResponses: [] },
      recommendedBreakDuration: 0,
    };
  let confidence: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  const signals = [timeBased, patternBased, purityBased].filter(Boolean).length;
  if (signals >= 3) confidence = "HIGH";
  else if (signals >= 2) confidence = "MEDIUM";
  const breakDuration =
    sessionDuration < 30 ? 5 : sessionDuration < 60 ? 10 : 17;
  return {
    shouldBreak: true,
    confidence,
    intervention: {
      content: `Your focus patterns suggest you're approaching fatigue. A ${breakDuration}-minute break now could help you return stronger. Want to take it?`,
      tone: "supportive",
      quickResponses: [
        "Take break",
        "5 more minutes",
        "Skip break",
        "End session",
      ],
    },
    recommendedBreakDuration: breakDuration,
  };
}
