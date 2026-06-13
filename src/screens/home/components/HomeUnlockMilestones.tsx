import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '../../../components/glass/GlassCard';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing, borderRadius } from '../../../theme/tokens';
import { triggerHaptic } from '../../../utils/haptics';
import type {
  HomeUnlockPathItem,
  HomeUnlockPathModel,
} from '../services/home-unlock-path-schemas';

type MilestoneState = 'unlocked' | 'current' | 'locked';

const ASSET_FOR_INDEX: Array<React.ComponentProps<typeof VexAssetImage>['name']> =
  ['orangeAnalytics', 'orangeHumanCoach', 'progressBars', 'orangeMastery'];

function stateFor(item: HomeUnlockPathItem, isNext: boolean): MilestoneState {
  if (item.isUnlocked) return 'unlocked';
  if (isNext) return 'current';
  return 'locked';
}

function MilestoneNode({ state }: { state: MilestoneState }): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state !== 'current' || isReducedMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.18, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => {
      pulse.value = 1;
    };
  }, [state, isReducedMotion, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const backgroundColor =
    state === 'unlocked'
      ? vexLightGlass.mint[700]
      : state === 'current'
        ? vexLightGlass.semantic.fire
        : vexLightGlass.glass.borderSubtle;
  const iconColor =
    state === 'locked'
      ? vexLightGlass.text.disabled
      : vexLightGlass.text.inverse;

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          backgroundColor,
          borderRadius: borderRadius.full,
          height: 28,
          justifyContent: 'center',
          shadowColor: backgroundColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: state === 'current' ? 0.5 : 0.28,
          shadowRadius: state === 'current' ? 12 : 7,
          width: 28,
        },
        animatedStyle,
      ]}
    >
      <Icon
        color={iconColor}
        name={state === 'unlocked' ? 'check' : 'lock'}
        size="xs"
      />
    </Animated.View>
  );
}

function MilestoneProgress({
  item,
  state,
}: {
  item: HomeUnlockPathItem;
  state: MilestoneState;
}): JSX.Element | null {
  if (state === 'unlocked') {
    return (
      <Text
        style={{
          color: vexLightGlass.mint[800],
          fontSize: 11,
          fontWeight: '800',
          marginTop: spacing[2],
        }}
      >
        Unlocked
      </Text>
    );
  }
  const progress = Math.min(1, item.current / item.requirement);
  return (
    <View style={{ marginTop: spacing[2] }}>
      <View
        style={{
          backgroundColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.full,
          height: 5,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            backgroundColor:
              state === 'current'
                ? vexLightGlass.semantic.fire
                : vexLightGlass.mint[700],
            borderRadius: borderRadius.full,
            height: '100%',
            opacity: state === 'locked' ? 0.35 : 1,
            width: `${progress * 100}%`,
          }}
        />
      </View>
      <Text
        style={{
          color:
            state === 'current'
              ? vexLightGlass.semantic.fireDeep
              : vexLightGlass.text.tertiary,
          fontSize: 10,
          fontWeight: '800',
          marginTop: spacing[1],
        }}
      >
        {item.current}/{item.requirement} sessions
      </Text>
    </View>
  );
}

function MilestoneCard({
  item,
  isNext,
  onPress,
}: {
  item: HomeUnlockPathItem;
  isNext: boolean;
  onPress?: () => void;
}): JSX.Element {
  const state = stateFor(item, isNext);
  const variant = state === 'unlocked' ? 'success' : state === 'current' ? 'warning' : 'subtle';
  const badgeText = state === 'unlocked' ? 'OPEN' : state === 'current' ? 'NEXT' : 'LOCKED';
  const badgeColor =
    state === 'unlocked'
      ? vexLightGlass.mint[700]
      : state === 'current'
        ? vexLightGlass.semantic.fireDeep
        : vexLightGlass.text.disabled;

  const content = (
    <GlassCard variant={variant} padding={14} radius={borderRadius.lg}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: spacing[1],
        }}
      >
        <Text
          style={{
            color: vexLightGlass.mint[800],
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.5,
          }}
        >
          {item.eyebrow}
        </Text>
        <View
          style={{
            backgroundColor: vexLightGlass.glass.fillSubtle,
            borderColor: vexLightGlass.glass.border,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            paddingHorizontal: spacing[2],
            paddingVertical: 2,
          }}
        >
          <Text
            style={{ color: badgeColor, fontSize: 9, fontWeight: '900' }}
          >
            {badgeText}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 16,
          fontWeight: '800',
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          lineHeight: 17,
          marginTop: spacing[1],
        }}
      >
        {item.body}
      </Text>
      <MilestoneProgress item={item} state={state} />
    </GlassCard>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityHint={
        state === 'locked'
          ? `Peek ${item.reward}. Finish more sessions to unlock.`
          : `Start a session to unlock ${item.reward}`
      }
      accessibilityLabel={item.title}
      accessibilityRole="button"
      onPress={(): void => {
        triggerHaptic('impactLight');
        onPress();
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {content}
    </Pressable>
  );
}

interface HomeUnlockMilestonesProps {
  model: HomeUnlockPathModel;
  onStartSession: () => void;
  onPeekLocked?: (item: HomeUnlockPathItem) => void;
}

export function HomeUnlockMilestones({
  model,
  onStartSession,
  onPeekLocked,
}: HomeUnlockMilestonesProps): JSX.Element {
  return (
    <View style={{ gap: spacing[3] }}>
      {model.items.map((item, index) => {
        const isNext = item.eyebrow === model.nextItem.eyebrow;
        const state = stateFor(item, isNext);
        const isLast = index === model.items.length - 1;
        const lineColor =
          state === 'locked' || (!item.isUnlocked && !isNext)
            ? vexLightGlass.glass.borderSubtle
            : vexLightGlass.mint[400];

        return (
          <View
            key={item.eyebrow}
            style={{ flexDirection: 'row', gap: spacing[3] }}
          >
            <View
              style={{
                alignItems: 'center',
                paddingTop: spacing[1],
                width: 44,
              }}
            >
              {index > 0 ? (
                <View
                  style={{
                    backgroundColor: lineColor,
                    height: spacing[2],
                    opacity: 0.55,
                    position: 'absolute',
                    top: -spacing[2],
                    width: 2,
                  }}
                />
              ) : null}
              <MilestoneNode state={state} />
              {!isLast ? (
                <View
                  style={{
                    backgroundColor: lineColor,
                    flex: 1,
                    marginTop: spacing[1],
                    opacity: 0.55,
                    width: 2,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <MilestoneCard
                item={item}
                isNext={isNext}
                onPress={
                  state === 'locked'
                    ? () => onPeekLocked?.(item)
                    : state === 'current'
                      ? onStartSession
                      : undefined
                }
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
