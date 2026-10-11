export type GuideAction = 'focus' | 'study' | 'coach' | 'companion' | 'progress' | 'memory' | 'challenges' | 'achievements';

export interface GuideChapter {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel: string;
  action: GuideAction;
  asset: number;
}

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: 'focus',
    eyebrow: '01 / Begin',
    title: 'Make one block real.',
    body: 'Choose a mode, name the work, and let the timer protect the next small stretch of attention.',
    actionLabel: 'Open Focus',
    action: 'focus',
    asset: require('../../../assets/vex/guides/guide-momentum-arena.png'),
  },
  {
    id: 'study',
    eyebrow: '02 / Learn',
    title: 'Give VEX something to work with.',
    body: 'Bring in notes, a link, or a document. Study turns it into a path, a review queue, and a session you can actually start.',
    actionLabel: 'Open Study',
    action: 'study',
    asset: require('../../../assets/vex/guides/guide-study-atlas.png'),
  },
  {
    id: 'coach',
    eyebrow: '03 / Ask',
    title: 'Use the intelligence layer.',
    body: 'Coach can shape the next block, explain your signal, recover a missed rhythm, or help you turn material into action.',
    actionLabel: 'Ask Coach',
    action: 'coach',
    asset: require('../../../assets/vex/guides/guide-ai-signal-room.png'),
  },
  {
    id: 'companion',
    eyebrow: '04 / Notice',
    title: 'Let the pattern become personal.',
    body: 'Your companion reflects the rhythm you are actually building, so progress feels observed rather than scored from a distance.',
    actionLabel: 'Meet Companion',
    action: 'companion',
    asset: require('../../../assets/vex/guides/guide-companion-spirit.png'),
  },
  {
    id: 'progress',
    eyebrow: '05 / See',
    title: 'Read what your work is teaching you.',
    body: 'Progress connects sessions, study, mastery, challenges, companion growth, and memory into one map.',
    actionLabel: 'Open Progress',
    action: 'progress',
    asset: require('../../../assets/vex/guides/vex-field-guide-atlas.png'),
  },
];

export const GUIDE_DEPTH: GuideChapter[] = [
  {
    id: 'memory',
    eyebrow: 'Memory',
    title: 'What VEX remembers',
    body: 'See the evidence behind the next suggestion.',
    actionLabel: 'Open Memory',
    action: 'memory',
    asset: require('../../../assets/vex/guides/guide-memory-threads.png'),
  },
  {
    id: 'challenges',
    eyebrow: 'Challenges',
    title: 'One clear move',
    body: 'Turn the signal into one concrete action.',
    actionLabel: 'Open Challenges',
    action: 'challenges',
    asset: require('../../../assets/vex/guides/guide-challenge-path.png'),
  },
  {
    id: 'achievements',
    eyebrow: 'Achievements',
    title: 'Proof you built',
    body: 'Keep the moments that show your rhythm changing.',
    actionLabel: 'Open Achievements',
    action: 'achievements',
    asset: require('../../../assets/vex/guides/guide-achievement-proof.png'),
  },
];
