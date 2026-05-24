import type { CompanionMood } from './types';

export type PersonalityEventType =
  | 'BOSS_DEFEATED'
  | 'S_GRADE_SESSION'
  | 'STREAK_MILESTONE'
  | 'STREAK_BROKEN'
  | 'COMEBACK'
  | 'LEVEL_UP'
  | 'PERFECT_SESSION';

export interface PersonalityResponse {
  animation: 'victory' | 'celebration' | 'sympathy' | 'welcome' | 'growth' | 'excited';
  dialogue: string[];
  mood: CompanionMood;
  duration: number;
}

export interface ActiveResponse {
  type: PersonalityEventType;
  response: PersonalityResponse;
  timestamp: number;
}

export interface CompanionPersonalityState {
  currentResponse: ActiveResponse | null;
  responseHistory: ActiveResponse[];
  isAnimating: boolean;
}

export const RESPONSES: Record<PersonalityEventType, PersonalityResponse[]> = {
  BOSS_DEFEATED: [
    { animation: 'victory', dialogue: ['WE GOT HIM!', 'That was intense! We make a great team.'], mood: 'ECSTATIC', duration: 4000 },
    { animation: 'victory', dialogue: ['Boss down!', 'Your focus was unstoppable!'], mood: 'ECSTATIC', duration: 3500 },
    { animation: 'celebration', dialogue: ['Victory!', 'Another challenge conquered.'], mood: 'DETERMINED', duration: 3000 },
  ],
  S_GRADE_SESSION: [
    { animation: 'celebration', dialogue: ['You were unstoppable today.', 'Pure focus. Pure excellence.'], mood: 'ECSTATIC', duration: 4000 },
    { animation: 'growth', dialogue: ['S-grade! That is the standard.', 'You are becoming legendary.'], mood: 'DETERMINED', duration: 3500 },
    { animation: 'excited', dialogue: ['Incredible!', 'I felt that focus from here.'], mood: 'ECSTATIC', duration: 3000 },
  ],
  STREAK_MILESTONE: [
    { animation: 'celebration', dialogue: ['One week! We are just getting started.'], mood: 'ECSTATIC', duration: 3500 },
    { animation: 'growth', dialogue: ['14 days. That is not luck. That is discipline.'], mood: 'DETERMINED', duration: 4000 },
    { animation: 'celebration', dialogue: ['30-day streak!', 'You have built something real.'], mood: 'ECSTATIC', duration: 4500 },
  ],
  STREAK_BROKEN: [
    { animation: 'sympathy', dialogue: ['It happens.', 'We come back stronger tomorrow.'], mood: 'CONTENT', duration: 4000 },
    { animation: 'sympathy', dialogue: ['Streak is gone, but skills are not.', 'One session. Reset.'], mood: 'CONTENT', duration: 3500 },
    { animation: 'sympathy', dialogue: ['I am still here.', 'Ready when you are.'], mood: 'SLEEPY', duration: 3000 },
  ],
  COMEBACK: [
    { animation: 'welcome', dialogue: ['You came back!', 'That is what matters.'], mood: 'CONTENT', duration: 3500 },
    { animation: 'welcome', dialogue: ['3 days away feels long.', 'Let us ease back in.'], mood: 'CONTENT', duration: 4000 },
    { animation: 'growth', dialogue: ['Welcome back.', 'Your focus remembers you.'], mood: 'FOCUSED', duration: 3500 },
  ],
  LEVEL_UP: [
    { animation: 'growth', dialogue: ['Growing stronger!', 'Feel that energy?'], mood: 'DETERMINED', duration: 3000 },
    { animation: 'excited', dialogue: ['Level up!', 'We are evolving together.'], mood: 'ECSTATIC', duration: 3500 },
  ],
  PERFECT_SESSION: [
    { animation: 'celebration', dialogue: ['Perfection.', 'Not a single distraction.'], mood: 'ECSTATIC', duration: 4000 },
    { animation: 'growth', dialogue: ['Flawless focus.', 'That is the zone.'], mood: 'DETERMINED', duration: 3500 },
  ],
};
