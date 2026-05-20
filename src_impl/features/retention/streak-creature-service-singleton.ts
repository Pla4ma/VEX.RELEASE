import { StreakCreatureService } from "./StreakCreatureSystem";

let streakCreatureService: StreakCreatureService | null = null;

export function createStreakCreatureService(): StreakCreatureService {
  return new StreakCreatureService();
}

export function getStreakCreatureService(): StreakCreatureService {
  if (!streakCreatureService) {
    streakCreatureService = new StreakCreatureService();
  }
  return streakCreatureService;
}
