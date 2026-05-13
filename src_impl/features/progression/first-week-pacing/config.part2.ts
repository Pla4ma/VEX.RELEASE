import { FirstWeekConfigSchema, type FirstWeekConfig, type FirstWeekSession } from "./schemas";


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