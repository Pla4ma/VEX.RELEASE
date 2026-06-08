import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';

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
  return (
      <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.42)',
        borderColor: 'rgba(255, 255, 255, 0.88)',
        borderRadius: 18,
        borderWidth: 1.5,
        flexDirection: 'row',
        height: 40,
        padding: 3,
        shadowColor: 'rgba(13, 76, 65, 0.16)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.85,
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
              backgroundColor: isActive ? 'rgba(66, 207, 174, 0.22)' : 'transparent',
              borderColor: isActive ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
              borderRadius: 14,
              borderWidth: isActive ? 1.2 : 0,
              flex: 1,
              height: 34,
              justifyContent: 'center',
              shadowColor: isActive ? 'rgba(18, 184, 148, 0.28)' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.38 : 0,
              shadowRadius: isActive ? 10 : 0,
            }}
          >
            <Text
              style={{
                color: isActive ? '#0C765F' : '#3D5A52',
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
