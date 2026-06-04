import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { type ProjectThread } from '../schemas';
import { lightColors } from '@/theme/tokens/colors';

export function Skeleton(): React.ReactElement {
  return (
    <View
      accessibilityLabel="Loading project card"
      style={{ padding: 16, borderRadius: 12, backgroundColor: lightColors.semantic.background }}
    >
      <View
        style={{
          height: 16,
          width: '60%',
          backgroundColor: lightColors.semantic.backgroundElevated,
          borderRadius: 8,
        }}
      />
      <View
        style={{
          height: 12,
          width: '80%',
          backgroundColor: lightColors.semantic.backgroundElevated,
          borderRadius: 6,
          marginTop: 8,
        }}
      />
      <View
        style={{
          height: 36,
          width: 120,
          backgroundColor: lightColors.semantic.backgroundElevated,
          borderRadius: 8,
          marginTop: 12,
        }}
      />
    </View>
  );
}

export function EmptyState({
  onPressCreate,
}: {
  onPressCreate: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel="Create a new project"
      accessibilityRole="button"
      accessibilityHint="Opens project creation flow"
      onPress={onPressCreate}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 12,
        backgroundColor: lightColors.semantic.background,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: lightColors.primary[50], fontSize: 16, fontWeight: '600' }}>
        Project Thread
      </Text>
      <Text style={{ color: lightColors.semantic.textLavender, fontSize: 13, marginTop: 4 }}>
        Track your creative or deep work project across sessions.
      </Text>
      <View
        style={{
          marginTop: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: lightColors.semantic.backgroundElevated,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: lightColors.accent.blue, fontSize: 14, fontWeight: '600' }}>
          Create project
        </Text>
      </View>
    </Pressable>
  );
}

export function ActiveCard({
  onPressResume,
  thread,
}: {
  onPressResume: () => void;
  thread: ProjectThread;
}): React.ReactElement {
  const isRescued = thread.state === 'rescued';
  const isStale = thread.state === 'stale';
  const isBlocked = thread.state === 'blocked';

  return (
    <Pressable
      accessibilityLabel={`Resume project: ${thread.projectTitle}`}
      accessibilityRole="button"
      accessibilityHint={
        isRescued
          ? 'Continue recovery session'
          : isStale
            ? 'Re-enter stale project'
            : 'Resume your project'
      }
      onPress={onPressResume}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 12,
        backgroundColor: isRescued
          ? lightColors.semantic.stateRescued
          : isStale
            ? lightColors.semantic.stateStale
            : lightColors.semantic.background,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{ color: lightColors.primary[50], fontSize: 16, fontWeight: '600' }}
          numberOfLines={1}
        >
          {thread.projectTitle}
        </Text>
        {isBlocked && (
          <View
            style={{
              paddingVertical: 2,
              paddingHorizontal: 8,
              borderRadius: 4,
              backgroundColor: lightColors.semantic.stateBlocked,
            }}
          >
            <Text style={{ color: lightColors.semantic.warning, fontSize: 11, fontWeight: '600' }}>
              Blocked
            </Text>
          </View>
        )}
      </View>

      {isRescued && (
        <Text style={{ color: lightColors.semantic.stateRescuedText, fontSize: 13, marginTop: 6 }}>
          Recovery session ready. Start small.
        </Text>
      )}
      {isStale && !isRescued && (
        <Text style={{ color: lightColors.semantic.warning, fontSize: 13, marginTop: 6 }}>
          Project is stale. Short review block recommended.
        </Text>
      )}

      <Text
        style={{ color: lightColors.text.disabled, fontSize: 13, marginTop: 6 }}
        numberOfLines={2}
      >
        {thread.nextMove}
      </Text>

      {thread.handoffNote ? (
        <Text
          style={{ color: lightColors.semantic.textSoftViolet, fontSize: 12, marginTop: 4 }}
          numberOfLines={2}
        >
          {thread.handoffNote}
        </Text>
      ) : null}

      <View
        style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: lightColors.semantic.backgroundElevated,
          }}
        >
          <Text style={{ color: lightColors.accent.blue, fontSize: 14, fontWeight: '600' }}>
            {isRescued
              ? 'Recover project'
              : isStale
                ? 'Re-enter project'
                : 'Resume project'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
