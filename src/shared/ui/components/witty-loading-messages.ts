/**
 * Witty Loading Messages
 * Context-aware loading messages data for VEX personality
 */

export type LoadingContext =
  | "home"
  | "boss"
  | "leaderboard"
  | "coach"
  | "achievements"
  | "challenges"
  | "squad"
  | "profile"
  | "analytics"
  | "default";

export const wittyMessages: Record<LoadingContext, string[]> = {
  home: [
    "Loading your focus dashboard...",
    "Warming up your streak data...",
    "Checking your daily momentum...",
    "Summoning your battle stats...",
  ],
  boss: [
    "The boss is preparing...",
    "Summoning the arena...",
    "Sharpening your weapons...",
    "The enemy approaches...",
  ],
  leaderboard: [
    "Counting everyone's hours...",
    "Ranking the legends...",
    "Tallying the scores...",
    "Finding the top performers...",
  ],
  coach: [
    "Your coach is reviewing your patterns...",
    "Analyzing your focus data...",
    "Preparing your insights...",
    "Crafting your next challenge...",
  ],
  achievements: [
    "Gathering your trophies...",
    "Polishing your medals...",
    "Collecting your victories...",
    "Summoning your achievements...",
  ],
  challenges: [
    "Loading your missions...",
    "Preparing the arena...",
    "Setting up the trials...",
    "Summoning the challenges...",
  ],
  squad: [
    "Rallying your squad...",
    "Gathering your team...",
    "Checking squad readiness...",
    "Syncing with your allies...",
  ],
  profile: [
    "Loading your legend...",
    "Summoning your stats...",
    "Gathering your journey...",
    "Preparing your profile...",
  ],
  analytics: [
    "Crunching your numbers...",
    "Analyzing your patterns...",
    "Building your insights...",
    "Processing your data...",
  ],
  default: [
    "Loading...",
    "Preparing your experience...",
    "Gathering data...",
    "Almost there...",
  ],
};

export function getRandomMessage(context: LoadingContext): string {
  const messages: string[] = wittyMessages[context] ?? wittyMessages.default;
  return messages[Math.floor(Math.random() * messages.length)]!;
}
