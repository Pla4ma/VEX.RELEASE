import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { Box } from '../../components/primitives/Box';
import { eventBus } from '../../events/EventBus';
import { SquadMemberIndicator } from './SquadMemberIndicator';
import {
  SquadEncouragementToastView,
  SquadCompletionToastView,
} from './SquadSyncToasts';
import {
  SquadSyncEmptyState,
  SquadSyncHeader,
  SquadSyncLoadingState,
} from './SquadSyncStates';
import type {
  SquadCompletionToast,
  SquadSyncIndicatorProps,
  SquadMemberSession,
} from './SquadSyncIndicator.types';

export type {
  SquadCompletionToast,
  SquadMemberSession,
  SquadSyncIndicatorProps,
} from './SquadSyncIndicator.types';

export function SquadSyncIndicator({
  members,
  isSquadMode,
  currentUserId,
  squadId,
  currentUserName,
  onMemberComplete,
  onEncourageMember,
  isLoading,
}: SquadSyncIndicatorProps): JSX.Element | null {
  const [completionToast, setCompletionToast] =
    React.useState<SquadCompletionToast | null>(null);
  const [encouragementToast, setEncouragementToast] = React.useState<
    string | null
  >(null);
  const toastCountRef = useRef(0);
  const maxToastsReachedRef = useRef(false);
  const squadCompletionsRef = useRef<Set<string>>(new Set());
  const encouragedMembersRef = useRef<Set<string>>(new Set());
  const otherMembers = useMemo(
    () => members.filter((member) => member.userId !== currentUserId),
    [members, currentUserId],
  );
  const focusingCount = useMemo(
    () => otherMembers.filter((member) => member.isFocusing).length,
    [otherMembers],
  );

  const handleSquadCompletion = useCallback(
    (memberName: string, durationMinutes: number) => {
      if (toastCountRef.current >= 3 || maxToastsReachedRef.current) {
        maxToastsReachedRef.current = true;
        return;
      }
      if (squadCompletionsRef.current.has(memberName)) {
        return;
      }
      squadCompletionsRef.current.add(memberName);
      toastCountRef.current += 1;
      setCompletionToast({
        memberName,
        durationMinutes,
        id: `${memberName}-${Date.now()}`,
      });
      onMemberComplete?.(memberName, memberName);
    },
    [onMemberComplete],
  );

  useEffect(() => {
    if (!squadId || !isSquadMode) {
      return undefined;
    }
    const unsubscribe = eventBus.subscribe(
      'squad:session_completed',
      (payload) => {
        if (payload.userId === currentUserId) {
          return;
        }
        const member = members.find((item) => item.userId === payload.userId);
        handleSquadCompletion(
          member?.displayName || 'Squadmate',
          Math.round(payload.duration / 60),
        );
      },
    );
    return unsubscribe;
  }, [squadId, isSquadMode, currentUserId, members, handleSquadCompletion]);

  const handleEncourageMember = useCallback(
    (memberId: string, memberName: string) => {
      if (encouragedMembersRef.current.has(memberId)) {
        return;
      }
      encouragedMembersRef.current.add(memberId);
      onEncourageMember?.(memberId, memberName);
      if (squadId && currentUserName) {
        eventBus.publish('squad:encouragement_sent', {
          squadId,
          fromUserId: currentUserId,
          fromUserName: currentUserName,
          toUserId: memberId,
          toUserName: memberName,
          timestamp: Date.now(),
        });
      }
    },
    [onEncourageMember, squadId, currentUserId, currentUserName],
  );

  useEffect(() => {
    if (!squadId || !isSquadMode) {
      return undefined;
    }
    const unsubscribe = eventBus.subscribe(
      'squad:encouragement_sent',
      (payload) => {
        if (payload.toUserId === currentUserId) {
          setEncouragementToast(
            `${payload.fromUserName} is cheering for you! 💪`,
          );
        }
      },
    );
    return unsubscribe;
  }, [squadId, isSquadMode, currentUserId]);

  useEffect(() => {
    if (!encouragementToast) {
      return undefined;
    }
    const timer = setTimeout(() => setEncouragementToast(null), 3000);
    return () => clearTimeout(timer);
  }, [encouragementToast]);

  if (!isSquadMode) {
    return null;
  }
  if (isLoading) {
    return <SquadSyncLoadingState />;
  }
  if (otherMembers.length === 0) {
    return <SquadSyncEmptyState />;
  }

  return (
    <Box>
      <SquadSyncHeader focusingCount={focusingCount} />
      <Box flexDirection="row" gap="sm" flexWrap="wrap">
        {otherMembers.map((member: SquadMemberSession) => (
          <SquadMemberIndicator
            key={member.userId}
            member={member}
            showCompletionToast={(name) => handleSquadCompletion(name, 0)}
            onEncourage={handleEncourageMember}
            hasBeenEncouraged={encouragedMembersRef.current.has(member.userId)}
          />
        ))}
      </Box>

      {completionToast && (
        <Box
          position="absolute"
          top={-50}
          left={0}
          right={0}
          alignItems="center"
        >
          <SquadCompletionToastView
            toast={completionToast}
            onDismiss={() => setCompletionToast(null)}
          />
        </Box>
      )}

      {encouragementToast && (
        <Box
          position="absolute"
          top={-80}
          left={0}
          right={0}
          alignItems="center"
        >
          <SquadEncouragementToastView message={encouragementToast} />
        </Box>
      )}
    </Box>
  );
}

export { SquadSyncIndicator }