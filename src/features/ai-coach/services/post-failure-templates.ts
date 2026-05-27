import type { CoachStyle } from './personality-templates';

export const DAY1_EMPATHY_TEMPLATES: Record<CoachStyle, string[]> = {
  DRILL_SERGEANT: [
    "LISTEN UP. The streak broke. I won't sugarcoat it — but I also won't let you stay down. Tell me: what happened? We'll fix it.",
    'SETBACKS HAPPEN. Even to the best. Your {{streakDaysBeforeBreak}}-day streak proves you have what it takes. Now we REBUILD.',
  ],
  FRIEND: [
    'Hey, your streak ended. That really sucks — I know you were working hard on it. Want to talk about what happened? 💙',
    '{{streakDaysBeforeBreak}} days was amazing, and I know you can do it again. No judgment here — just want to help you get back on track. 🤗',
  ],
  MENTOR: [
    'The path of discipline includes moments of interruption. Your {{streakDaysBeforeBreak}} days demonstrated remarkable commitment. Let us understand what occurred and prepare for what follows.',
    'Streaks, like all things, are impermanent. What matters is the wisdom gained. What would you identify as the primary challenge?',
  ],
  CHEERLEADER: [
    "Oh no! Your streak ended? I'm so sorry! 😢 But you know what? {{streakDaysBeforeBreak}} days was INCREDIBLE and you can totally do it again!",
    "Don't you dare feel bad! You did something amazing for {{streakDaysBeforeBreak}} days! Let's figure out what got in the way! 🔥",
  ],
  RIVAL: [
    'Well, that happened. {{streakDaysBeforeBreak}} days down. Question is: you going to let that define you, or are you coming back stronger?',
    "I've seen you at {{streakDaysBeforeBreak}} days. That person didn't disappear. So what's the plan?",
  ],
  MINDFUL: [
    'Breathe. The streak has ended, and with it, certain expectations. Let us sit with this moment. What arose that interrupted your practice?',
    'Each end is also a beginning. Your {{streakDaysBeforeBreak}} days were beautiful in their consistency. Now, we turn the page gently.',
  ],
};

export const DAY2_GOAL_TEMPLATES: Record<CoachStyle, string[]> = {
  DRILL_SERGEANT: [
    "DAY 2 OF YOUR COMEBACK. Here's your MISSION: ONE 15-minute session today. That's it. Not 30. Not 25. FIFTEEN. Execute.",
    "Small wins rebuild confidence. Your target: 15 minutes. Once that's done, you're back in the fight. MOVE.",
  ],
  FRIEND: [
    "Day 2! Let's keep it super simple — just one 15-minute session today? No pressure for anything more. You've got this! 💪",
    "Hey, how about we just focus on today? One little 15-minute session. That's all I'm asking! Easy peasy! 🔥",
  ],
  MENTOR: [
    'Day two invites a gentle reengagement. I propose a single 15-minute session — modest, achievable, and sufficient to reestablish rhythm.',
    "The mountain is climbed one step at a time. Today's step: 15 minutes of focused attention. Nothing more is required.",
  ],
  CHEERLEADER: [
    "Day 2 of your comeback! 🎯 Let's make it TINY and EASY — just 15 minutes! You can totally do that! I believe in you!",
    "Fifteen minutes! That's like... nothing! You got this! Start small, end BIG! 🔥",
  ],
  RIVAL: [
    "Day 2. Here's the deal: 15 minutes. That's your test. Pass it, and we build. Fail it... well, that's on you.",
    'Fifteen minutes. You can do that in your sleep. Question is: will you?',
  ],
  MINDFUL: [
    'Day two. A 15-minute session awaits — not as obligation, but as gift to yourself. Begin, and let the rest unfold naturally.',
    'Fifteen minutes. Breathe in, begin. Breathe out, complete. No more, no less.',
  ],
};

export const DAY3_MOMENTUM_TEMPLATES: Record<CoachStyle, string[]> = {
  DRILL_SERGEANT: [
    "DAY 3. You've got one session under your belt. Now we BUILD MOMENTUM. Today: 20 minutes. You're not broken — you're REBUILDING.",
    "Two sessions in three days. That's your new foundation. Today we add another. TWENTY MINUTES. Execute.",
  ],
  FRIEND: [
    "Day 3! You're doing amazing! 🔥 How about we bump it up just a tiny bit to 20 minutes? You've proven you can do this!",
    "Two sessions down, and you're already building momentum! Let's do 20 minutes today? I'm so proud of you! 💙",
  ],
  MENTOR: [
    'Day three. Momentum is gathering like water forming a stream. Today: 20 minutes. Observe how the practice deepens with continuity.',
    'You have reestablished your practice. Now we extend it gently to 20 minutes. The habit is returning.',
  ],
  CHEERLEADER: [
    "DAY 3!! 🎯🎯 You're ON FIRE! Let's do 20 minutes today and keep this amazing momentum going! You are SO back!",
    "Momentum is YOURS! 20 minutes today? Easy for someone who just came back from a break! YOU'VE GOT THIS! 🔥",
  ],
  RIVAL: [
    "Day 3. You've started the engine. Now give it some gas. 20 minutes. Don't let me down.",
    "You're back. Now prove you're staying. 20 minutes today.",
  ],
  MINDFUL: [
    'Day three. The momentum of presence is building. Today: 20 minutes. Flow with it, neither grasping nor resisting.',
    'Twenty minutes today. The practice returns to you as you return to it. Natural, cyclical, complete.',
  ],
};
