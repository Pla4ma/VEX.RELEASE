import type { FirstWeekSession } from './schemas';

// Helper function to get next session
export function getNextSession(
  currentSession: FirstWeekSession,
): FirstWeekSession | null {
  const sessions: FirstWeekSession[] = [
    'SESSION_1',
    'SESSION_2',
    'SESSION_3',
    'SESSION_4',
    'SESSION_5',
    'SESSION_6',
    'SESSION_7',
    'COMPLETED',
  ];

  const currentIndex = sessions.indexOf(currentSession);
  if (currentIndex === -1 || currentIndex >= sessions.length - 1) {
    return null;
  }

  return sessions[currentIndex + 1] ?? null;
}

// Helper function to get session number
export function getSessionNumber(session: FirstWeekSession): number {
  const sessions: FirstWeekSession[] = [
    'SESSION_1',
    'SESSION_2',
    'SESSION_3',
    'SESSION_4',
    'SESSION_5',
    'SESSION_6',
    'SESSION_7',
  ];

  return sessions.indexOf(session) + 1;
}
