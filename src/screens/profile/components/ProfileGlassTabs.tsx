import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export type ProfileTab = 'stats' | 'achievements' | 'activity';

interface ProfileGlassTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const PROFILE_TABS: readonly ProfileTab[] = ['stats', 'achievements', 'activity'];

function tabLabel(tab: ProfileTab): string {
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}

export function ProfileGlassTabs({
  activeTab,
  onChange,
}: ProfileGlassTabsProps): JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.36)',
        borderColor: 'rgba(255, 255, 255, 0.90)',
        borderRadius: 999,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 4,
        height: 36,
        overflow: 'hidden',
        padding: 3,
      }}
    >
      {PROFILE_TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            accessibilityHint={`Switches the profile view to ${tab}`}
            accessibilityLabel={`Show ${tab} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab}
            onPress={() => onChange(tab)}
            style={{
              alignItems: 'center',
              backgroundColor: isActive ? vexLightGlass.mint[500] : 'transparent',
              borderColor: isActive ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
              borderRadius: 999,
              borderWidth: isActive ? 1 : 0,
              flex: 1,
              height: 30,
              justifyContent: 'center',
              shadowColor: isActive ? '#0C765F' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.25 : 0,
              shadowRadius: 10,
            }}
          >
            <Text
              style={{
                color: isActive
                  ? vexLightGlass.text.inverse
                  : vexLightGlass.text.secondary,
                fontSize: 12,
                fontWeight: isActive ? '800' : '600',
              }}
            >
              {tabLabel(tab)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default ProfileGlassTabs;
