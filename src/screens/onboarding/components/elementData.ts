import type { CompanionElement } from "../../../features/onboarding/types";

export interface ElementInfo {
  id: CompanionElement;
  name: string;
  tagline: string;
  lore: string;
  effect: string;
  personality: string;
}

export const ELEMENTS: ElementInfo[] = [
  {
    id: "FLAME",
    name: "Flame",
    tagline: "Energetic • Bold",
    lore:
      "Born from the spark of determination. Flame companions thrive on intense, energetic focus sessions.",
    effect: "+3% focus recovery speed",
    personality: "Passionate and driven",
  },
  {
    id: "WAVE",
    name: "Wave",
    tagline: "Calm • Consistent",
    lore:
      "Flowing with the rhythm of consistency. Wave companions excel in sustained, calm focus.",
    effect: "+3% rhythm protection",
    personality: "Steady and reliable",
  },
  {
    id: "TERRA",
    name: "Terra",
    tagline: "Grounded • Steady",
    lore:
      "Grounded in steady progress. Terra companions reward patient, methodical focus.",
    effect: "+5% rhythm strength for deep work (45+ min)",
    personality: "Patient and persistent",
  },
  {
    id: "ZEPHYR",
    name: "Zephyr",
    tagline: "Quick • Adaptive",
    lore:
      "Swift and adaptable. Zephyr companions shine in quick, adaptive focus bursts.",
    effect: "+5% faster recovery from distractions",
    personality: "Agile and flexible",
  },
  {
    id: "VOID",
    name: "Void",
    tagline: "Mysterious • Intensive",
    lore:
      "Mysterious and intensive. Void companions draw power from deep, uninterrupted focus.",
    effect: "+2% session memory quality",
    personality: "Intense and focused",
  },
  {
    id: "LUMINA",
    name: "Lumina",
    tagline: "Pure • Perfectionist",
    lore:
      "Pure and perfectionist. Lumina companions seek excellence in every session.",
    effect: "+5% adaptive calibration for clean sessions",
    personality: "Disciplined and precise",
  },
];
