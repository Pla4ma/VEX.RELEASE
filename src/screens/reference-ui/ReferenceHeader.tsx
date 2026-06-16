import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../icons/components/Icon';
import { Text } from '../../components/primitives/Text';
import { GlassPill } from '../../components/glass/GlassPill';
import { ref, type } from './referenceTokens';

interface ReferenceHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
  mode?: string;
  onAction?: () => void;
}

          const elementStyle_42 = {
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.62)',
  borderColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 20,
  borderWidth: 1,
  height: 40,
  justifyContent: 'center',
  width: 40,
};
export function ReferenceHeader({
  eyebrow,
  title,
  body,
  mode,
  onAction,
}: ReferenceHeaderProps): React.ReactNode {
  return (
    <View style={{ marginBottom: 12, paddingTop: 2 }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Text style={{ color: ref.ink, fontSize: 24, fontWeight: '300', letterSpacing: 6 }}>
          VEX
        </Text>
        {mode ? <GlassPill label={mode} size="sm" variant="mint" /> : null}
        {onAction ? (
          <Pressable
            accessibilityHint="Opens screen action"
            accessibilityLabel="Open action"
            accessibilityRole="button"
            onPress={onAction}
            style={elementStyle_42}
          >
            <Icon color={ref.ink} name="notification" size="sm" />
          </Pressable>
        ) : null}
      </View>
      {eyebrow ? <Text style={[type.kicker, { marginBottom: 6 }]}>{eyebrow}</Text> : null}
      <Text style={type.hero}>{title}</Text>
      {body ? <Text style={[type.body, { marginTop: 6 }]}>{body}</Text> : null}
    </View>
  );
}
