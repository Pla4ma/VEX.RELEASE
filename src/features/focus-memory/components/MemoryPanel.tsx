import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import type { MemoryPanelItem } from "../memory-panel-types";

interface MemoryPanelProps {
  items: MemoryPanelItem[];
  onHide: (id: string) => void;
  onAccept: (id: string) => void;
  isAccepting?: boolean;
  isHiding?: boolean;
}

export function MemoryPanel({
  items,
  onHide,
  onAccept,
  isAccepting = false,
  isHiding = false,
}: MemoryPanelProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  if (items.length === 0) return null;

  return (
    <View
      style={{
        marginHorizontal: theme.spacing[4],
        marginVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.lg,
        backgroundColor: colors.semantic.surface,
        borderWidth: 1,
        borderColor: colors.border.light,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          padding: theme.spacing[4],
          borderBottomWidth: items.length > 0 ? 1 : 0,
          borderBottomColor: colors.border.light,
          gap: theme.spacing[1],
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text.primary,
          }}
          accessibilityRole="header"
        >
          What VEX learned
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.text.muted,
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
            padding: theme.spacing[3],
            paddingLeft: theme.spacing[4],
            borderBottomWidth: index < items.length - 1 ? 1 : 0,
            borderBottomColor: colors.border.light,
            gap: theme.spacing[1],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text.primary,
                flex: 1,
              }}
              accessibilityRole="text"
            >
              {item.observation}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color:
                  item.confidence >= 0.7
                    ? colors.semantic.success
                    : colors.semantic.warning,
              }}
            >
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing[1],
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.text.muted,
              }}
            >
              Source: {item.evidence}
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.text.muted,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: colors.text.muted,
              }}
            >
              {item.type.replace(/_/g, " ")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing[3],
              marginTop: theme.spacing[1],
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
                    paddingVertical: theme.spacing[2],
                    paddingHorizontal: theme.spacing[3],
                    borderRadius: theme.borderRadius.sm,
                    opacity: pressed ? 0.6 : 1,
                    minHeight: 44,
                    justifyContent: "center" as const,
                  })}
                >
                  <Text
                    style={{ fontSize: 12, color: colors.semantic.textMuted }}
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
                    paddingVertical: theme.spacing[2],
                    paddingHorizontal: theme.spacing[3],
                    borderRadius: theme.borderRadius.sm,
                    opacity: pressed ? 0.6 : 1,
                    minHeight: 44,
                    justifyContent: "center" as const,
                  })}
                >
                  <Text
                    style={{ fontSize: 12, color: colors.semantic.primary }}
                  >
                    Accept
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
