import { validateProposedTool } from '../core-policy';

describe('ai core policy', () => {
  it('blocks unknown tool access for current context', () => {
    const result = validateProposedTool(
      {
        tool: 'create_memory_candidate',
        payload: {},
        requiresUserConfirmation: true,
        canAutoExecute: false,
      },
      ['create_session_plan'],
    );
    expect(result.allowed).toBe(false);
  });

  it('allows typed confirmation-only tools', () => {
    const result = validateProposedTool(
      {
        tool: 'create_session_plan',
        payload: { minutes: 15 },
        requiresUserConfirmation: true,
        canAutoExecute: false,
      },
      ['create_session_plan'],
    );
    expect(result.allowed).toBe(true);
  });
});
