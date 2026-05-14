/**
 * SquadSyncIndicator Component
 *
 * Shows squad members focusing right now in their own sessions during squad mode.
 * Real-time sync via Supabase subscription.
 *
 * @phase 1C.6
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Image, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { eventBus } from '../../events';

export interface SquadMemberSession {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isFocusing: boolean;
  sessionStartedAt: number;
  elapsedSeconds: number;
}

export interface SquadSyncIndicatorProps {
  /** Squad members with session status */
  members: SquadMemberSession[];
  /** Whether this is a squad session */
  isSquadMode: boolean;
  /** Current user ID to exclude from list */
  currentUserId: string;
  /** Squad ID for EventBus subscriptions */
  squadId?: string;
  /** Current user name for encouragement messages */
  currentUserName?: string;
  /** Callback when member completes session */
  onMemberComplete?: (memberId: string, memberName: string) => void;
  /** Callback when encouraging a squadmate */
  onEncourageMember?: (memberId: string, memberName: string) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Individual member indicator with encourage action
 */
function MemberIndicator({
  member,
  showCompletionToast,
  onEncourage,
  hasBeenEncouraged,
}: {
  member: SquadMemberSession;
  showCompletionToast: (name: string) => void;
  onEncourage?: (memberId: string, memberName: string) => void;
  hasBeenEncouraged?: boolean;
}): JSX.Element {
  const { theme } = useTheme();
  const pulseValue = useSharedValue(1);
  const [showEncourageAction, setShowEncourageAction] = React.useState(false);

  // Pulse animation for focusing members
  useEffect(() => {
    if (member.isFocusing) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(1.1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseValue.value = withSpring(1);
    }
  }, [member.isFocusing, pulseValue]);

  // Watch for completion
  useEffect(() => {
    if (!member.isFocusing) {
      showCompletionToast(member.displayName);
    }
  }, [member.isFocusing, member.displayName, showCompletionToast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle tap on focusing member to show encourage action
  const handlePress = () => {
    if (member.isFocusing && onEncourage && !hasBeenEncouraged) {
      setShowEncourageAction(true);
    }
  };

  // Handle encourage action
  const handleEncourage = () => {
    onEncourage?.(member.userId, member.displayName);
    setShowEncourageAction(false);
  };

  // Cancel encourage action
  const handleCancel = () => {
    setShowEncourageAction(false);
  };

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={animatedStyle}>
      <Pressable onPress={handlePress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          flexDirection="row"
          alignItems="center"
          gap="sm"
          px="md"
          py="sm"
          borderRadius="xl"
          bg={`${theme.colors.background.elevated}80`}
          borderWidth={1}
          borderColor={member.isFocusing ? theme.colors.success.DEFAULT : theme.colors.border.DEFAULT}
        >
          {/* Avatar */}
          <Box
            width={32}
            height={32}
            borderRadius="full"
            bg={member.avatarUrl ? undefined : theme.colors.background.tertiary}
            borderWidth={2}
            borderColor={member.isFocusing ? theme.colors.success.DEFAULT : theme.colors.border.DEFAULT}
            overflow="hidden"
          >
            {member.avatarUrl ? (
              <Image source={{ uri: member.avatarUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Text fontSize={14}>👤</Text>
              </Box>
            )}
          </Box>

          {/* Info */}
          <Box>
            <Text variant="bodySmall" color="text.primary" fontWeight="500">
              {member.displayName}
            </Text>
            <Text
              variant="caption"
              color={member.isFocusing ? theme.colors.success.DEFAULT : 'text.tertiary'}
            >
              {member.isFocusing
                ? `🔥 ${formatDuration(member.elapsedSeconds)}`
                : '✓ Completed'}
            </Text>
          </Box>

          {/* Encouragement indicator */}
          {hasBeenEncouraged && (
            <Box
              px="xs"
              py="xs"
              borderRadius="full"
              bg={`${theme.colors.primary[500]}20`}
            >
              <Text fontSize={12}>💪</Text>
            </Box>
          )}
        </Box>
      </Pressable>

      {/* Encourage action sheet */}
      {showEncourageAction && (
        <Animated.View entering={FadeInUp.duration(200)} style={{ marginTop: 8 }}>
          <Box
            flexDirection="row"
            alignItems="center"
            gap="sm"
            px="sm"
            py="xs"
            borderRadius="lg"
            bg={`${theme.colors.primary[500]}15`}
          >
            <Pressable onPress={handleEncourage}
  accessibilityLabel="💪 Encourage button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <Box
                px="md"
                py="sm"
                borderRadius="md"
                bg="primary.500"
              >
                <Text variant="caption" color="text.inverse" fontWeight="600">
                  💪 Encourage {member.displayName}
                </Text>
              </Box>
            </Pressable>
            <Pressable onPress={handleCancel}
  accessibilityLabel="Cancel button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              <Box px="sm" py="sm">
                <Text variant="caption" color="text.tertiary">
                  Cancel
                </Text>
              </Box>
            </Pressable>
          </Box>
        </Animated.View>
      )}
    </Animated.View>
  );
}

/**
 * Completion toast notification with duration info
 */
function CompletionToast({
  toast,
  onDismiss,
}: {
  toast: SquadCompletionToast;
  onDismiss: () => void;
}): JSX.Element {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const durationText = toast.durationMinutes > 0 ? `${toast.durationMinutes}-min` : '';
  const message = durationText
    ? `${toast.memberName} just finished a ${durationText} session! 💪`
    : `${toast.memberName} completed their session! 💪`;

  return (
    <Animated.View entering={FadeInUp.duration(400)} exiting={FadeOut.duration(300)}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        px="md"
        py="sm"
        borderRadius="xl"
        bg={`${theme.colors.success[500]}20`}
        borderWidth={1}
        borderColor={theme.colors.success.DEFAULT}
      >
        <Text fontSize={16}>✓</Text>
        <Text variant="bodySmall" color={theme.colors.success.DEFAULT} fontWeight="600">
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Squad completion toast with duration info
 */
interface SquadCompletionToast {
  memberName: string;
  durationMinutes: number;
  id: string;
}

/**
 * Main squad sync indicator
 */
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
  const { theme } = useTheme();
  const [completionToast, setCompletionToast] = React.useState<SquadCompletionToast | null>(null);
  const [encouragementToast, setEncouragementToast] = React.useState<string | null>(null);
  const toastCountRef = useRef(0);
  const maxToastsReachedRef = useRef(false);
  const squadCompletionsRef = useRef<Set<string>>(new Set());
  const encouragedMembersRef = useRef<Set<string>>(new Set());

  // Filter out current user
  const otherMembers = members.filter((m) => m.userId !== currentUserId);

  // Count focusing members
  const focusingCount = otherMembers.filter((m) => m.isFocusing).length;

  // Handle squad completion with rate limiting (max 3 toasts per session)
  const handleSquadCompletion = useCallback((memberName: string, durationMinutes: number) => {
    // Rate limiting: max 3 toasts per session
    if (toastCountRef.current >= 3 || maxToastsReachedRef.current) {
      maxToastsReachedRef.current = true;
      return;
    }

    // Deduplicate: don't show same member twice
    if (squadCompletionsRef.current.has(memberName)) {
      return;
    }

    squadCompletionsRef.current.add(memberName);
    toastCountRef.current += 1;

    const toast: SquadCompletionToast = {
      memberName,
      durationMinutes,
      id: `${memberName}-${Date.now()}`,
    };

    setCompletionToast(toast);
    onMemberComplete?.(memberName, memberName);
  }, [onMemberComplete]);

  // Subscribe to squad:session_completed events via EventBus
  useEffect(() => {
    if (!squadId || !isSquadMode) {return;}

    const unsubscribe = eventBus.subscribe(
      'squad:session_completed',
      (payload) => {
        if (payload.userId === currentUserId) {return;} // Skip self

        // Find member name from our members list
        const member = members.find((m) => m.userId === payload.userId);
        const memberName = member?.displayName || 'Squadmate';
        const durationMinutes = Math.round(payload.duration / 60);

        handleSquadCompletion(memberName, durationMinutes);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [squadId, isSquadMode, currentUserId, members, handleSquadCompletion]);

  // Legacy handler for member completion detection
  const handleMemberComplete = (name: string) => {
    handleSquadCompletion(name, 0);
  };

  // Handle encouraging a squadmate (1 per session per squadmate)
  const handleEncourageMember = useCallback((memberId: string, memberName: string) => {
    // Check if already encouraged this member this session
    if (encouragedMembersRef.current.has(memberId)) {
      return;
    }

    encouragedMembersRef.current.add(memberId);

    // Trigger callback
    onEncourageMember?.(memberId, memberName);

    // Publish event for real-time notification
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
  }, [onEncourageMember, squadId, currentUserId, currentUserName]);

  // Subscribe to received encouragements via EventBus
  useEffect(() => {
    if (!squadId || !isSquadMode) {return;}

    const unsubscribe = eventBus.subscribe(
      'squad:encouragement_sent',
      (payload) => {
        // Only show if we're the recipient
        if (payload.toUserId === currentUserId) {
          setEncouragementToast(`${payload.fromUserName} is cheering for you! 💪`);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [squadId, isSquadMode, currentUserId]);

  // Clear encouragement toast after 3 seconds
  useEffect(() => {
    if (encouragementToast) {
      const timer = setTimeout(() => setEncouragementToast(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [encouragementToast]);

  // Don't render if not squad mode
  if (!isSquadMode) {
    return null;
  }

  if (isLoading) {
    return (
      <Box flexDirection="row" gap="sm">
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            width={100}
            height={40}
            borderRadius="xl"
            bg={theme.colors.background.tertiary}
          />
        ))}
      </Box>
    );
  }

  if (otherMembers.length === 0) {
    return (
      <Box
        px="md"
        py="sm"
        borderRadius="xl"
        bg={`${theme.colors.background.elevated}80`}
        borderWidth={1}
        borderColor={theme.colors.border.DEFAULT}
      >
        <Text variant="caption" color="text.tertiary">
          No squad members currently focusing
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
        <Text fontSize={16}>🛡️</Text>
        <Text variant="label" color="text.secondary">
          SQUAD SYNC
        </Text>
        {focusingCount > 0 && (
          <Box
            px="sm"
            py="xs"
            borderRadius="full"
            bg={`${theme.colors.success[500]}20`}
          >
            <Text
              variant="caption"
              color={theme.colors.success.DEFAULT}
              fontWeight="700"
              fontSize={10}
            >
              {focusingCount} focusing
            </Text>
          </Box>
        )}
      </Box>

      {/* Members */}
      <Box flexDirection="row" gap="sm" flexWrap="wrap">
        {otherMembers.map((member) => (
          <MemberIndicator
            key={member.userId}
            member={member}
            showCompletionToast={handleMemberComplete}
            onEncourage={handleEncourageMember}
            hasBeenEncouraged={encouragedMembersRef.current.has(member.userId)}
          />
        ))}
      </Box>

      {/* Completion Toast */}
      {completionToast && (
        <Box position="absolute" top={-50} left={0} right={0} alignItems="center">
          <CompletionToast
            toast={completionToast}
            onDismiss={() => setCompletionToast(null)}
          />
        </Box>
      )}

      {/* Received Encouragement Toast */}
      {encouragementToast && (
        <Box position="absolute" top={-80} left={0} right={0} alignItems="center">
          <Animated.View entering={FadeInUp.duration(400)} exiting={FadeOut.duration(300)}>
            <Box
              flexDirection="row"
              alignItems="center"
              gap="sm"
              px="md"
              py="sm"
              borderRadius="xl"
              bg={`${theme.colors.primary[500]}20`}
              borderWidth={1}
              borderColor={theme.colors.primary[500]}
            >
              <Text fontSize={16}>💪</Text>
              <Text variant="bodySmall" color={theme.colors.primary[500]} fontWeight="600">
                {encouragementToast}
              </Text>
            </Box>
          </Animated.View>
        </Box>
      )}
    </Box>
  );
}

export default SquadSyncIndicator;
