export const GEMINI_MODELS={FLASH:'gemini-2.5-flash',PRO:'gemini-2.5-pro',FLASH_LATEST:'gemini-flash-latest'}as const;export const DEFAULT_MODEL=GEMINI_MODELS.FLASH;export const MODEL_BY_USE_CASE:Record<string,string>={GENERATE_COACH_MESSAGE:GEMINI_MODELS.FLASH,GENERATE_SESSION_SUMMARY:GEMINI_MODELS.PRO,GENERATE_COMEBACK_PROMPT:GEMINI_MODELS.FLASH,GENERATE_STREAK_RISK_NUDGE:GEMINI_MODELS.FLASH,GENERATE_WEEKLY_REFLECTION:GEMINI_MODELS.PRO,GENERATE_PERSONALIZED_TIP:GEMINI_MODELS.FLASH};export const GENERATION_CONFIG={COACH_MESSAGE:{temperature:0.7,maxOutputTokens:200,topP:0.9,topK:40},SESSION_SUMMARY:{temperature:0.8,maxOutputTokens:500,topP:0.9,topK:40},COMEBACK_PROMPT:{temperature:0.8,maxOutputTokens:300,topP:0.9,topK:40},STREAK_RISK_NUDGE:{temperature:0.9,maxOutputTokens:150,topP:0.95,topK:60},WEEKLY_REFLECTION:{temperature:0.8,maxOutputTokens:800,topP:0.9,topK:40}}as const;export const SAFETY_SETTINGS=[{category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_HATE_SPEECH',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_SEXUALLY_EXPLICIT',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'}];export const AI_TIMEOUTS={DEFAULT:10000,COACH_MESSAGE:5000,SESSION_SUMMARY:15000,COMEBACK_PROMPT:8000,STREAK_RISK_NUDGE:5000,WEEKLY_REFLECTION:20000}as const;export const RETRY_CONFIG={MAX_RETRIES:3,INITIAL_DELAY_MS:1000,MAX_DELAY_MS:5000,BACKOFF_MULTIPLIER:2}as const;export const CACHE_CONFIG={ENABLED:true,DEFAULT_TTL_MS:5*60*1000,COACH_MESSAGE_TTL_MS:2*60*1000,SESSION_SUMMARY_TTL_MS:60*60*1000,COMEBACK_PROMPT_TTL_MS:10*60*1000,STREAK_RISK_TTL_MS:60*1000,WEEKLY_REFLECTION_TTL_MS:24*60*60*1000}as const;export const SYSTEM_PROMPTS={COACH_MESSAGE:`You are VEX, a motivational AI coach for a productivity/focus app.
Your goal is to encourage users to maintain focus habits and build streaks.

Guidelines:
- Be encouraging but not overwhelming
- Keep messages concise (under 200 characters when possible)
- Match the requested tone/persona
- Never shame the user
- Include relevant emoji
- Focus on the specific context provided
- Never mention being an AI

You will receive structured context and should output only the message content.`,SESSION_SUMMARY:`You are VEX, a productivity coach summarizing a user's focus sessions.
Create an encouraging, personalized summary of their recent activity.

Guidelines:
- Celebrate wins without being overly effusive
- Mention specific metrics provided in context
- Keep tone positive and forward-looking
- Include a next-goal suggestion
- Use markdown formatting for readability
- Keep under 500 tokens

Output format:
- Headline: Short, punchy summary
- Highlights: Key achievements
- Reflection: Brief insight
- Next Goal: Actionable next step`,COMEBACK_PROMPT:`You are VEX, helping a user rebuild their focus habit after a break.
They're in "comeback mode" and need encouragement to restart their streak.

Guidelines:
- Acknowledge the break without dwelling on it
- Emphasize fresh starts and learning
- Reference their comeback progress
- Be motivating but gentle
- Keep under 300 characters
- Include relevant emoji

The user is on comeback day X of 3.`,STREAK_RISK_NUDGE:`You are VEX, urgently reminding a user their streak is about to break.
This is time-sensitive and requires immediate action.

Guidelines:
- Create urgency without panic
- Be encouraging, not demanding
- Suggest a specific short session (15 min)
- Mention their current streak count
- Keep extremely concise (under 150 characters)
- Include 🔥 emoji

Output format: Single urgent, motivating sentence.`,WEEKLY_REFLECTION:`You are VEX, providing a weekly reflection for a productivity app user.
Summarize their week, celebrate wins, and set intentions for next week.

Guidelines:
- Structure with clear sections
- Reference specific metrics provided
- Balance celebration with growth mindset
- Suggest one focus area for next week
- Keep under 800 tokens
- Use markdown headers

Output format:
- ## Week at a Glance
- ## Wins
- ## Reflection
- ## Next Week Focus`}as const;export const USER_PROMPT_TEMPLATES={COACH_MESSAGE:`Generate a coach message with the following context:

Category: {{category}}
Persona Style: {{personaStyle}}
Current Streak: {{currentStreak}} days
Hours Since Last Session: {{hoursSinceLastSession}}
Current Level: {{currentLevel}}
Recent Session Quality: {{recentSessionQuality}}/100

Output only the message content, no explanations.`,SESSION_SUMMARY:`Generate a session summary for this user:

Period: {{period}}
Sessions Completed: {{sessionCount}}
Total Focus Hours: {{totalFocusHours}}
Average Quality: {{averageQuality}}/100
Streak at Start: {{streakAtStart}} days
Streak at End: {{streakAtEnd}} days
XP Earned: {{xpEarned}}
Challenges Completed: {{challengesCompleted}}
{{#bossEncounters}}Boss Encounters: {{bossEncounters}}{{/bossEncounters}}

Generate a motivating summary with specific highlights.`,COMEBACK_PROMPT:`Generate a comeback prompt for day {{comebackDay}} of 3:

Previous Streak: {{previousStreak}} days
Days Inactive: {{daysInactive}}
Sessions Completed in Comeback: {{sessionsCompleted}}
Bonus Multiplier: {{bonusMultiplier}}x
Persona Style: {{personaStyle}}

Create encouraging, progress-focused message.`,STREAK_RISK_NUDGE:`Generate urgent streak risk nudge:

Current Streak: {{currentStreak}} days 🔥
Hours Remaining: {{hoursRemaining}}
Risk Level: {{riskLevel}}
Last Session Quality: {{lastSessionQuality}}/100

Generate one urgent, motivating sentence to save the streak.`,WEEKLY_REFLECTION:`Generate weekly reflection for week {{weekNumber}}:

Sessions: {{sessionsCompleted}}
Focus Hours: {{totalFocusHours}}
Avg Quality: {{averageQuality}}/100
Streak Change: {{streakAtStart}} → {{streakAtEnd}}
XP Earned: {{xpEarned}}
Level Ups: {{levelUps}}
Challenges: {{challengesCompleted}}
Bosses: {{bossEncounters}}
{{#improvementAreas}}Areas to Improve: {{improvementAreas}}{{/improvementAreas}}
{{#strengths}}Strengths: {{strengths}}{{/strengths}}

Generate structured weekly reflection.`}as const;export const FALLBACK_CONTENT={COACH_MESSAGE:{STREAK_RISK:['🔥 Your streak is at risk! Just 15 minutes today keeps it alive.','Your streak needs you! Quick focus session to save the day?',"Don't let your hard work slip away! One session saves it all."],SESSION_SUGGESTION:["Perfect time for focus! You're in the zone today.",'Ready to build momentum? A quick session would be perfect now.','Your focus window is open! Make the most of it.'],MILESTONE_HYPE:['🎉 Incredible dedication! Keep the momentum going!',"You're on fire! Every session compounds into greatness.",'Epic streak! Your consistency is inspiring!'],COMEBACK_SUPPORT:['💪 Every comeback is stronger than the break. You have got this!','Fresh start, stronger you! The streak starts now.','Past is practice. Today is progress. Keep going!'],POST_FAILURE:["That one didn't go as planned. That is okay - growth comes from challenges!",'Every expert was once a beginner who kept trying.',"Focus is a skill. Today's difficulty is tomorrow's strength."],PROGRESS_REMINDER:['Building momentum! Every session brings you closer to your goals.',"Progress isn't always visible, but it's always happening.","You're leveling up! Keep showing up for yourself."],MOTIVATION_BOOST:["You're capable of amazing things. Today's focus is tomorrow's achievement!",'Small steps, big results. Every session compounds!','Your future self will thank you for showing up today.'],BREAK_SUGGESTION:['You have been crushing it! A short break will recharge you.','Quality over quantity. Rest now, focus sharper later.','Your brain deserves a reset. Step away and come back stronger.']},SESSION_SUMMARY:{daily:['Great work today! Every session is a step forward. Keep building that momentum!'],weekly:['What a week! Your dedication is paying off. Ready to make next week even better?'],monthly:['A month of progress! Look how far you have come. Your consistency is incredible!']},COMEBACK_PROMPT:{day1:'💪 Welcome back! Day 1 of your comeback starts now. First session gets 2x XP!',day2:'🔥 Day 2! You are rebuilding stronger than before. Keep that momentum!',day3:'🎉 Comeback complete! You have earned your 2x bonus. Your streak is back!'},STREAK_RISK_NUDGE:{critical:'🔥 CRITICAL: Your streak expires soon! Start a 15-min session NOW!',high:'⏰ Your streak is at risk! One quick session saves it!',medium:'⚠️ Streak warning! Do not let your progress slip away.',low:'Heads up: Your streak window is closing. Ready for a session?'},WEEKLY_REFLECTION:{default:`## Week at a Glance
You showed up this week and put in the work. That consistency is what builds lasting habits.

## Wins
- You maintained your focus practice
- Progress was made, session by session
- Your dedication is building momentum

## Reflection
Every expert was once a beginner who kept showing up. You are on that path.

## Next Week Focus
Keep the rhythm going. One session at a time.`}}as const;export const VALIDATION_RULES={COACH_MESSAGE:{minLength:10,maxLength:1000,requiredKeywords:[],forbiddenPatterns:[/i am an ai/i,/as an ai/i,/i am just/i,/i cannot/i,/i do not have/i]},SESSION_SUMMARY:{minLength:50,maxLength:2000,requiredSections:['headline','reflection']},COMEBACK_PROMPT:{minLength:20,maxLength:500,requiredKeywords:['comeback','streak']},STREAK_RISK_NUDGE:{minLength:10,maxLength:300,requiredKeywords:['streak','session'],requiredEmoji:['🔥']},WEEKLY_REFLECTION:{minLength:100,maxLength:3000,requiredSections:['week','wins','reflection','focus']}}as const;export const RATE_LIMITS={PER_USER_PER_MINUTE:10,PER_USER_PER_HOUR:100,PER_APP_PER_MINUTE:1000}as const;export const AI_FEATURE_FLAGS={AI_ENABLED:'ai_enabled',AI_CACHE_ENABLED:'ai_cache_enabled',AI_FALLBACK_ENABLED:'ai_fallback_enabled',AI_COACH_MESSAGES:'ai_coach_messages',AI_SESSION_SUMMARIES:'ai_session_summaries',AI_COMEBACK_PROMPTS:'ai_comeback_prompts',AI_STREAK_NUDGES:'ai_streak_nudges',AI_WEEKLY_REFLECTIONS:'ai_weekly_reflections'}as const;
