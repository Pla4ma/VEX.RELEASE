/**
 * Shared helpers for ExitGate verifier functions.
 */

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function computeStatusAndScore(
  issues: string[],
  failThreshold: number,
  _warningThreshold: number,
): { status: 'pass' | 'fail' | 'warning'; score: number } {
  if (issues.length === 0) {
    return { status: 'pass', score: 100 };
  }
  if (issues.length >= failThreshold) {
    return { status: 'fail', score: Math.max(0, 100 - issues.length * 15) };
  }
  return { status: 'warning', score: Math.max(70, 100 - issues.length * 10) };
}
