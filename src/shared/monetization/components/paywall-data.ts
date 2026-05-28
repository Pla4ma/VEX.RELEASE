export const PREMIUM_BENEFITS = [
  [
    "Deep Coach Memory",
    "VEX remembers patterns, comeback style, best focus windows, and preferred push style.",
  ],
  [
    "Monthly Focus Report",
    "See rhythm, focus risk, recovery plans, and what changed this month.",
  ],
  [
    "Progress Intelligence",
    "Find when you focus best and which session types actually work for you.",
  ],
  [
    "Advanced Study / Deep Work OS",
    "Turn study, learning, and projects into review loops and smart next actions.",
  ],
  [
    "Visual Identity",
    "Shape companion forms, focus worlds, atmospheres, and premium animations.",
  ],
  [
    "Premium Session Modes",
    "Use Exam Sprint, Deep Work, Calm Reset, Boss Focus, Comeback, and Review modes.",
  ],
] as const;

export type PaywallPlan = "annual" | "monthly";

export interface PaywallStatusMessage {
  title: string;
  body: string;
  tone: "info" | "warning" | "celebration";
}
