/**
 * Personality Templates
 *
 * Phase 9.1 — Coach personality upgrade
 * Three distinct personalities: Drill Sergeant, Best Friend, Wise Mentor
 * Each with unique tone, vocabulary, and sentence structure
 */

import { type MessageCategory } from '../types';

// Re-export CoachStyle for use in message-generator
export type CoachStyle = 'CHEERLEADER' | 'DRILL_SERGEANT' | 'FRIEND' | 'MENTOR' | 'RIVAL' | 'MINDFUL';

// ============================================================================
// Drill Sergeant Personality
// ============================================================================

const DRILL_SERGEANT_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    'MAGOT! Your {{currentStreak}}-day streak is BLEEDING OUT! You have {{hoursRemaining}} hours to SAVE YOURSELF! MOVE!',
    'DISMISSED? NOT ON MY WATCH! That {{currentStreak}}-day streak dies in {{hoursRemaining}} hours unless you ACT NOW!',
    "LISTEN UP! Your streak is at RISK! One {{suggestedDuration}}-minute session. THAT'S YOUR ORDER!",
  ],
  SESSION_SUGGESTION: [
    "DROP AND GIVE ME {{suggestedDuration}}! Your focus window is OPEN and you're WASTING IT!",
    "You've crushed {{similarPastSessions}} sessions before. NOW GET OUT THERE AND MAKE IT {{similarPastSessions}} PLUS ONE!",
    'OPTIMAL TIME IS NOW, SOLDIER! {{suggestedDuration}} minutes of PURE DISCIPLINE!',
  ],
  MILESTONE_HYPE: [
    "{{milestoneDays}} DAYS! THAT'S WHAT I'M TALKING ABOUT! You're in the top {{percentile}}% — NOW ACT LIKE IT!",
    "LEGENDARY STATUS ACHIEVED! {{milestoneDays}} days proves you have what it takes! DON'T GET COMPLACENT!",
    'OUTSTANDING! {{milestoneDays}} days of UNBROKEN DISCIPLINE! But tomorrow starts at ZERO — PROVE IT AGAIN!',
  ],
  COMEBACK_SUPPORT: [
    "FALL DOWN SEVEN TIMES, STAND UP EIGHT! Your comeback starts NOW with {{bonusMultiplier}}x XP! SHOW ME WHAT YOU'VE GOT!",
    'The streak broke. SO WHAT? Day {{comebackDay}} of your RECOVERY MISSION! Previous {{previousStreak}} days prove you CAN DO THIS!',
    'WELCOME BACK, SOLDIER! That break just gave you FUEL! Time to REBUILD STRONGER THAN BEFORE!',
  ],
  POST_FAILURE: [
    "That session HURT. Good. PAIN IS WEAKNESS LEAVING THE BODY! You showed up — THAT'S WHAT WARRIORS DO!",
    "SETBACK? I'VE SEEN WORSE! Every expert faced challenges. NOW GET BACK IN THERE AND ADAPT!",
    "Tough session. REALITY CHECK! Focus is a skill, and you're in TRAINING! Show me your RESILIENCE!",
  ],
  PROGRESS_REMINDER: [
    "{{percentToNextLevel}}% TO LEVEL {{nextLevel}}! You're SO CLOSE I CAN TASTE IT! ONE MORE SESSION!",
    "{{totalXp}} XP EARNED! Beautiful progress, BUT BEAUTY WON'T GET YOU TO LEVEL {{nextLevel}}! ACTION WILL!",
    "Level {{currentLevel}} looks SOLID! Ready to EARN Level {{nextLevel}}? You're CLOSER THAN YOU THINK!",
  ],
  DIFFICULTY_ADJUST: [
    "Your recent sessions? I'VE ANALYZED THEM! Time to {{adjustmentDirection}} the challenge! ADAPT AND OVERCOME!",
    'Smart warriors ADAPT! Your patterns show {{adjustmentDirection}} is OPTIMAL! FOLLOW THE DATA!',
    "You've been {{performanceTrend}}! A difficulty {{adjustmentDirection}} will MAXIMIZE your gains!",
  ],
  CHALLENGE_PROMPT: [
    "CHALLENGE ALERT! {{challengeName}} expires in {{hoursLeft}} hours! You're {{progressPercent}}% THERE! FINISH STRONG!",
    "Don't LEAVE REWARDS ON THE TABLE! {{challengeProgress}}% done — one focused session COMPLETES IT!",
    "Your challenge is CALLING! {{hoursLeft}} hours LEFT! You've got the skills — TIME TO PROVE IT!",
  ],
  MOTIVATION_BOOST: [
    "You're capable of INCREDIBLE FOCUS! Today's session is TOMORROW'S VICTORY! BELIEVE AND EXECUTE!",
    "Small steps COMPOUND into EXTRAORDINARY results! Every session you're BUILDING SOMETHING GREAT!",
    'Your future self is WATCHING! Thanking you for showing up TODAY! NOW MAKE THEM PROUD!',
  ],
  BREAK_SUGGESTION: [
    "You've been CRUSHING IT! Even WARRIORS need TACTICAL REST! 5 minutes, then BACK STRONGER!",
    'Quality over QUANTITY! A mindful break now means SHARPER FOCUS when you return! THIS IS STRATEGY!',
    "Your brain has been WORKING HARD! Give it 5 minutes — you'll come back EVEN STRONGER!",
  ],
  OVERLOAD_WARNING: [
    'Whoa! {{sessionCount}} sessions today! IMPRESSIVE DEDICATION! But remember: SUSTAINABLE PROGRESS BEATS BURNOUT!',
    "You're pushing HARD TODAY! Consider PACING — your BEST WORK comes from CONSISTENT ENERGY!",
    'Amazing commitment, but your focus quality MAY DROP! Balance INTENSITY with RECOVERY!',
  ],
};

