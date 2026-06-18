import type { FocusIdentityProfile } from './FocusIdentityEngine';

export const createMonthlyFocusReport = (
  profile: FocusIdentityProfile,
): FocusIdentityProfile['monthlyReport'] => {
  const now = new Date();
  const monthKey =
    now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthHistory = profile.scoreHistory.filter(
    (h) => new Date(h.date) >= monthStart,
  );

  if (monthHistory.length < 2) {return null;}

  const startingScore = monthHistory[0]?.score ?? 0; // ponytail: asserted non-null by length >= 2 guard above
  const endingScore = monthHistory[monthHistory.length - 1]?.score ?? 0; // ponytail: asserted non-null by length >= 2 guard above
  const change = endingScore - startingScore;
  const sessionsCompleted = profile.scoreHistory.filter(
    (h) =>
      h.reason.includes('SESSION_COMPLETE') && new Date(h.date) >= monthStart,
  ).length;
  let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'D';

  if (change >= 50) {grade = 'A+';}
  else if (change >= 30) {grade = 'A';}
  else if (change >= 15) {grade = 'B+';}
  else if (change >= 5) {grade = 'B';}
  else if (change >= -5) {grade = 'C';}

  const highlights = [
    change > 30 ? 'Incredible +' + change + ' point improvement!' : null,
    sessionsCompleted >= 20
      ? sessionsCompleted + ' sessions completed this month'
      : null,
    profile.band.label === 'Legendary' ? 'Maintaining Legendary status' : null,
    profile.isInRecovery ? 'Strong recovery from setback' : null,
  ].filter(Boolean);

  return {
    month: monthKey,
    startingScore,
    endingScore,
    change,
    sessionsCompleted,
    grade,
    highlight:
      highlights[0] || 'Score change: ' + (change > 0 ? '+' : '') + change,
  };
};
