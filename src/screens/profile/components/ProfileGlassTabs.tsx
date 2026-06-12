import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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

export const ProfileGlassTabs: React.FC<ProfileGlassTabsProps> = ({
  activeTab,
  onChange,
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.semantic.surfaceGlass,
        borderColor: theme.colors.border.strong,
        borderRadius: 18,
        borderWidth: 1.5,
        flexDirection: 'row',
        height: 40,
        padding: 3,
        shadowColor: theme.colors.text.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              alignItems: 'center',
              backgroundColor: isActive
                ? theme.colors.primary[100]
                : 'transparent',
              borderColor: isActive
                ? theme.colors.border.light
                : 'transparent',
              borderRadius: 14,
              borderWidth: isActive ? 1.2 : 0,
              flex: 1,
              height: 34,
              justifyContent: 'center',
              shadowColor: isActive
                ? theme.colors.primary[500]
                : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.2 : 0,
              shadowRadius: isActive ? 10 : 0,
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
    </View>
  );
};

export default ProfileGlassTabs;
