

export interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

export interface HeatmapProps {
  data: HeatmapData[];
  title?: string;
  subtitle?: string;
  onCellPress?: (day: string, hour: number, value: number) => void;
  colorScheme?: 'blue' | 'green' | 'purple';
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const COLOR_SCHEMES = {
  blue: [
    '#eff6ff',
    '#dbeafe',
    '#93c5fd',
    '#3b82f6',
    '#1e40af',
  ],
  green: [
    '#f0fdf4',
    '#dcfce7',
    '#86efac',
    '#22c55e',
    '#166534',
  ],
  purple: [
    '#faf5ff',
    '#f3e8ff',
    '#d8b4fe',
    '#a855f7',
    '#6b21a8',
  ],
};

export function formatHour(hour: number): string {
  if (hour === 0) {
    return '12am';
  }
  if (hour === 12) {
    return '12pm';
  }
  if (hour < 12) {
    return `${hour}am`;
  }
  return `${hour - 12}pm`;
}

export function calculatePeakDay(data: HeatmapData[]): string {
  const dayTotals = DAYS.map((day) => ({
    day,
    total: data
      .filter((d) => d.day === day)
      .reduce((sum, d) => sum + d.value, 0),
  }));
  const peak = dayTotals.sort((a, b) => b.total - a.total)[0];
  return peak?.day ?? '-';
}

export function calculatePeakHour(data: HeatmapData[]): string {
  const hourTotals = HOURS.map((hour) => ({
    hour,
    total: data
      .filter((d) => d.hour === hour)
      .reduce((sum, d) => sum + d.value, 0),
  }));
  const peak = hourTotals.sort((a, b) => b.total - a.total)[0];
  if (!peak) {
    return '-';
  }
  if (peak.hour === 0) {
    return '12am';
  }
  if (peak.hour === 12) {
    return '12pm';
  }
  if (peak.hour < 12) {
    return `${peak.hour}am`;
  }
  return `${peak.hour - 12}pm`;
}

export function calculateTotal(data: HeatmapData[]): number {
  return data.reduce((sum, d) => sum + d.value, 0);
}
