import type { CoachPersona, CoachPersonaId } from './CoachRecommendationService-types';

export const COACH_PERSONAS: Record<CoachPersonaId, CoachPersona> = {
  mentor: {
    id: 'mentor',
    name: 'The Mentor',
    voiceTone: 'WISE',
    vocabularyTraits: ['warm', 'strategic', 'encouraging', 'measured'],
    sentenceStructure: 'MEASURED',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
  trainer: {
    id: 'trainer',
    name: 'The Trainer',
    voiceTone: 'STERN',
    vocabularyTraits: ['direct', 'challenging', 'results-focused', 'action-oriented'],
    sentenceStructure: 'SHORT_DIRECT',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
  peer: {
    id: 'peer',
    name: 'The Peer',
    voiceTone: 'PLAYFUL',
    vocabularyTraits: ['casual', 'relatable', 'slang', 'we-re-in-this-together'],
    sentenceStructure: 'CONVERSATIONAL',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
  professor: {
    id: 'professor',
    name: 'The Professor',
    voiceTone: 'WISE',
    vocabularyTraits: ['academic', 'methodical', 'knowledge-focused', 'precise'],
    sentenceStructure: 'MEASURED',
    guidelines: {
      maxSentences: 2,
      alwaysActionable: true,
      emotionalIntelligence: true,
      contextAware: true,
    },
  },
};
