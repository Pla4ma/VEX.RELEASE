import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
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
        boxShadow: '0px 5px 8px theme.colors.text.primary / 0.12',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            accessibilityLabel={`${tab.key} tab`}
            accessibilityRole="tab"
            accessibilityHint={`Shows ${tab.key} content`}
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{}}
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
