import fs from 'fs';
import path from 'path';
import {
  resolveBehaviorLane,
  resolveInitialLane,
  shouldReconsiderLane,
  shouldSuggestLaneReconsideration,
} from '../service';
import { observedAt } from './ownership-proof-helpers';

describe('Lane Engine ownership proof – core resolution', () => {
  it('Lane Engine owns lane resolution and manual override wins', () => {
    const manual = resolveBehaviorLane({
      bossEngagement: 'high',
      completedSessions: 10,
      manualOverride: 'minimal_normal',
      motivationStyle: 'game_like',
      observedAt,
      primaryGoal: 'creative',
    });
    expect(manual.primaryLane).toBe('minimal_normal');
    expect(manual.confidence).toBe(1);
    expect(manual.source).toBe('manual_override');
  });

  it('behavior can suggest reconsideration without silent override', () => {
    const current = resolveInitialLane({
      manualOverride: 'minimal_normal',
      observedAt,
    });
    const latest = resolveBehaviorLane({
      completedSessions: 10,
      motivationStyle: 'study_focused',
      observedAt,
      primaryGoal: 'study',
      studyUsageRatio: 1,
    });
    expect(
      shouldReconsiderLane({
        completedSessions: 10,
        currentProfile: current,
        latestProfile: latest,
      }),
    ).toBe(false);
    expect(
      shouldSuggestLaneReconsideration({
        completedSessions: 10,
        currentProfile: current,
        latestProfile: latest,
      }),
    ).toBe(true);
  });

  it('missing profile falls back to Clean with low confidence', () => {
    const fallback = resolveInitialLane({ observedAt });
    expect(fallback.primaryLane).toBe('minimal_normal');
    expect(fallback.confidenceBand).toBe('low');
    expect(fallback.source).toBe('fallback');
  });

  it('Home and completion do not own direct lane resolver files', () => {
    const home = fs.readFileSync(
      path.join(
        process.cwd(),
        'src/screens/home/hooks/useHomeResolvedExperience.ts',
      ),
      'utf8',
    );
    const completion = fs.readFileSync(
      path.join(
        process.cwd(),
        'src/features/session-completion/completion-orchestrator.ts',
      ),
      'utf8',
    );
    expect(home).not.toMatch(/resolveInitialLane\(|resolveBehaviorLane\(/);
    expect(completion).not.toMatch(/resolveCompletionLane|buildLaneProfile/);
  });
});