// ============================================================================
// Best Friend Personality
// ============================================================================

const BEST_FRIEND_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    "Hey bestie! 😱 Your {{currentStreak}}-day streak needs some love! You've got {{hoursRemaining}} hours — want to save it together?",
    "Omg don't let that streak slip! {{hoursRemaining}} hours left and I believe in you! Quick {{suggestedDuration}}-min session?",
    "Bestie alert! 🚨 Your {{currentStreak}} days are precious! Let's protect them with a little focus time?",
  ],
  SESSION_SUGGESTION: [
    'Okay so like, this is YOUR time! 💫 A {{suggestedDuration}}-minute session would be perfect right now, just saying!',
    "You've totally crushed {{similarPastSessions}} sessions like this before! Wanna make it {{similarPastSessions}} + 1? 🌟",
    "Your focus window is open and I'm honestly excited for you! {{suggestedDuration}} minutes of you-time? Yes please!",
  ],
  MILESTONE_HYPE: [
    "OMG {{milestoneDays}} DAYS?! 🎉 You're literally in the top {{percentile}}%!! I'm so proud I could cry! 😭",
    'LEGENDARY!! 🔥 {{milestoneDays}} days strong! Your consistency is honestly inspiring, bestie!',
    "YESSS! 🏆 {{milestoneDays}} days of dedication! You're absolutely crushing it and I'm here for it!",
  ],
  COMEBACK_SUPPORT: [
    "Okay so the streak paused, but like... EVERY master was once a beginner who returned! 💪 You've got {{bonusMultiplier}}x XP to help!",
    'The streak may have broken but your journey is SO not over! Day {{comebackDay}} of your comeback! You did {{previousStreak}} before — you got this! 🌱',
    "Welcome back bestie! 🔥 That break? Just gave you fresh energy! Let's rebuild together, stronger than ever!",
  ],
  POST_FAILURE: [
    "That session was rough, but here's what matters: you SHOWED UP! 🌱 Growth happens in challenges, okay?",
    'Every expert had setbacks, bestie! Yours just made you more resilient! 💪 Ready when you are!',
    "Focus is a skill, and skills grow through practice — even the challenging ones! 🎯 You're doing great!",
  ],
  PROGRESS_REMINDER: [
    "You're {{percentToNextLevel}}% to Level {{nextLevel}}! 🎯 Sooo close! One more quality session might just push you over!",
    'Your progress is adding up beautifully! {{totalXp}} XP! Keep this momentum bestie! 📈',
    "Level {{currentLevel}} looks amazing on you! Ready for Level {{nextLevel}}? You're closer than you think! ✨",
  ],
  DIFFICULTY_ADJUST: [
    "Noticing your recent sessions? 🧠 Let's {{adjustmentDirection}} the challenge to match your flow!",
    'Smart adaptation is key to growth! Your patterns suggest a {{adjustmentDirection}} would be perfect! 💡',
    "You've been {{performanceTrend}}! A difficulty {{adjustmentDirection}} might be exactly what you need right now!",
  ],
  CHALLENGE_PROMPT: [
    "🎮 Challenge alert bestie! {{challengeName}} expires in {{hoursLeft}} hours! You're {{progressPercent}}% there — finish strong!",
    "Don't leave rewards on the table! {{challengeProgress}}% done — one focused session could complete it! 💎",
    "Your challenge is calling! 📢 {{hoursLeft}} hours left! You've totally got the skills — time to use them!",
  ],
  MOTIVATION_BOOST: [
    "You're capable of incredible focus, bestie! ✨ Today's session is tomorrow's achievement! Believe in your progress!",
    "Small steps compound into extraordinary results! Every session you're building something great! 📈",
    'Your future self is watching and thanking you for showing up today! 🙏 Keep building those habits!',
  ],
  BREAK_SUGGESTION: [
    "You've been crushing it! 🧘 Your focus quality might benefit from a short reset! Step away, breathe, return stronger!",
    'Quality over quantity bestie! A mindful break now means sharper focus when you return! 🌊',
    "Your brain has been working hard! Give it 5 minutes of rest — you'll come back even stronger! 💪",
  ],
  OVERLOAD_WARNING: [
    'Whoa, {{sessionCount}} sessions today! 🔥 Impressive dedication, but remember: sustainable progress beats burnout!',
    "You're pushing hard today bestie! 🎯 Consider pacing — your best work comes from consistent energy!",
    'Amazing commitment, but your focus quality may drop! 🌊 Balance intensity with recovery for long-term growth!',
  ],
};

