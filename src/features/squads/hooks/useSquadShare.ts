/**
 * useSquadShare Hook
 * Provides squad share functionality with deep link generation.
 */

import { useCallback } from 'react';
import { useAuthStore } from '../../../store';
import { buildSquadCode, buildSquadShareMessage, parseSquadCodeFromUrl } from '../share';

export function useSquadShare(squad: { id: string; name: string; focusHours: number } | null) {
  const userId = useAuthStore((state) => state.user?.id);

  const generateShareUrl = useCallback((): string | null => {
    if (!squad || !userId) return null;
    const squadCode = buildSquadCode(squad.id);
    return `https://vex.app/squad/${squadCode}`;
  }, [squad, userId]);

  const generateShareMessage = useCallback((): string | null => {
    if (!squad || !userId) return null;
    const squadCode = buildSquadCode(squad.id);
    return buildSquadShareMessage({ name: squad.name, focusHours: squad.focusHours }, squadCode);
  }, [squad, userId]);

  const parseInviteUrl = useCallback(
    (url: string): string | null => {
      return parseSquadCodeFromUrl(url);
    },
    [],
  );

  return {
    generateShareUrl,
    generateShareMessage,
    parseInviteUrl,
    squadCode: squad ? buildSquadCode(squad.id) : null,
  };
}