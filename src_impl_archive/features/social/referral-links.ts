export function buildSquadInviteLink(appUrlScheme: string, code: string, squadName?: string): string {
  const encodedSquad = squadName ? `&squad=${encodeURIComponent(squadName)}` : '';
  return `${appUrlScheme}invite?code=${encodeURIComponent(code)}${encodedSquad}`;
}

export function buildSquadInviteMessage(input: {
  code: string;
  link: string;
  squadName?: string;
  inviterName?: string;
}): string {
  const squad = input.squadName ?? 'my VEX squad';
  const inviter = input.inviterName ?? 'I';
  return `${inviter} invited you to ${squad}. Accept with code ${input.code} for 50 coins and 2x XP on your first session. I get 100 coins when you finish that first session. ${input.link}`;
}
