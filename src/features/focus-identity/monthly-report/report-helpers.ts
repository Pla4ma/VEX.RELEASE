import type { SessionData } from './schemas';

/**
 * Calculate grade based on score
 */
export function calculateGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) {
    return 'A+';
  }
  if (score >= 90) {
    return 'A';
  }
  if (score >= 80) {
    return 'B';
  }
  if (score >= 70) {
    return 'C';
  }
  if (score >= 60) {
    return 'D';
  }
  return 'F';
}

/**
 * Generate AI insights for premium users
 */
export async function generateAIInsight(
  userId: string,
  sessions: SessionData[],
  scoreDelta: number,
): Promise<string> {
  // This would integrate with the AI Coach system
  // For now, return a placeholder insight
  if (scoreDelta > 10) {
    return 'Excellent progress! Your consistency is paying off. Consider maintaining your current routine while gradually increasing session duration.';
  } else if (scoreDelta > 0) {
    return 'Steady improvement detected. Focus on maintaining your current schedule and consider adding one extra session per week.';
  } else if (scoreDelta < -10) {
    return "Significant score decline detected. Let's prioritize rebuilding your foundation with shorter, more frequent sessions.";
  } else {
    return 'Your score is stable. This is a good foundation to build upon. Try experimenting with different session times to find your optimal focus window.';
  }
}
