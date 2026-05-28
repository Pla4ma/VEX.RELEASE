export type CoachStyle =
  | "CHEERLEADER"
  | "DRILL_SERGEANT"
  | "FRIEND"
  | "MENTOR"
  | "RIVAL"
  | "MINDFUL";

export interface PersonalityMetadata {
  id: CoachStyle;
  name: string;
  description: string;
  voiceTone:
    | "ENCOURAGING"
    | "STERN"
    | "PLAYFUL"
    | "WISE"
    | "COMPETITIVE"
    | "GENTLE";
  catchphrase: string;
  avatarTheme: string;
  vocabularyTraits: string[];
  sentenceStructure: "SHORT_DIRECT" | "CONVERSATIONAL" | "MEASURED";
}
