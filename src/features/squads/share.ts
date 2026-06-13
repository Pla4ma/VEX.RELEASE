/**
 * Squad Share Utilities
 * Builds squad codes and share messages for deep linking.
 */

export function buildSquadCode(squadId: string): string {
  return squadId.slice(0, 8);
}

export function buildSquadShareMessage(squad: { name: string; focusHours: number }, squadCode: string): string {
  const url = `https://vex.app/squad/${squadCode}`;
  return `Join my squad "${squad.name}" on VEX! 🎯 We've logged ${squad.focusHours}h of focus this week. ${url}`;
}

export function parseSquadCodeFromUrl(url: string): string | null {
  const match = url.match(/vex\.app\/squad\/([a-z0-9]{8})/i);
  if (!match) return null;
  return match[1] ?? null;
}