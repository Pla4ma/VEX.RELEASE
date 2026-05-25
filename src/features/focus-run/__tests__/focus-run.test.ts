import { buildFocusRunDisplay, resolvePersonalBoss } from '../service';

describe('focus-run service', () => {
  it('keeps minimal lane out of run board', () => {
    const display = buildFocusRunDisplay({ lane: 'minimal_normal', run: null });

    expect(display.laneAllowed).toBe(false);
    expect(display.title).toContain('hidden');
  });

  it('uses cold-start teaser until enough evidence exists', () => {
    const boss = resolvePersonalBoss(['scrolling']);

    expect(boss.archetype).toBe('doomscroll_hydra');
    expect(boss.isTeaser).toBe(true);
  });

  it('creates evidence-based personal boss after repeated signals', () => {
    const boss = resolvePersonalBoss(['deadline avoidance', 'deadline late']);

    expect(boss.archetype).toBe('deadline_wraith');
    expect(boss.isTeaser).toBe(false);
  });

  it('never exposes currency display fields', () => {
    const display = buildFocusRunDisplay({
      lane: 'game_like',
      run: {
        events: [],
        id: 'run-1',
        status: 'active',
        userId: 'user-1',
        weekStartsAt: 1,
      },
    });

    expect(JSON.stringify(display)).not.toMatch(/coin|gem|shop|wager|currency/i);
  });
});
