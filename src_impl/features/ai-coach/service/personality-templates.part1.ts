import { type MessageCategory } from "../types";


export const PERSONALITY_TEMPLATES: Record<CoachStyle, Record<MessageCategory, string[]>> = {
  DRILL_SERGEANT: DRILL_SERGEANT_TEMPLATES,
  FRIEND: BEST_FRIEND_TEMPLATES,
  MENTOR: WISE_MENTOR_TEMPLATES,
  // Fallback to default templates for other styles
  CHEERLEADER: BEST_FRIEND_TEMPLATES, // Similar upbeat tone
  RIVAL: DRILL_SERGEANT_TEMPLATES, // Competitive/ challenging tone
  MINDFUL: WISE_MENTOR_TEMPLATES, // Calm/reflective tone
};

export const PERSONALITY_METADATA: Record<CoachStyle, PersonalityMetadata> = {
  DRILL_SERGEANT: {
    id: 'DRILL_SERGEANT',
    name: 'Drill Sergeant',
    description: 'No-nonsense, high-intensity motivation. Uses military-style commands and direct language.',
    voiceTone: 'STERN',
    catchphrase: 'DISMISSED? NOT ON MY WATCH!',
    avatarTheme: 'military',
    vocabularyTraits: ['commands', 'capitalization', 'urgency', 'no contractions', 'action-oriented'],
    sentenceStructure: 'SHORT_DIRECT',
  },
  FRIEND: {
    id: 'FRIEND',
    name: 'Best Friend',
    description: 'Casual, supportive, uses modern slang and emojis. Like texting a supportive buddy.',
    voiceTone: 'PLAYFUL',
    catchphrase: 'You got this, bestie! 💪',
    avatarTheme: 'casual',
    vocabularyTraits: ['emoji', 'slang', 'contractions', 'questions', 'warmth'],
    sentenceStructure: 'CONVERSATIONAL',
  },
  MENTOR: {
    id: 'MENTOR',
    name: 'Wise Mentor',
    description: 'Thoughtful, philosophical, uses metaphors and measured language. Like guidance from a sage.',
    voiceTone: 'WISE',
    catchphrase: 'The journey of mastery is walked one step at a time.',
    avatarTheme: 'scholarly',
    vocabularyTraits: ['metaphors', 'profound', 'measured', 'no slang', 'timeless wisdom'],
    sentenceStructure: 'MEASURED',
  },
  CHEERLEADER: {
    id: 'CHEERLEADER',
    name: 'Cheerleader',
    description: 'Upbeat, enthusiastic, high energy support.',
    voiceTone: 'ENCOURAGING',
    catchphrase: "You've got this! Wooo! 🎉",
    avatarTheme: 'spirited',
    vocabularyTraits: ['exclamation', 'cheering', 'positivity'],
    sentenceStructure: 'CONVERSATIONAL',
  },
  RIVAL: {
    id: 'RIVAL',
    name: 'Rival',
    description: 'Competitive, challenging, pushes you to be better.',
    voiceTone: 'COMPETITIVE',
    catchphrase: "Is that all you've got?",
    avatarTheme: 'competitive',
    vocabularyTraits: ['challenging', 'provoking', 'competition'],
    sentenceStructure: 'SHORT_DIRECT',
  },
  MINDFUL: {
    id: 'MINDFUL',
    name: 'Mindful Guide',
    description: 'Calm, gentle, present-focused. Encourages self-compassion.',
    voiceTone: 'GENTLE',
    catchphrase: 'Breathe. Begin. Be present.',
    avatarTheme: 'zen',
    vocabularyTraits: ['calm', 'present', 'gentle', 'breathing'],
    sentenceStructure: 'MEASURED',
  },
};

export function getPersonalityTemplates(style: CoachStyle, category: MessageCategory): string[] {
  const personalityTemplates = PERSONALITY_TEMPLATES[style];
  if (!personalityTemplates) {
    return [];
  }
  return personalityTemplates[category] || [];
}

export function getPersonalityMetadata(style: CoachStyle): PersonalityMetadata {
  return PERSONALITY_METADATA[style] || PERSONALITY_METADATA.FRIEND;
}

export function getAvailablePersonalities(): PersonalityMetadata[] {
  return Object.values(PERSONALITY_METADATA);
}

export function isValidPersonality(style: string): style is CoachStyle {
  return style in PERSONALITY_METADATA;
}