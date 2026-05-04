/**
 * Streak Narrative Engine
 * Transforms streaks from numbers into stories
 * 
 * Core insight: Users don't care about "7 days" - they care about 
 * "defeating the Procrastination Phantom 7 times"
 */

// ============================================================================
// Streak Characters (The "Villains" You Fight)
// ============================================================================

export interface StreakBoss {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  taunt: string[];
  defeatCry: string[];
  minStreakToUnlock: number;
  maxStreakFor: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';
}

export const STREAK_BOSSES: StreakBoss[] = [
  {
    id: 'phantom',
    name: 'Procrastination Phantom',
    title: 'The Tempter',
    avatar: 'phantom_ghost.png',
    description: 'A shadowy figure that whispers "do it later"',
    taunt: [
      'You always give up around now...',
      'Tomorrow will be easier...',
      'One day off won\'t hurt...',
      'You\'re too tired today...',
    ],
    defeatCry: [
      'Nooo! My whispers failed!',
      'I\'ll be back tomorrow!',
      'You\'re stronger than I thought...',
    ],
    minStreakToUnlock: 0,
    maxStreakFor: 3,
    difficulty: 'EASY',
  },
  {
    id: 'kraken',
    name: 'Distraction Kraken',
    title: 'The Attention Thief',
    avatar: 'kraken_tentacles.png',
    description: 'Endless tentacles of notifications and interruptions',
    taunt: [
      'Your phone needs you...',
      'Check that notification...',
      'Someone liked your post...',
      'Don\'t you hear that ping?',
    ],
    defeatCry: [
      'My tentacles are severed!',
      'Your focus is too strong!',
      'I\'ll find easier prey...',
    ],
    minStreakToUnlock: 3,
    maxStreakFor: 7,
    difficulty: 'MEDIUM',
  },
  {
    id: 'dragon',
    name: 'The Excuse Dragon',
    title: 'The Justifier',
    avatar: 'dragon_sleeping.png',
    description: 'Breathes flames of excuses and rationalizations',
    taunt: [
      'You deserve a break...',
      'You worked hard yesterday...',
      'Special occasions don\'t count...',
      'You\'ll make it up tomorrow...',
    ],
    defeatCry: [
      'My flames extinguish!',
      'Your discipline is legendary!',
      'I cannot burn through your will!',
    ],
    minStreakToUnlock: 7,
    maxStreakFor: 14,
    difficulty: 'HARD',
  },
  {
    id: 'titan',
    name: 'Inertia Titan',
    title: 'The Immovable',
    avatar: 'titan_stone.png',
    description: 'A colossus that makes starting feel impossible',
    taunt: [
      'It\'s too hard to start...',
      'You\'re stuck in this pattern...',
      'Change is impossible...',
      'Why even try?',
    ],
    defeatCry: [
      'I... cannot... move...',
      'You\'ve overcome inertia!',
      'The unstoppable force wins!',
    ],
    minStreakToUnlock: 14,
    maxStreakFor: 30,
    difficulty: 'HARD',
  },
  {
    id: 'void',
    name: 'The Void',
    title: 'Endless Darkness',
    avatar: 'void_blackhole.png',
    description: 'The final challenge - the absence of motivation itself',
    taunt: [
      'There is no point...',
      'Meaning is an illusion...',
      'Your streak is just a number...',
      'Nothing matters anyway...',
    ],
    defeatCry: [
      'Even darkness cannot stop you!',
      'You\'ve found meaning in the void!',
      'The legend is REAL!',
    ],
    minStreakToUnlock: 30,
    maxStreakFor: 999,
    difficulty: 'NIGHTMARE',
  },
];

// ============================================================================
// Narrative Engine
// ============================================================================

export function getCurrentBoss(streakDays: number): StreakBoss {
  for (const boss of STREAK_BOSSES) {
    if (streakDays >= boss.minStreakToUnlock && streakDays <= boss.maxStreakFor) {
      return boss;
    }
  }
  // Default to hardest if beyond all
  return STREAK_BOSSES[STREAK_BOSSES.length - 1];
}

export function getBossForStreakDay(streakDay: number): StreakBoss | null {
  // Return the boss for a specific day (for historical view)
  for (const boss of STREAK_BOSSES) {
    if (streakDay >= boss.minStreakToUnlock && streakDay <= boss.maxStreakFor) {
      return boss;
    }
  }
  return null;
}

export interface StreakNarrative {
  currentBoss: StreakBoss;
  dailyTaunt: string;
  currentChapter: string;
  nextMilestone: {
    day: number;
    boss: StreakBoss;
    teaser: string;
  };
  personalStory: string;
}

export function generateStreakNarrative(
  streakDays: number,
  maxStreak: number,
  totalSessions: number
): StreakNarrative {
  const currentBoss = getCurrentBoss(streakDays);
  
  // Pick a taunt for today
  const dailyTaunt = currentBoss.taunt[streakDays % currentBoss.taunt.length];
  
  // Determine "chapter" of their journey
  let currentChapter = '';
  if (streakDays === 0) {
    currentChapter = 'The Beginning';
  } else if (streakDays < 3) {
    currentChapter = 'First Victories';
  } else if (streakDays < 7) {
    currentChapter = 'Building Momentum';
  } else if (streakDays < 14) {
    currentChapter = 'The Week Warrior';
  } else if (streakDays < 30) {
    currentChapter = 'Becoming Legend';
  } else if (streakDays < 100) {
    currentChapter = 'The Century Mark';
  } else {
    currentChapter = 'Immortal Focus';
  }
  
  // Find next milestone
  let nextMilestone = {
    day: streakDays + 1,
    boss: currentBoss,
    teaser: 'Tomorrow: Same enemy, stronger resolve',
  };
  
  for (const boss of STREAK_BOSSES) {
    if (boss.minStreakToUnlock > streakDays) {
      nextMilestone = {
        day: boss.minStreakToUnlock,
        boss,
        teaser: `Day ${boss.minStreakToUnlock}: Face ${boss.name}`,
      };
      break;
    }
  }
  
  // Generate personal story based on their stats
  let personalStory = '';
  if (streakDays === maxStreak && streakDays > 7) {
    personalStory = `You're at your personal best! The ${currentBoss.name} has never seen you this strong!`;
  } else if (streakDays > maxStreak * 0.8 && maxStreak > 7) {
    personalStory = `So close to your record! The ${currentBoss.name} trembles at your approach!`;
  } else if (totalSessions < 5) {
    personalStory = 'Your journey has just begun. Each session makes you stronger.';
  } else {
    personalStory = `You've defeated ${currentBoss.name} ${streakDays} times. You know its tricks now.`;
  }
  
  return {
    currentBoss,
    dailyTaunt,
    currentChapter,
    nextMilestone,
    personalStory,
  };
}

