import { getSupabaseClient } from '../../../config/supabase';
import {
  SquadInviteSchema,
  type SquadInvite,
} from '../schemas';

const supabase = getSupabaseClient();

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(
      `Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`,
    );
    this.name = 'RepositoryError';
  }
}

export interface SquadMemberPresence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isFocusing: boolean;
  sessionId?: string;
  progressPercent: number;
  elapsedSeconds: number;
  sessionDuration: number;
  startedAt: number;
}

export async function fetchSquadMemberPresence(
  squadId: string,
  excludeUserId?: string,
): Promise<SquadMemberPresence[]> {
  const membersResult = await supabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('is_active', true);

  if (membersResult.error) {
    throw new RepositoryError(
      'fetchSquadMemberPresence.members',
      membersResult.error,
    );
  }

  const memberIds = (membersResult.data || [])
    .map((row: { user_id: string }) => row.user_id)
    .filter((id: string) => id !== excludeUserId);

  if (memberIds.length === 0) {
    return [];
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      id,
      user_id,
      status,
      elapsed_seconds,
      config,
      started_at,
      users:user_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .in('user_id', memberIds)
    .eq('status', 'ACTIVE');

  if (sessionError) {
    throw new RepositoryError(
      'fetchSquadMemberPresence.sessions',
      sessionError,
    );
  }

  return (sessionData || []).map((row: Record<string, unknown>) => {
    const config = row['config'] as Record<string, unknown> | undefined;
    const duration = (config?.['duration'] as number) || 1800;
    const elapsedSeconds = (row['elapsed_seconds'] as number) || 0;
    const progressPercent = Math.min(
      100,
      Math.round((elapsedSeconds / duration) * 100),
    );
    const users = row['users'] as Array<Record<string, unknown>> | undefined;
    const userInfo = users?.[0];

    return {
      userId: row['user_id'] as string,
      displayName: (userInfo?.['display_name'] as string) || 'Unknown',
      avatarUrl: userInfo?.['avatar_url'] as string | undefined,
      isFocusing: true,
      sessionId: row['id'] as string,
      progressPercent,
      elapsedSeconds,
      sessionDuration: duration,
      startedAt: new Date(row['started_at'] as string).getTime(),
    };
  });
}

export function subscribeToSquadPresence(
  squadId: string,
  callback: (members: SquadMemberPresence[]) => void,
  excludeUserId?: string,
) {
  return supabase
    .channel(`squad_presence:${squadId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
      },
      async () => {
        try {
          const members = await fetchSquadMemberPresence(
            squadId,
            excludeUserId,
          );
          callback(members);
        } catch (_err) {
          // Silently handle presence refresh errors
        }
      },
    );
}

export async function lookupInviteByJoinCode(
  joinCode: string,
): Promise<SquadInvite | null> {
  const { data, error } = await supabase
    .from('squad_invites')
    .select('*')
    .eq('join_code', joinCode)
    .eq('status', 'PENDING')
    .single<Record<string, unknown>>();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('lookupInviteByJoinCode', error);
  }

  const row = data as Record<string, unknown>;
  return SquadInviteSchema.parse({
    id: row['id'],
    squadId: row['squad_id'],
    invitedBy: row['invited_by'],
    invitedUserId: row['invited_user_id'],
    status: row['status'],
    roleOffered: row['role_offered'],
    message: row['message'],
    expiresAt: row['expires_at'],
    createdAt: row['created_at'],
    respondedAt: row['responded_at'],
  });
}

export async function createSquadJoinRequest(
  squadId: string,
  userId: string,
  message?: string,
): Promise<void> {
  const { error } = await supabase.from('squad_join_requests').insert({
    squad_id: squadId,
    user_id: userId,
    message: message || '',
    status: 'PENDING',
    created_at: Date.now(),
  });

  if (error) {
    throw new RepositoryError('createSquadJoinRequest', error);
  }
}

export async function createSquadSynergy(squadId: string): Promise<void> {
  const { error } = await supabase.from('squad_synergy').insert({
    squad_id: squadId,
    level: 1,
    current_points: 0,
    points_to_next_level: 100,
    focus_multiplier_bonus: 0,
    daily_points: 0,
    daily_points_cap: 100,
    last_reset_at: Date.now(),
  });
  if (error) {
    throw new RepositoryError('createSquadSynergy', error);
  }
}
