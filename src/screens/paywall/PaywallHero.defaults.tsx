import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../components/primitives/Text';
import { CardEnterAnimation } from '../../shared/ui/components/EnterAnimation';
import type { Theme } from '../../theme';
import { paywallStyles as styles } from './paywall-styles';

export function ProjectLaneHero({
  body,
  headline,
  theme,
}: {
  body: string;
  headline: string;
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
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View
            style={{
              width: 4,
              borderRadius: 4,
              backgroundColor: theme.colors.accent.premium,
            }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={[styles.eyebrow, { color: theme.colors.accent.premium }]}>
              Project Lane
            </Text>
            <Text style={[styles.heroTitle, { color: theme.colors.text.inverse }]}>
              {headline}
            </Text>
            <View
              style={{ flexDirection: 'row', gap: 12, marginTop: 4, flexWrap: 'wrap' }}
            >
              <View style={{ flex: 1, minWidth: 140, gap: 4 }}>
                <Text
                  style={{
                    color: theme.colors.text.inverse,
                    fontSize: 13,
                    fontWeight: '700',
                  }}
                >
                  Long memory
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.inverse,
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  Across project sessions
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 140, gap: 4 }}>
                <Text
                  style={{
                    color: theme.colors.text.inverse,
                    fontSize: 13,
                    fontWeight: '700',
                  }}
                >
                  Flow windows
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.inverse,
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  For creative continuity
                </Text>
              </View>
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
        </View>
      </View>
    </CardEnterAnimation>
  );
}

export function CleanLaneHero({
  body,
  headline,
  theme,
}: {
  body: string;
  headline: string;
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
        <View style={{ gap: 12, alignItems: 'flex-start' }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.accent.settled,
              marginBottom: 2,
            }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={[styles.eyebrow, { color: theme.colors.accent.settled }]}>
            Clean Lane
          </Text>
          <Text
            style={[
              styles.heroTitle,
              { color: theme.colors.text.inverse, fontSize: 22, lineHeight: 30 },
            ]}
          >
            {headline}
          </Text>
          <Text
            style={[
              styles.heroCopy,
              {
                color: theme.colors.text.inverse,
                opacity: 0.85,
                fontSize: 14,
              },
            ]}
          >
            {body}
          </Text>
        </View>
      </View>
    </CardEnterAnimation>
  );
}

export function DefaultHero({
  body,
  headline,
  theme,
}: {
  body: string;
  headline: string;
  theme: Theme;
}): React.ReactNode {
  return (
    <CardEnterAnimation>
      <LinearGradient
        colors={[theme.colors.semantic.obsidian, theme.colors.accent.editorial]}
        style={styles.heroCard}
      >
        <Text style={[styles.heroTitle, { color: theme.colors.text.inverse }]}>
          {headline}
        </Text>
        <Text style={[styles.heroCopy, { color: theme.colors.text.inverse }]}>
          {body}
        </Text>
      </LinearGradient>
    </CardEnterAnimation>
  );
}
