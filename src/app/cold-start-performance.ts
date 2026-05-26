import { addBreadcrumb } from '../config/sentry';

export type ColdStartMark =
  | 'app_mounted'
  | 'root_navigator_ready'
  | 'first_home_skeleton_rendered'
  | 'lane_hydrated'
  | 'first_actionable_cta_rendered';

const marked = new Set<ColdStartMark>();
const startedAt = readNow();

function readNow(): number {
  const perf = globalThis.performance;
  return typeof perf?.now === 'function' ? perf.now() : Date.now();
}

export function markColdStart(
  mark: ColdStartMark,
  data: Record<string, unknown> = {},
): void {
  if (marked.has(mark)) {
    return;
  }

  marked.add(mark);

  try {
    addBreadcrumb(`cold_start:${mark}`, 'performance.cold_start', {
      elapsedMs: Math.round(readNow() - startedAt),
      mark,
      ...data,
    });
  } catch {
    // Breadcrumbs must never affect startup.
  }
}
