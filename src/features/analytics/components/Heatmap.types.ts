import { vexFire } from '@/theme/tokens/vex-fire';


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
    vexFire.backgroundSoft,
    vexFire.backgroundSoft,
    vexFire.copper,
    vexFire.copper,
    vexFire.copper,
  ],
  green: [
    vexFire.backgroundSoft,
    vexFire.backgroundSoft,
    vexFire.success,
    vexFire.success,
    vexFire.success,
  ],
  purple: [
    vexFire.backgroundSoft,
    vexFire.backgroundSoft,
    vexFire.ember,
    vexFire.ember,
    vexFire.ember,
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
  const peak = dayTotals.reduce<{ day: string; total: number } | undefined>((max, curr) => {
    if (!max || curr.total > max.total) return curr;
    return max;
  }, undefined);
  return peak?.day ?? '-';
}

export function calculatePeakHour(data: HeatmapData[]): string {
  const hourTotals = HOURS.map((hour) => ({
    hour,
    total: data
      .filter((d) => d.hour === hour)
      .reduce((sum, d) => sum + d.value, 0),
  }));
  const peak = hourTotals.reduce<{ hour: number; total: number } | undefined>((max, curr) => {
    if (!max || curr.total > max.total) return curr;
    return max;
  }, undefined);
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
