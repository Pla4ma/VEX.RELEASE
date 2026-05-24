/**
 * Monthly Focus Report Analysis
 *
 * Functions for analyzing session data and generating insights.
 */

import { type SessionData, type SessionAnalysis } from './schemas';

/**
 * Analyze session data to extract insights
 */
export function analyzeSessionData(sessions: SessionData[]): SessionAnalysis {
  const sessionCount = sessions.length;
  const totalFocusedMinutes = sessions.reduce((sum, session) => {
    return sum + (session.duration_minutes || 0);
  }, 0);

  const averageSessionLength = sessionCount > 0 ? totalFocusedMinutes / sessionCount : 0;

  // Find best grade
  const grades = sessions.map(s => s.grade || 'C');
  const bestGrade = determineBestGrade(grades);

  // Find best focus window
  const bestFocusWindow = findBestFocusWindow(sessions);

  // Analyze patterns
  const { strongestPattern, weakestPattern } = analyzePatterns(sessions);

  return {
    sessionCount,
    totalFocusedMinutes,
    averageSessionLength,
    bestGrade,
    bestFocusWindow,
    strongestPattern,
    weakestPattern,
  };
}

/**
 * Determine best grade from array of grades
 */
function determineBestGrade(grades: string[]): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'A+'] as const;
  let bestGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';

  for (const grade of grades) {
    const currentIndex = gradeOrder.indexOf(bestGrade);
    const newIndex = gradeOrder.indexOf(grade as typeof gradeOrder[number]);
    if (newIndex > currentIndex && gradeOrder.includes(grade as typeof gradeOrder[number])) {
      bestGrade = grade as 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    }
  }

  return bestGrade;
}

/**
 * Find the best focus window from sessions
 */
function findBestFocusWindow(sessions: SessionData[]) {
  if (sessions.length === 0) {
    return {
      dayOfWeek: 'Monday',
      timeRange: '9:00 AM - 10:00 AM',
      averagePurity: 0,
    };
  }

  // Group sessions by day of week and time
  const windowPerformance = new Map<string, { totalPurity: number; count: number }>();

  sessions.forEach(session => {
    const date = new Date(session.completed_at);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    const timeWindow = `${hour}:00 - ${hour + 1}:00`;
    const key = `${dayOfWeek} ${timeWindow}`;

    const purity = session.focus_purity_score || 0;
    const current = windowPerformance.get(key) || { totalPurity: 0, count: 0 };
    windowPerformance.set(key, {
      totalPurity: current.totalPurity + purity,
      count: current.count + 1,
    });
  });

  // Find the window with highest average purity
  let bestWindow = { dayOfWeek: 'Monday', timeRange: '9:00 AM - 10:00 AM', averagePurity: 0 };

  for (const [key, data] of windowPerformance.entries()) {
    const averagePurity = data.totalPurity / data.count;
    if (averagePurity > bestWindow.averagePurity) {
      const [dayOfWeek = 'Monday', timeRange = '9:00 AM - 10:00 AM'] = key.split(' ');
      bestWindow = { dayOfWeek, timeRange, averagePurity };
    }
  }

  return bestWindow;
}

/**
 * Analyze patterns in session data
 */
function analyzePatterns(sessions: SessionData[]) {
  if (sessions.length === 0) {
    return {
      strongestPattern: 'Consistent morning sessions',
      weakestPattern: 'Evening focus drops',
    };
  }

  // Analyze session timing patterns
  const morningSessions = sessions.filter(s => {
    const hour = new Date(s.completed_at).getHours();
    return hour >= 6 && hour < 12;
  }).length;

  const afternoonSessions = sessions.filter(s => {
    const hour = new Date(s.completed_at).getHours();
    return hour >= 12 && hour < 18;
  }).length;

  const eveningSessions = sessions.filter(s => {
    const hour = new Date(s.completed_at).getHours();
    return hour >= 18 && hour < 22;
  }).length;

  const totalSessions = sessions.length;

  let strongestPattern = 'Consistent focus routine';
  let weakestPattern = 'Irregular scheduling';

  if (morningSessions / totalSessions > 0.6) {
    strongestPattern = 'Strong morning focus habit';
  } else if (afternoonSessions / totalSessions > 0.6) {
    strongestPattern = 'Consistent afternoon productivity';
  } else if (eveningSessions / totalSessions > 0.6) {
    strongestPattern = 'Evening focus discipline';
  }

  if (morningSessions / totalSessions < 0.2) {
    weakestPattern = 'Limited morning engagement';
  } else if (afternoonSessions / totalSessions < 0.2) {
    weakestPattern = 'Afternoon energy dips';
  } else if (eveningSessions / totalSessions < 0.2) {
    weakestPattern = 'Evening focus challenges';
  }

  return { strongestPattern, weakestPattern };
}

/**
 * Generate next month target
 */
export function generateNextMonthTarget(scoreDelta: number, sessionAnalysis: SessionAnalysis): string {
  if (scoreDelta > 15) {
    return 'Maintain momentum while adding 10% more focus time';
  } else if (scoreDelta > 0) {
    return 'Increase session frequency by 2 sessions per week';
  } else if (sessionAnalysis.sessionCount < 10) {
    return 'Complete 12+ sessions next month';
  } else {
    return 'Focus on session quality over quantity';
  }
}
