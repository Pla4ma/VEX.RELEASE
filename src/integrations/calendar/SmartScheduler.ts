import { createDebugger } from '../../utils/debug';
import type {
  FreeBusyInfo,
  CalendarGap,
  StudyScheduleSuggestion,
} from './types';
import {
  type UserPatterns,
  scoreGapQuality,
  generateGapReason,
  calculateConfidence,
} from './scheduler-helpers';

const debug = createDebugger('calendar:scheduler');

export class SmartScheduler {
  private userPatterns: UserPatterns;
  constructor(patterns: Partial<UserPatterns> = {}) {
    this.userPatterns = {
      preferredStartTimes: [9, 14, 20],
      preferredDays: [1, 2, 3, 4, 5],
      averageSessionDuration: 25,
      peakPerformanceHours: [],
      ...patterns,
    };
  }
  findBestGaps(
    freeBusy: FreeBusyInfo,
    minDuration: number = 25,
    _maxDuration: number = 90,
    limit: number = 3,
  ): CalendarGap[] {
    const { freeSlots } = freeBusy;
    const gaps: CalendarGap[] = [];
    for (const slot of freeSlots) {
      if (slot.duration < minDuration) {
        continue;
      }
      const quality = scoreGapQuality(this.userPatterns, slot);
      const reason = generateGapReason(slot, quality);
      gaps.push({
        startTime: slot.start,
        endTime: slot.end,
        duration: slot.duration,
        quality,
        reason,
      });
    }
    gaps.sort((a, b) => {
      const qualityScore = { EXCELLENT: 4, GOOD: 3, FAIR: 2, POOR: 1 };
      const qualityDiff = qualityScore[b.quality] - qualityScore[a.quality];
      if (qualityDiff !== 0) {
        return qualityDiff;
      }
      return b.duration - a.duration;
    });
    return gaps.slice(0, limit);
  }
  generateStudySchedule(
    freeBusy: FreeBusyInfo,
    totalMinutesNeeded: number,
    deadline?: Date,
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  ): StudyScheduleSuggestion {
    const gaps = this.findBestGaps(
      freeBusy,
      userLevel === 'beginner' ? 15 : 25,
      90,
      5,
    );
    const suggestedTimes = gaps.map((gap) => {
      let suggestedDuration = Math.min(
        gap.duration,
        this.userPatterns.averageSessionDuration,
      );
      if (userLevel === 'advanced' && gap.duration >= 45) {
        suggestedDuration = 45;
      } else if (userLevel === 'beginner') {
        suggestedDuration = Math.min(suggestedDuration, 25);
      }
      const confidence = calculateConfidence(gap, userLevel);
      return {
        startTime: gap.startTime,
        endTime: new Date(
          gap.startTime.getTime() + suggestedDuration * 60 * 1000,
        ),
        duration: suggestedDuration,
        confidence,
        reason: gap.reason,
      };
    });
    const totalAvailable = suggestedTimes.reduce(
      (sum, t) => sum + t.duration,
      0,
    );
    return {
      suggestedTimes: suggestedTimes.slice(0, 3),
      deadline,
      totalStudyNeeded: Math.min(totalMinutesNeeded, totalAvailable),
    };
  }
  updatePatternsFromHistory(
    completedSessions: Array<{
      startTime: Date;
      duration: number;
      quality: number;
    }>,
  ): void {
    if (completedSessions.length === 0) {
      return;
    }
    const totalDuration = completedSessions.reduce(
      (sum, s) => sum + s.duration,
      0,
    );
    this.userPatterns.averageSessionDuration = Math.round(
      totalDuration / completedSessions.length / 60,
    );
    const hourQuality: Record<number, number[]> = {};
    completedSessions.forEach((session) => {
      const hour = session.startTime.getHours();
      if (!hourQuality[hour]) {
        hourQuality[hour] = [];
      }
      hourQuality[hour].push(session.quality);
    });
    const peakHours: Array<{ hour: number; quality: number }> = [];
    for (const [hour, qualities] of Object.entries(hourQuality)) {
      const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      if (avgQuality > 70) {
        peakHours.push({ hour: parseInt(hour), quality: avgQuality });
      }
    }
    peakHours.sort((a, b) => b.quality - a.quality);
    this.userPatterns.peakPerformanceHours = peakHours.slice(0, 3);
    debug.info('Updated user patterns:', this.userPatterns);
  }
  analyzeDeadlines(
    events: Array<{ title: string; startTime: Date; description?: string }>,
  ): Array<{
    title: string;
    deadline: Date;
    suggestedStudyTimes: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    const deadlineKeywords = [
      'exam',
      'test',
      'quiz',
      'deadline',
      'due',
      'final',
      'midterm',
    ];
    const result: Array<{ title: string; deadline: Date; suggestedStudyTimes: number; urgency: 'HIGH' | 'MEDIUM' | 'LOW' }> = [];
    const now = new Date();
    for (const event of events) {
      const text = `${event.title} ${event.description || ''}`.toLowerCase();
      if (!deadlineKeywords.some((kw) => text.includes(kw))) continue;
      const daysUntil = Math.ceil(
        (event.startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let suggestedMinutes = 60;
      if (daysUntil <= 2) {
        urgency = 'HIGH';
        suggestedMinutes = 180;
      } else if (daysUntil <= 7) {
        urgency = 'MEDIUM';
        suggestedMinutes = 120;
      }
      if (event.startTime > now) {
        result.push({
          title: event.title,
          deadline: event.startTime,
          suggestedStudyTimes: suggestedMinutes,
          urgency,
        });
      }
    }
    result.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    return result;
  }
}
