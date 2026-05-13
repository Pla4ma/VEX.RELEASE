import { z } from 'zod';

/**
 * Focus DNA (Proof of Work) System
 * Generates elite-level performance reports for high-retention social signaling.
 */

export const FocusDNAReportSchema = z.object({
  userId: z.string().uuid(),
  periodDays: z.number().int().min(30).max(90),
  consistencyScore: z.number().min(0).max(100), // % of committed blocks completed
  peakFocusHour: z.number().int().min(0).max(23),
  totalEliteBlocks: z.number().int().min(0),
  averageDepthIndex: z.number().min(0).max(10), // Weighted focus quality
  topFocusCategory: z.string().optional(),
  identityMoatTier: z.enum(['INITIATE', 'PROFESSIONAL', 'ELITE', 'LEGENDARY']),
  generatedAt: z.number(),
}).strict();

export type FocusDNAReport = z.infer<typeof FocusDNAReportSchema>;

/**
 * Generates a Focus DNA report based on historical session data.
 * This report serves as a "Proof of Work" for high-status social sharing.
 */
export function generateFocusDNAReport(userId: string, sessions: any[]): FocusDNAReport {
  const eliteBlocks = sessions.filter(s => s.focusQuality >= 90);
  const totalEliteMinutes = eliteBlocks.reduce((acc, s) => acc + (s.effectiveDuration / 60 || 0), 0);
  
  // 1. Calculate Consistency (Unique days with sessions / 90 days)
  const uniqueDays = new Set(sessions.map(s => new Date(s.createdAt).toDateString())).size;
  const consistencyScore = Math.min(100, Math.round((uniqueDays / 90) * 100));
  
  // 2. Peak Focus Hour (Hour with most sessions)
  const hourCounts = new Array(24).fill(0);
  sessions.forEach(s => {
    const hour = new Date(s.createdAt).getHours();
    hourCounts[hour]++;
  });
  const peakFocusHour = hourCounts.indexOf(Math.max(...hourCounts));
  
  // 3. Average Depth Index (Quality 0-100 normalized to 0-10)
  const totalQuality = sessions.reduce((acc, s) => acc + (s.focusQuality || 0), 0);
  const averageDepthIndex = sessions.length > 0 
    ? Number((totalQuality / sessions.length / 10).toFixed(1)) 
    : 0;
  
  let tier: FocusDNAReport['identityMoatTier'] = 'INITIATE';
  if (totalEliteMinutes > 5000) tier = 'LEGENDARY';
  else if (totalEliteMinutes > 2000) tier = 'ELITE';
  else if (totalEliteMinutes > 500) tier = 'PROFESSIONAL';

  return {
    userId,
    periodDays: 90,
    consistencyScore,
    peakFocusHour,
    totalEliteBlocks: eliteBlocks.length,
    averageDepthIndex,
    identityMoatTier: tier,
    generatedAt: Date.now(),
  };
}

/**
 * Formats the report for professional sharing (Superhuman/Wordle style).
 */
export function formatFocusDNAForSharing(report: FocusDNAReport): string {
  const emojiTier = {
    'INITIATE': '🌑',
    'PROFESSIONAL': '🌓',
    'ELITE': '🌔',
    'LEGENDARY': '🌕',
  }[report.identityMoatTier];

  return `
VEX FOCUS DNA [${report.periodDays}d]
Tier: ${report.identityMoatTier} ${emojiTier}
Consistency: ${report.consistencyScore}%
Elite Blocks: ${report.totalEliteBlocks}
Depth Index: ${report.averageDepthIndex}/10
Peak Performance: ${report.peakFocusHour}:00
#ProofOfWork #VEXFocus
  `.trim();
}
