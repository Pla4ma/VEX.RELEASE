import * as Sentry from '@sentry/react-native';

export const PROJECT_FOCUS_ANALYTICS_EVENTS = [
  'project_thread_created',
  'project_session_started',
  'project_thread_updated',
  'project_thread_rescued',
  'project_handoff_stored',
] as const;

export type ProjectFocusEvent = (typeof PROJECT_FOCUS_ANALYTICS_EVENTS)[number];

export function trackProjectThreadCreated(projectTitle: string): void {
  try {
    Sentry.addBreadcrumb({
      category: 'project-focus',
      message: 'project_thread_created',
      data: { projectTitle },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackProjectSessionStarted(projectTitle: string): void {
  try {
    Sentry.addBreadcrumb({
      category: 'project-focus',
      message: 'project_session_started',
      data: { projectTitle },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackProjectThreadUpdated(
  projectTitle: string,
  state: string,
): void {
  try {
    Sentry.addBreadcrumb({
      category: 'project-focus',
      message: 'project_thread_updated',
      data: { projectTitle, state },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackProjectThreadRescued(projectTitle: string): void {
  try {
    Sentry.addBreadcrumb({
      category: 'project-focus',
      message: 'project_thread_rescued',
      data: { projectTitle },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackProjectHandoffStored(projectTitle: string): void {
  try {
    Sentry.addBreadcrumb({
      category: 'project-focus',
      message: 'project_handoff_stored',
      data: { projectTitle },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}
