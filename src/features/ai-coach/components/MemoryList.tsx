import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useTheme } from '../../../theme';
import { ErrorState } from '../../../components/states/ErrorState';
import { useCoachMemories } from '../hooks/useMemories';
import type { CoachMemory, MemoryType } from '../memory-schemas';

interface MemoryListProps {
  userId: string;
  type?: MemoryType;
  onStartSession?: () => void;
}

export function MemoryList({
  userId,
  type,
  onStartSession,
}: MemoryListProps): JSX.Element {
  const { theme } = useTheme();
  const { data, isPending, isError, error, refetch, isOffline } =
    useCoachMemories(userId, type);

  if (isPending) {
    return <MemoryListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Coach memory paused"
        description={
          error?.message ?? 'Your coach could not load its memory yet.'
        }
        onRetry={() => {
          refetch.call(undefined);
        }}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyMemoryState isOffline={isOffline} onStartSession={onStartSession} />
    );
  }

  return (
    <View>
      {isOffline && (
        <Text style={{ color: theme.colors.warning[500] }}>
          Coach memory is showing saved context until you reconnect.
        </Text>
      )}
      <FlashList
        data={data}
        renderItem={renderMemory}
        keyExtractor={keyMemory}
        estimatedItemSize={72}
      />
    </View>
  );
}

const renderMemory: ListRenderItem<CoachMemory> = ({ item }) => (
  <MemoryRow memory={item} />
);

function keyMemory(item: CoachMemory): string {
  return item.id;
}

function MemoryRow({ memory }: { memory: CoachMemory }): JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingVertical: theme.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.DEFAULT,
      }}
    >
      <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
        {memory.title}
      </Text>
      <Text style={{ color: theme.colors.text.secondary }}>
        {memory.description}
      </Text>
    </View>
  );
}

function MemoryListSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View accessibilityLabel="Coach memory loading">
      {[0, 1, 2].map((item) => (
        <View
          key={item}
          style={{
            minHeight: theme.spacing[12],
            marginBottom: theme.spacing[2],
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
          }}
        />
      ))}
    </View>
  );
}

function EmptyMemoryState({
  isOffline,
  onStartSession,
}: {
  isOffline: boolean;
  onStartSession?: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <View>
      <Text style={{ color: theme.colors.text.primary, fontWeight: '700' }}>
        {isOffline ? 'Coach memory is offline' : 'No coach memory yet'}
      </Text>
      <Text style={{ color: theme.colors.text.secondary }}>
        {isOffline
          ? 'Reconnect to refresh saved patterns.'
          : 'Finish a focus session and your coach will remember useful patterns.'}
      </Text>
      {onStartSession && (
        <Pressable
          onPress={onStartSession}
          accessibilityLabel="Start a focus session"
          accessibilityRole="button"
          accessibilityHint="Starts a session so coach memory can learn from real progress"
          style={{ minHeight: theme.spacing[12], justifyContent: 'center' }}
        >
          <Text style={{ color: theme.colors.primary[500], fontWeight: '600' }}>
            Start a session
          </Text>
        </Pressable>
      )}
    </View>
  );
}
