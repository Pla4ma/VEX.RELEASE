import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { CardEnterAnimation } from '../../shared/ui/components/EnterAnimation';
import type { Theme } from '../../theme';
import { paywallStyles as styles } from './paywall-styles';

export function HeroShell({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}): React.ReactNode {
  return (
    <CardEnterAnimation>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.colors.semantic.obsidian,
            borderRadius: 24,
          },
        ]}
      >
        {children}
      </View>
    </CardEnterAnimation>
  );
}

export function StudyLaneHero({
  body,
  headline,
  theme,
}: {
  body: string;
  headline: string;
  theme: Theme;
}): React.ReactNode {
  return (
    <HeroShell theme={theme}>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent.editorial }]}>
            Study Lane
          </Text>
          <Text style={[styles.heroTitle, { color: theme.colors.text.inverse }]}>
            {headline}
          </Text>
          <Text style={[styles.heroCopy, { color: theme.colors.text.inverse }]}>
            {body}
          </Text>
        </View>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.colors.accent.editorial,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Icon name="book" size={28} color={theme.colors.semantic.obsidian} />
        </View>
      </View>
    </HeroShell>
  );
}

export function RunLaneHero({
  body,
  headline,
  theme,
}: {
  body: string;
  headline: string;
  theme: Theme;
}): React.ReactNode {
  return (
    <HeroShell theme={theme}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="flame" size={20} color={theme.colors.accent.rescue} />
          <Text style={[styles.eyebrow, { color: theme.colors.accent.rescue }]}>
            Run Lane
          </Text>
        </View>
        <Text
          style={[styles.heroTitle, { color: theme.colors.text.inverse, fontSize: 28 }]}
        >
          {headline}
        </Text>
        <View
          style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}
        >
          {['Personal boss depth', 'Weekly recaps', 'No shop power'].map((label) => (
            <View
              key={label}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.text.inverse,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text.inverse,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={[
            styles.heroCopy,
            { color: theme.colors.text.inverse, marginTop: 4 },
          ]}
        >
          {body}
        </Text>
      </View>
    </HeroShell>
  );
}