// ============================================================================
// Streak Break Recovery (Turn failure into story)
// ============================================================================

export interface StreakBreakRecovery {
  title: string;
  story: string;
  comebackBoss: StreakBoss;
  encouragement: string;
  comebackQuest: string;
}

export function generateBreakRecovery(
  brokenStreak: number,
  maxStreak: number,
  comebackTokens: number
): StreakBreakRecovery {
  const wasRecord = brokenStreak >= maxStreak;
  const boss = getCurrentBoss(Math.min(brokenStreak, 30));
  
  const titles = [
    'The Setback',
    'A Dark Day',
    'The Chain Breaks',
    'Moment of Weakness',
  ];
  
  const stories = [
    `After ${brokenStreak} days of victory, ${boss.name} finally landed a blow.`,
    `The ${boss.name} whispered one time too many, and you listened.`,
    `Even heroes fall. Day ${brokenStreak} was your kryptonite.`,
    `The streak is broken, but not your spirit. The real test begins now.`,
  ];
  
  const encouragements = [
    'Comebacks are stronger than streaks. Prove it.',
    'Every master was once a beginner. Begin again.',
    `You defeated ${boss.name} ${brokenStreak} times before. You can do it again.`,
    'The legend isn\'t over. This is just the next chapter.',
  ];
  
  const quests = comebackTokens > 0
    ? `Use your Comeback Token to restore ${Math.min(brokenStreak, 5)} days`
    : 'Start Day 1. Defeat the Phantom again. You know how.';
  
  return {
    title: wasRecord ? 'Record Streak Broken 💔' : titles[Math.floor(Math.random() * titles.length)],
    story: stories[Math.floor(Math.random() * stories.length)],
    comebackBoss: STREAK_BOSSES[0], // Always start with Phantom
    encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
    comebackQuest: quests,
  };
}

// ============================================================================
// Streak Risk Warnings (Story-driven urgency)
// ============================================================================

export function generateRiskWarning(
  streakDays: number,
  hoursRemaining: number,
  boss: StreakBoss
): {
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  headline: string;
  story: string;
  callToAction: string;
} {
  const urgency = hoursRemaining > 6 ? 'LOW' : hoursRemaining > 2 ? 'MEDIUM' : hoursRemaining > 0.5 ? 'HIGH' : 'CRITICAL';
  
  const headlines: Record<string, string[]> = {
    LOW: [
      'The battle continues...',
      `${boss.name} watches...`,
      'Your streak awaits...',
    ],
    MEDIUM: [
      `${boss.name} senses weakness...`,
      'The shadow approaches...',
      'Time grows short...',
    ],
    HIGH: [
      `${boss.name} attacks!`,
      '⚠️ The streak is fading!',
      'Defend your legacy!',
    ],
    CRITICAL: [
      `🚨 ${boss.name} STRIKES!`,
      '💔 STREAK ABOUT TO BREAK!',
      '⚡ FINAL CHANCE!',
    ],
  };
  
  const stories: Record<string, string[]> = {
    LOW: [
      `The ${boss.name} lurks in the shadows, waiting for doubt.`,
      `Your ${streakDays}-day victory burns bright, but flames need fuel.`,
      `The battle isn't over until the day ends.`,
    ],
    MEDIUM: [
      `You can feel the ${boss.name}'s breath on your neck.`,
      `The ${streakDays}-day flame flickers. Act now.`,
      `Every hour of delay feeds the ${boss.name}.`,
    ],
    HIGH: [
      `The ${boss.name} has you cornered! Fight back!`,
      `Your ${streakDays} days of triumph hang by a thread!`,
      `This is the moment heroes are made. Focus NOW.`,
    ],
    CRITICAL: [
      `The ${boss.name} delivers the killing blow... unless you act NOW!`,
      `EVERYTHING you've built over ${streakDays} days ends in MINUTES!`,
      `Your legend is about to die. SAVE IT!`,
    ],
  };
  
  const ctas: Record<string, string[]> = {
    LOW: ['Start a session when ready', 'Keep the fire burning'],
    MEDIUM: ['Begin defense protocol', 'Strike back now'],
    HIGH: ['FIGHT BACK NOW!', 'DEFEND YOUR STREAK!'],
    CRITICAL: ['⚔️ BATTLE NOW OR LOSE EVERYTHING!', '🆘 EMERGENCY SESSION!'],
  };
  
  return {
    urgency,
    headline: headlines[urgency][Math.floor(Math.random() * headlines[urgency].length)],
    story: stories[urgency][Math.floor(Math.random() * stories[urgency].length)],
    callToAction: ctas[urgency][Math.floor(Math.random() * ctas[urgency].length)],
  };
}