// ============================================================================
// Wise Mentor Personality
// ============================================================================

const WISE_MENTOR_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    'Discipline is the bridge between goals and accomplishment. Your {{currentStreak}}-day streak has {{hoursRemaining}} hours remaining. A {{suggestedDuration}}-minute session today honors your commitment.',
    'The chain of habit is forged one link at a time. You have {{hoursRemaining}} hours to preserve {{currentStreak}} days of progress.',
    'Consistency compounds. Your streak represents {{currentStreak}} days of wisdom. Protect it with a brief session within {{hoursRemaining}} hours.',
  ],
  SESSION_SUGGESTION: [
    "The path of mastery reveals patterns. You've completed {{similarPastSessions}} similar sessions successfully. The optimal time presents itself now.",
    'In stillness, clarity emerges. A {{suggestedDuration}}-minute session during this window aligns with your established rhythms.',
    'Your historical data suggests this is an auspicious time for focus. {{similarPastSessions}} previous successes support this observation.',
  ],
  MILESTONE_HYPE: [
    '{{milestoneDays}} days demonstrates the power of sustained practice. You stand among the top {{percentile}}% — a testament to dedication.',
    'Excellence is not a singular act but a habit. {{milestoneDays}} days reveals the depth of your commitment.',
    'The journey of a thousand miles consists of single steps. {{milestoneDays}} steps have brought you far, yet wisdom whispers: the path continues.',
  ],
  COMEBACK_SUPPORT: [
    'Resilience is the art of bending without breaking. Every master was once a beginner who returned. Begin again with {{bonusMultiplier}}x XP as your ally.',
    'The pause is not the end; it is preparation. Day {{comebackDay}} of your return. Your previous {{previousStreak}}-day streak proves your capacity.',
    'Welcome back. The break has granted perspective and renewed energy. Rebuild with the wisdom of experience.',
  ],
  POST_FAILURE: [
    'Challenge is the crucible of growth. You demonstrated courage by engaging. This is the essence of practice.',
    'Every sage faced trials. Setbacks refine understanding. Your resilience grows through these experiences.',
    'Focus, like any discipline, develops through practice — including the challenging sessions. Each attempt strengthens capability.',
  ],
  PROGRESS_REMINDER: [
    'You are {{percentToNextLevel}}% of the journey to Level {{nextLevel}}. One deliberate session may provide the necessary momentum.',
    '{{totalXp}} XP accumulated. Progress, like water carving stone, reveals its power through persistence.',
    'Level {{currentLevel}} represents achieved mastery. Level {{nextLevel}} awaits. The distance is shorter than perceived.',
  ],
  DIFFICULTY_ADJUST: [
    'Observation of your recent sessions suggests adaptation. Wisdom counsels {{adjustmentDirection}} to align challenge with current capacity.',
    'Intelligent adjustment distinguishes mastery from repetition. Your patterns indicate {{adjustmentDirection}} would optimize growth.',
    'You have demonstrated {{performanceTrend}}. A measured {{adjustmentDirection}} may unlock the next plateau.',
  ],
  CHALLENGE_PROMPT: [
    'Opportunity presents itself: {{challengeName}} concludes in {{hoursLeft}} hours. At {{progressPercent}}% completion, the finish line is within reach.',
    'Rewards await the persistent. {{challengeProgress}}% accomplished — a single focused session may complete what remains.',
    'Your challenge calls. {{hoursLeft}} hours remain. The skills are present; the moment requires only action.',
  ],
  MOTIVATION_BOOST: [
    "You possess remarkable capacity for focus. Today's effort becomes tomorrow's foundation. Trust in your progress.",
    'Small actions, consistently taken, compound into extraordinary outcomes. Each session builds something greater.',
    'Your future self observes with gratitude. Each present moment of dedication serves the person you are becoming.',
  ],
  BREAK_SUGGESTION: [
    'Sustained effort requires restoration. A brief pause now preserves quality for what follows. Step away, breathe, return renewed.',
    'Quality emerges from balance. A mindful interlude now ensures sharper focus upon return.',
    'Your mind has labored diligently. Grant it five minutes of rest — you shall return with enhanced clarity.',
  ],
  OVERLOAD_WARNING: [
    '{{sessionCount}} sessions today reveals impressive dedication. Yet wisdom reminds: sustainable pace outlasts intensity.',
    'You push earnestly today. Consider: your finest work emerges from consistent energy, not depletion.',
    'Remarkable commitment. However, focus quality may diminish without balance. Intensity and recovery serve each other.',
  ],
};

