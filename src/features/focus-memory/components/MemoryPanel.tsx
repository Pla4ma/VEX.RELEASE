import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { MemoryPanelProps } from '../memory-panel-types';

export function MemoryPanel({
  items,
  onHide,
  onAccept,
  isAccepting = false,
  isHiding = false,
}: MemoryPanelProps) {

  if (items.length === 0) {return null;}

  return (
    <GlassCard variant="subtle" style={{ marginHorizontal: 16, marginVertical: 8 }}>
      <View
        style={{
          padding: 16,
          borderBottomWidth: items.length > 0 ? 1 : 0,
          borderBottomColor: 'rgba(16, 35, 31, 0.08)',
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: vexLightGlass.text.primary,
          }}
          accessibilityRole="header"
        >
          What VEX learned
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: vexLightGlass.text.disabled,
            lineHeight: 16,
          }}
        >
          Based on your sessions. VEX may be wrong — you can hide anything that
          does not fit.
        </Text>
      </View>

      {items.map((item, index) => (
        <View
          key={item.id}
          style={{
            padding: 12,
            paddingLeft: 16,
            borderBottomWidth: index < items.length - 1 ? 1 : 0,
            borderBottomColor: 'rgba(16, 35, 31, 0.08)',
            gap: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: vexLightGlass.text.primary,
                flex: 1,
              }}
              accessibilityRole="text"
            >
              {item.observation}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                color:
                  item.confidence >= 0.7
                    ? vexLightGlass.semantic.success
                    : vexLightGlass.semantic.warning,
              }}
            >
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: vexLightGlass.text.disabled,
              }}
            >
              Source: {item.evidence}
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: vexLightGlass.text.disabled,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: vexLightGlass.text.disabled,
              }}
            >
              {item.type.replace(/_/g, ' ')}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 4,
            }}
          >
            {!item.isHidden && (
              <>
                <Pressable
                  onPress={() => onHide(item.id)}
                  disabled={isHiding}
                  accessibilityRole="button"
                  accessibilityLabel={`Hide "${item.observation}" from memory`}
                  accessibilityHint="Removes this observation. VEX will not use it again."
                  style={({ pressed }) => ({
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    opacity: pressed ? 0.6 : 1,
                    minHeight: 44,
                    justifyContent: 'center' as const,
                  })}
                >
                  <Text
                    style={{ fontSize: 12, color: vexLightGlass.text.disabled }}
                  >
                    Hide
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onAccept(item.id)}
                  disabled={isAccepting}
                  accessibilityRole="button"
                  accessibilityLabel={`Confirm "${item.observation}" is accurate`}
                  accessibilityHint="Marks this observation as confirmed by you."
                  style={({ pressed }) => ({
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    opacity: pressed ? 0.6 : 1,
                    minHeight: 44,
                    justifyContent: 'center' as const,
                  })}
                >
                  <Text
                    style={{ fontSize: 12, color: vexLightGlass.mint[500] }}
                  >
                    Accept
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ))}
    </GlassCard>
  );
}
