export interface SquadMemberSession {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isFocusing: boolean;
  sessionStartedAt: number;
  elapsedSeconds: number;
}

export interface SquadSyncIndicatorProps {
  members: SquadMemberSession[];
  isSquadMode: boolean;
  currentUserId: string;
  squadId?: string;
  currentUserName?: string;
  onMemberComplete?: (memberId: string, memberName: string) => void;
  onEncourageMember?: (memberId: string, memberName: string) => void;
  isLoading?: boolean;
}

export interface SquadCompletionToast {
  memberName: string;
  durationMinutes: number;
  id: string;
}
