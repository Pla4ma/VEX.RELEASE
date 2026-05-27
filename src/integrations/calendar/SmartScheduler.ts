import { createDebugger } from "../../utils/debug";
import type {
  FreeBusyInfo,
  CalendarGap,
  StudyScheduleSuggestion,
} from "./types";
const debug = createDebugger("calendar:scheduler");
interface UserPatterns {
  preferredStartTimes: number[];
  preferredDays: number[];
  averageSessionDuration: number;
  peakPerformanceHours: Array<{ hour: number; quality: number }>;
}
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
    maxDuration: number = 90,
    limit: number = 3,
  ): CalendarGap[] {
    const { freeSlots } = freeBusy;
    const gaps: CalendarGap[] = [];
    for (const slot of freeSlots) {
      if (slot.duration < minDuration) {
        continue;
      }
      const quality = this.scoreGapQuality(slot);
      const reason = this.generateGapReason(slot, quality);
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
  private scoreGapQuality(slot: {
    start: Date;
    end: Date;
    duration: number;
  }): "EXCELLENT" | "GOOD" | "FAIR" | "POOR" {
    const startHour = slot.start.getHours();
    const dayOfWeek = slot.start.getDay();
    let score = 0;
    if (this.userPatterns.preferredStartTimes.includes(startHour)) {
      score += 3;
    }
    if (this.userPatterns.preferredDays.includes(dayOfWeek)) {
      score += 2;
    }
    if (slot.duration >= 30 && slot.duration <= 60) {
      score += 2;
    } else if (slot.duration >= 25) {
      score += 1;
    }
    const peakHour = this.userPatterns.peakPerformanceHours.find(
      (p) => p.hour === startHour && p.quality > 80,
    );
    if (peakHour) {
      score += 2;
    }
    if (score >= 6) {
      return "EXCELLENT";
    }
    if (score >= 4) {
      return "GOOD";
    }
    if (score >= 2) {
      return "FAIR";
    }
    return "POOR";
  }
  private generateGapReason(
    slot: { start: Date; duration: number },
    quality: string,
  ): string {
    const hour = slot.start.getHours();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = dayNames[slot.start.getDay()];
    const timeLabels: Record<number, string> = {
      6: "Early morning",
      9: "Morning",
      12: "Midday",
      14: "Afternoon",
      17: "Late afternoon",
      20: "Evening",
      22: "Night",
    };
    const timeLabel = timeLabels[hour] || `${hour}:00`;
    if (quality === "EXCELLENT") {
      return `Your peak performance time (${day} ${timeLabel})`;
    } else if (quality === "GOOD") {
      return `Good focus time (${day} ${timeLabel})`;
    } else if (quality === "FAIR") {
      return `Available slot (${day} ${timeLabel})`;
    } else {
      return `Short window (${day} ${timeLabel})`;
    }
  }
  generateStudySchedule(
    freeBusy: FreeBusyInfo,
    totalMinutesNeeded: number,
    deadline?: Date,
    userLevel: "beginner" | "intermediate" | "advanced" = "intermediate",
  ): StudyScheduleSuggestion {
    const gaps = this.findBestGaps(
      freeBusy,
      userLevel === "beginner" ? 15 : 25,
      90,
      5,
    );
    const suggestedTimes = gaps.map((gap) => {
      let suggestedDuration = Math.min(
        gap.duration,
        this.userPatterns.averageSessionDuration,
      );
      if (userLevel === "advanced" && gap.duration >= 45) {
        suggestedDuration = 45;
      } else if (userLevel === "beginner") {
        suggestedDuration = Math.min(suggestedDuration, 25);
      }
      const confidence = this.calculateConfidence(gap, userLevel);
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
  private calculateConfidence(gap: CalendarGap, userLevel: string): number {
    let confidence = 0.5;
    const qualityBoosts: Record<string, number> = {
      EXCELLENT: 0.3,
      GOOD: 0.2,
      FAIR: 0.1,
      POOR: 0,
    };
    confidence += qualityBoosts[gap.quality] || 0;
    const idealDuration =
      userLevel === "beginner" ? 25 : userLevel === "advanced" ? 45 : 30;
    const durationDiff = Math.abs(gap.duration - idealDuration);
    if (durationDiff <= 5) {
      confidence += 0.2;
    } else if (durationDiff <= 15) {
      confidence += 0.1;
    }
    return Math.min(0.95, confidence);
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
    this.userPatterns.peakPerformanceHours = Object.entries(hourQuality)
      .map(([hour, qualities]) => ({
        hour: parseInt(hour),
        quality: qualities.reduce((sum, q) => sum + q, 0) / qualities.length,
      }))
      .filter((h) => h.quality > 70)
      .sort((a, b) => b.quality - a.quality)
      .slice(0, 3);
    debug.info("Updated user patterns:", this.userPatterns);
  }
  analyzeDeadlines(
    events: Array<{ title: string; startTime: Date; description?: string }>,
  ): Array<{
    title: string;
    deadline: Date;
    suggestedStudyTimes: number;
    urgency: "HIGH" | "MEDIUM" | "LOW";
  }> {
    const deadlineKeywords = [
      "exam",
      "test",
      "quiz",
      "deadline",
      "due",
      "final",
      "midterm",
    ];
    return events
      .filter((event) => {
        const text = `${event.title} ${event.description || ""}`.toLowerCase();
        return deadlineKeywords.some((kw) => text.includes(kw));
      })
      .map((event) => {
        const daysUntil = Math.ceil(
          (event.startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        let urgency: "HIGH" | "MEDIUM" | "LOW" = "LOW";
        let suggestedMinutes = 60;
        if (daysUntil <= 2) {
          urgency = "HIGH";
          suggestedMinutes = 180;
        } else if (daysUntil <= 7) {
          urgency = "MEDIUM";
          suggestedMinutes = 120;
        }
        return {
          title: event.title,
          deadline: event.startTime,
          suggestedStudyTimes: suggestedMinutes,
          urgency,
        };
      })
      .filter((d) => d.deadline > new Date())
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }
}
