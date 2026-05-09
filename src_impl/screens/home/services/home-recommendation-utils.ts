export function getHoursUntilEndOfDay(date: Date): number {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return Math.max(0, (endOfDay.getTime() - date.getTime()) / (1000 * 60 * 60));
}

export function getDaysSince(timestamp: number): number {
  return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
}
