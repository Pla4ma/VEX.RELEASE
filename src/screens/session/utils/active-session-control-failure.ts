export type ActiveSessionControlAction = 'pause' | 'complete' | 'abandon';

export interface ActiveSessionControlFailure {
  action: ActiveSessionControlAction;
  message: string;
  supportHint: string;
  title: string;
}

const FAILURE_COPY: Record<
  ActiveSessionControlAction,
  Omit<ActiveSessionControlFailure, 'action'>
> = {
  abandon: {
    message:
      'Quit did not finish cleanly. Retry so VEX can close this session without leaving it stranded.',
    supportHint:
      'Your latest local session state is still saved; support can inspect it if retry keeps failing.',
    title: 'Quit needs one more try',
  },
  complete: {
    message:
      'Completion did not confirm. Retry before leaving so this focused work can count toward rewards and history.',
    supportHint:
      'Your latest local session state is still saved; support can inspect it if retry keeps failing.',
    title: 'Your win is not banked yet',
  },
  pause: {
    message:
      'Pause or resume did not confirm. Retry to keep the timer and focus record aligned.',
    supportHint:
      'Your latest local session state is still saved; support can inspect it if retry keeps failing.',
    title: 'Session control did not land',
  },
};

export function buildActiveSessionControlFailure(
  action: ActiveSessionControlAction,
): ActiveSessionControlFailure {
  return {
    action,
    ...FAILURE_COPY[action],
  };
}
