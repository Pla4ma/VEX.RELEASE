import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { PlanItem } from '../../../features/plan/types';
import { getPriorityColor } from '../../../features/plan/service';

interface PlanTodayItemRowProps {
  item: PlanItem;
  index: number;
  onCompleteItem: (itemId: string) => void;
  onStartSession: (itemId: string, title: string) => void;
}

export function PlanTodayItemRow({
  item,
  index,
  onCompleteItem,
  onStartSession,
}: PlanTodayItemRowProps): React.ReactNode {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60)}
    >
      <Pressable
        accessibilityHint="Starts a focus session from this task"
        accessibilityLabel={`Start ${item.title}`}
        accessibilityRole="button"
        onPress={() => onStartSession(item.id, item.title)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <GlassCard glowMint padding={16} radius={22} variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable
              accessibilityHint="Marks this task complete"
              accessibilityLabel={`Complete ${item.title}`}
              accessibilityRole="button"
              accessibilityState={{ checked: item.status === 'done' }}
              onPress={() => onCompleteItem(item.id)}
              style={{}}
            >
              {item.status === 'done' ? (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: vexLightGlass.mint[500],
                    borderRadius: 999,
                    height: 26,
                    justifyContent: 'center',
                    width: 26,
                  }}
                >
                  <Icon
                    color={vexLightGlass.text.inverse}
                    name="check"
                    size="sm"
                    variant="solid"
                  />
                </View>
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 999,
                    borderWidth: 1.2,
                    height: 26,
                    justifyContent: 'center',
                    width: 26,
                  }}
                />
              )}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 16,
                  fontWeight: '700',
                  letterSpacing: -0.2,
                  textDecorationLine: item.status === 'done' ? 'line-through' : 'none',
                  opacity: item.status === 'done' ? 0.55 : 1,
                }}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text
                  style={{
                    color: vexLightGlass.text.secondary,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  {item.description}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <View
                  style={{
                    backgroundColor: getPriorityColor(item.priority) + '20',
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: getPriorityColor(item.priority),
                      fontSize: 12,
                      fontWeight: '700',
                      letterSpacing: 0.3,
                    }}
                  >
                    {item.priority}
                  </Text>
                </View>
                {item.estimatedMinutes ? (
                  <Text
                    style={{
                      color: vexLightGlass.text.tertiary,
                      fontSize: 12,
                      fontWeight: '600',
                      letterSpacing: 0.3,
                    }}
                  >
                    {item.estimatedMinutes} min
                  </Text>
                ) : null}
              </View>
            </View>

            <Icon
              color={vexLightGlass.mint[600]}
              name="play-circle"
              size="lg"
              variant="solid"
            />
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}
