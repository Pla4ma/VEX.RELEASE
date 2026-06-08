import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { VexBrandPill } from '../../home/components/VexBrandPill';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { Icon } from '../../../icons';

interface ProgressHeaderProps {
  onOpenNotifications: () => void;
}

export function ProgressHeader({ onOpenNotifications }: ProgressHeaderProps): JSX.Element {
  return (
    <View style={{ width: '100%', marginBottom: 10 }}>
      {/* Water bubble at top of progress screen */}
      <View
        pointerEvents="none"
        style={{
          left: -20,
          opacity: 0.35,
          position: 'absolute',
          top: -30,
          zIndex: 0,
        }}
      >
        <WaterBubble opacity={0.45} size={100} />
      </View>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
          zIndex: 2,
        }}
      >
        <VexBrandPill />
        <Pressable
          accessibilityHint="Shows your VEX notifications"
          accessibilityLabel="Open notifications"
          accessibilityRole="button"
          onPress={onOpenNotifications}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.42)',
            borderColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 19,
            borderWidth: 1,
            height: 38,
            justifyContent: 'center',
            overflow: 'hidden',
            shadowColor: 'rgba(13, 76, 65, 0.16)',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            width: 38,
          }}
        >
          <Icon
            color="#0A1F1A"
            name="notification"
            size="sm"
            variant="outline"
          />
        </Pressable>
      </View>
      <View style={{ gap: 3, marginBottom: 6, zIndex: 2 }}>
        <Text
          style={{
            color: '#0A9B8A',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Progress
        </Text>
        <Text
          style={{
            color: '#0A1F1A',
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.6,
            lineHeight: 28,
          }}
        >
          Your focus record.
        </Text>
        <Text
          style={{
            color: '#3D5A52',
            fontSize: 13,
            lineHeight: 19,
            marginTop: 4,
            fontWeight: '400',
          }}
        >
          Focus sessions, study work, and coaching signals in one place.
        </Text>
      </View>
    </View>
  );
}

export default ProgressHeader;
