import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { glassHaptics } from '../../../shared/feedback/GlassHaptics';


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

export const ProfileGlassTabs: React.ComponentType<ProfileGlassTabsProps> = ({
  activeTab,
  onChange,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        borderBottomColor: theme.colors.primary[800],
        borderBottomWidth: 1,
        flexDirection: 'row',
        height: 48,
        overflow: 'hidden',
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
            onPress={() => {
              if (tab.key !== activeTab) {
                glassHaptics.selectedPill();
                onChange(tab.key);
              }
            }}
            style={{
              alignItems: 'center',
              backgroundColor: isActive ? theme.colors.primary[100] : 'transparent',
              borderRadius: isActive ? theme.borderRadius.md : 0,
              flex: 1,
              margin: theme.spacing[1],
              justifyContent: 'center',
              minHeight: theme.spacing[10],
            }}
          >
            <Text
              style={{
                color: isActive ? theme.colors.semantic.primary : theme.colors.text.secondary,
                fontWeight: isActive ? '800' : '700',
              }}
              variant="label"
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
