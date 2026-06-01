import { Share } from 'react-native';
import * as Sentry from '@sentry/react-native';
import {
  generateSessionShareLink,
  generateProfileShareLink,
} from '../../navigation/deep-link-utils';
import type { ShareResult, SessionShareSummary } from './types';

const APP_NAME = 'VEX';

function getGradeLabel(focusScore: number): string {
  if (focusScore >= 90) {return 'S';}
  if (focusScore >= 75) {return 'A';}
  if (focusScore >= 60) {return 'B';}
  return 'C';
}

function generateAchievementShareLink(achievementId: string): string {
  return `https://vex.app/achievement/${achievementId}`;
}

export async function shareSession(
  sessionId: string,
  summary: SessionShareSummary,
): Promise<ShareResult> {
  const url = generateSessionShareLink(sessionId);
  const grade = getGradeLabel(summary.focusScore);
  const message = `I just completed a ${summary.durationMinutes}min focus session on ${APP_NAME}! Grade ${grade} — ${summary.focusScore}% focus score.\n\n${url}`;
  return executeShare(message, url, 'shareSession');
}

export async function shareAchievement(
  achievementId: string,
  name: string,
): Promise<ShareResult> {
  const url = generateAchievementShareLink(achievementId);
  const message = `I unlocked "${name}" on ${APP_NAME}! 🏆\n\n${url}`;
  return executeShare(message, url, 'shareAchievement');
}

export async function shareProfile(userId: string): Promise<ShareResult> {
  const url = generateProfileShareLink(userId);
  const message = `Check out my ${APP_NAME} profile!\n\n${url}`;
  return executeShare(message, url, 'shareProfile');
}

async function executeShare(
  message: string,
  url: string,
  operation: string,
): Promise<ShareResult> {
  try {
    Sentry.addBreadcrumb({
      category: `share.${operation}`,
      message: `Sharing ${operation}`,
      level: 'info',
    });
    const result = await Share.share({ message, url });
    if (result.action === Share.dismissedAction) {
      return { success: false, url, error: 'Share dismissed by user' };
    }
    return { success: true, url };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    Sentry.captureException(err, {
      tags: { component: 'ShareService', operation },
    });
    return { success: false, url, error: err.message };
  }
}

export const shareService = {
  shareSession,
  shareAchievement,
  shareProfile,
};
