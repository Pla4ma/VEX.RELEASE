import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';

interface HomeReferenceSectionsProps {
  currentStreak: number;
  onStartSession: () => void;
  totalSessions: number;
}

export function HomeReferenceSections({
  currentStreak,
}: HomeReferenceSectionsProps): JSX.Element {
  return (
    <View style={{ gap: 10, marginTop: 12 }}>
      {/* AI Coach Card */}
      <GlassCard padding={16} radius={22} variant="default">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <LiquidGlassSphere
            color="pearl"
            icon={
              <Icon color="#0C765F" name="sparkles" size="sm" strokeWidth="thin" variant="outline" />
            }
            intensity={0.7}
            size={42}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: '#0A1F1A',
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              AI Coach
            </Text>
            <Text
              style={{
                color: '#3D5A52',
                fontSize: 12,
                lineHeight: 17,
                fontWeight: '400',
              }}
            >
              One clean block, together. Ready?
            </Text>
          </View>
          <Icon color="#6B8F85" name="chevronRight" size="sm" strokeWidth="thin" variant="outline" />
        </View>
      </GlassCard>

      {/* Streak Card */}
      <GlassCard padding={16} radius={22} variant="default">
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <GlassPill
            label={`${currentStreak} Day Streak`}
            size="sm"
            variant="fire"
          />
          <GlassPill label="2.0x" size="sm" variant="mint" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <View
              key={`${day}-${index}`}
              style={{ alignItems: 'center', flex: 1, gap: 5 }}
            >
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor:
                    index < Math.min(currentStreak, 7)
                      ? '#0A9B8A'
                      : 'rgba(16,35,31,0.10)',
                  borderRadius: 999,
                  height: 22,
                  justifyContent: 'center',
                  width: 22,
                }}
              >
                <Icon
                  color="#FFFFFF"
                  name="check"
                  size="xs"
                  variant="solid"
                />
              </View>
              <Text
                style={{
                  color: '#6B8F85',
                  fontSize: 10,
                  fontWeight: '700',
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={{
            color: '#6B8F85',
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          12h 40m until streak risk
        </Text>
      </GlassCard>

      {/* Focus Score & Memory Row */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <GlassCard
          padding={16}
          radius={22}
          style={{ flex: 1 }}
          variant="default"
        >
          <Text
            style={{
              color: '#0A1F1A',
              fontSize: 13,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            Focus Score
          </Text>
          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
              gap: 8,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: '#0A1F1A',
                fontSize: 24,
                fontWeight: '800',
                letterSpacing: -0.8,
              }}
            >
              82
            </Text>
            <Text
              style={{
                color: '#0A9B8A',
                fontSize: 13,
                fontWeight: '800',
                marginBottom: 4,
              }}
            >
              +6
            </Text>
          </View>
          <Text
            style={{
              color: '#0A9B8A',
              fontSize: 12,
              fontWeight: '800',
              marginTop: 3,
            }}
          >
            Stable
          </Text>
        </GlassCard>
        <GlassCard
          padding={16}
          radius={22}
          style={{ flex: 1 }}
          variant="default"
        >
          <Text
            style={{
              color: '#0A1F1A',
              fontSize: 13,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            Focus Memory
          </Text>
          <Text
            style={{
              color: '#3D5A52',
              fontSize: 12,
              lineHeight: 17,
              marginTop: 8,
              fontWeight: '400',
            }}
          >
            VEX remembered your next move.
          </Text>
        </GlassCard>
      </View>

      {/* Project Atlas Card */}
      <GlassCard padding={16} radius={22} variant="default">
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <LiquidGlassSphere
            color="cyan"
            icon={
              <Icon color="#0E7490" name="book" size="sm" strokeWidth="thin" variant="outline" />
            }
            intensity={0.7}
            size={42}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: '#0A1F1A',
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              Project Atlas
            </Text>
            <Text
              style={{
                color: '#3D5A52',
                fontSize: 12,
                fontWeight: '400',
              }}
            >
              Continue where you left off.
            </Text>
          </View>
          <Icon color="#6B8F85" name="chevronRight" size="sm" strokeWidth="thin" variant="outline" />
        </View>
      </GlassCard>
    </View>
  );
}

export default HomeReferenceSections;
