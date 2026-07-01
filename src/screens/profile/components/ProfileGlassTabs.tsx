import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { NativeGlassSurface } from '../../../components/glass';
import { useTheme } from '../../../theme/ThemeContext';
import { glassHaptics } from '../../../shared/feedback/GlassHaptics';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export type ProfileTab = 'stats' | 'mastery' | 'activity';

interface ProfileGlassTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const tabs = [
  { key: 'stats' as const, label: 'Stats' },
  { key: 'mastery' as const, label: 'Mastery' },
  { key: 'activity' as const, label: 'Activity' },
];

const TAB_WIDTH = 92;
const TAB_GAP = 3;

export const ProfileGlassTabs: React.ComponentType<ProfileGlassTabsProps> = ({
  activeTab,
  onChange,
}) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const activeIndex = tabs.findIndex((t) => t.key === activeTab);
  const translateX = useSharedValue(activeIndex * (TAB_WIDTH + TAB_GAP));

  React.useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeTab);
    translateX.value = isReducedMotion
      ? idx * (TAB_WIDTH + TAB_GAP)
      : withSpring(idx * (TAB_WIDTH + TAB_GAP), { damping: 18, stiffness: 220 });
  }, [activeTab, isReducedMotion, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        height: 40,
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <NativeGlassSurface
        variant="nav"
        radius={18}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 40,
          padding: 3,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 3,
              left: 3,
              width: TAB_WIDTH,
              height: 34,
              borderRadius: 15,
            },
            indicatorStyle,
          ]}
        >
          <NativeGlassSurface
            variant="pill"
            radius={15}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
          />
        </Animated.View>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              accessibilityLabel={`${tab.key} tab`}
              accessibilityRole="tab"
              accessibilityHint={`Shows ${tab.key} content`}
              accessibilityState={{ selected: isActive }}
              key={tab.key}
              onPress={() => {
                if (tab.key !== activeTab) {
                  glassHaptics.selectedPill();
                  onChange(tab.key);
                }
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 34,
                zIndex: 1,
              }}
            >
              <Text
                style={{
                  color: isActive
                    ? theme.colors.primary[700]
                    : theme.colors.text.secondary,
                  fontSize: 12,
                  fontWeight: isActive ? '800' : '700',
                  letterSpacing: -0.2,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </NativeGlassSurface>
    </View>
  );
};