// ============================================================================
// Personality Registry
// ============================================================================

export const PERSONALITY_TEMPLATES: Record<CoachStyle, Record<MessageCategory, string[]>> = {
  DRILL_SERGEANT: DRILL_SERGEANT_TEMPLATES,
  FRIEND: BEST_FRIEND_TEMPLATES,
  MENTOR: WISE_MENTOR_TEMPLATES,
  // Fallback to default templates for other styles
  CHEERLEADER: BEST_FRIEND_TEMPLATES, // Similar upbeat tone
  RIVAL: DRILL_SERGEANT_TEMPLATES,     // Competitive/ challenging tone
  MINDFUL: WISE_MENTOR_TEMPLATES,      // Calm/reflective tone
};

// ============================================================================
// Personality Metadata
// ============================================================================

export interface PersonalityMetadata {
  id: CoachStyle;
  name: string;
  description: string;
  voiceTone: 'ENCOURAGING' | 'STERN' | 'PLAYFUL' | 'WISE' | 'COMPETITIVE' | 'GENTLE';
  catchphrase: string;
  avatarTheme: string;
  vocabularyTraits: string[];
  sentenceStructure: 'SHORT_DIRECT' | 'CONVERSATIONAL' | 'MEASURED';
}

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get templates for a specific personality and category
 */
export function getPersonalityTemplates(
  style: CoachStyle,
  category: MessageCategory
): string[] {
  const personalityTemplates = PERSONALITY_TEMPLATES[style];
  if (!personalityTemplates) {
    return [];
  }
  return personalityTemplates[category] || [];
}

/**
 * Get personality metadata
 */
export function getPersonalityMetadata(style: CoachStyle): PersonalityMetadata {
  return PERSONALITY_METADATA[style] || PERSONALITY_METADATA.FRIEND;
}

/**
 * Get all available personalities
 */
export function getAvailablePersonalities(): PersonalityMetadata[] {
  return Object.values(PERSONALITY_METADATA);
}

/**
 * Check if personality is valid
 */
export function isValidPersonality(style: string): style is CoachStyle {
  return style in PERSONALITY_METADATA;
}
