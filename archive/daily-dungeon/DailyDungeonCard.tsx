/**
 * Daily Dungeon Card
 * Shows today's boss, mechanic, rewards, and countdown
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme';
import type { DailyDungeon, UserDungeonAttempt } from '../../features/daily-dungeon/types';
import { getUrgencyMessage, DUNGEON_MECHANICS } from '../../features/daily-dungeon/types';

interface DailyDungeonCardProps {
  dungeon: DailyDungeon;
  attempt: UserDungeonAttempt;
  timeRemaining: { hours: number; minutes: number };
  onEnter: () => void;
  onViewLeaderboard: () => void;
}

export const DailyDungeonCard: React.FC<DailyDungeonCardProps> = ({
  dungeon,
  attempt,
  timeRemaining,
  onEnter,
  onViewLeaderboard,
}) => {
  const { theme } = useTheme();
  const mechanic = DUNGEON_MECHANICS[(dungeon as any).specialMechanic];
  const urgencyMessage = getUrgencyMessage(timeRemaining.hours);
  const isUrgent = timeRemaining.hours < 2;

  return (
    <View style={{
      backgroundColor: (theme.colors.background as any).primary,
      borderRadius: (theme.borderRadius as any).xl,
      overflow: 'hidden',
      margin: (theme.spacing as any)[4],
      shadowColor: (theme.colors as any).shadow?.primary || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    }}>
      {/* Header */}
      <View style={[
        { padding: (theme.spacing as any)[5], alignItems: 'center' as const },
        { backgroundColor: getThemeColor((dungeon as any).theme) }
      ]}>
        <Text style={{
          fontSize: (theme.typography as any).caption.fontSize,
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '600' as const,
          marginBottom: (theme.spacing as any)[1],
        }}>⚔️ DAILY DUNGEON</Text>
        <Text style={{
          fontSize: (theme.typography as any).h3.fontSize,
          fontWeight: 'bold' as const,
          color: 'white',
          textAlign: 'center' as const,
        }}>{(dungeon as any).bossName}</Text>
        <Text style={{
          fontSize: (theme.typography as any).caption2.fontSize,
          color: 'rgba(255, 255, 255, 0.7)',
          marginTop: (theme.spacing as any)[1],
          textTransform: 'uppercase' as const,
        }}>{(dungeon as any).theme}</Text>
      </View>

      {/* Countdown */}
      <View style={[
        {
          backgroundColor: (theme.colors.background as any).secondary,
          padding: (theme.spacing as any)[3],
          alignItems: 'center',
        },
        isUrgent && { backgroundColor: (theme.colors.error as any)?.background || (theme.colors.error as any).primary }
      ]}>
        <Text style={[
          {
            fontSize: (theme.typography as any).body.fontSize,
            fontWeight: '600' as const,
            color: (theme.colors.text as any).secondary,
          },
          isUrgent && { color: (theme.colors.error as any)?.primary || (theme.colors.error as any).dark }
        ]}>
          ⏰ {timeRemaining.hours}h {timeRemaining.minutes}m remaining
        </Text>
      </View>

      {/* Urgency Message */}
      <View style={{
        padding: (theme.spacing as any)[3],
        backgroundColor: (theme.colors.background as any)?.error || (theme.colors.error as any).light,
        borderBottomWidth: 1,
        borderBottomColor: (theme.colors.border as any)?.primary || (theme.colors.border as any).light,
      }}>
        <Text style={[
          {
            fontSize: (theme.typography as any).caption.fontSize,
            color: (theme.colors.text as any).secondary,
            textAlign: 'center' as const,
          },
          isUrgent && { color: (theme.colors.error as any)?.primary || (theme.colors.error as any).dark, fontWeight: '600' as const }
        ]}>
          {urgencyMessage}
        </Text>
      </View>

      {/* Mechanic Section */}
      <View style={{
        padding: (theme.spacing as any)[4],
        borderBottomWidth: 1,
        borderBottomColor: (theme.colors.border as any)?.primary || (theme.colors.border as any).light,
      }}>
        <Text style={{
          fontSize: (theme.typography as any).caption.fontSize,
          fontWeight: '600' as const,
          color: (theme.colors.text as any).tertiary,
          marginBottom: (theme.spacing as any)[2],
        }}>⚠️ Special Mechanic</Text>
        <Text style={{
          fontSize: (theme.typography as any).h4.fontSize,
          fontWeight: 'bold' as const,
          color: (theme.colors.text as any).primary,
          marginBottom: (theme.spacing as any)[1],
        }}>{mechanic?.name || (dungeon as any).specialMechanic}</Text>
        <Text style={{
          fontSize: (theme.typography as any).body.fontSize,
          color: (theme.colors.text as any).secondary,
          marginBottom: (theme.spacing as any)[3],
        }}>{mechanic?.description}</Text>
        <View style={{
          backgroundColor: (theme.colors.background as any).info,
          padding: (theme.spacing as any)[3],
          borderRadius: (theme.borderRadius as any).md,
          borderLeftWidth: 3,
          borderLeftColor: (theme.colors.primary as any)[500],
          alignItems: 'center' as const,
        }}>
          <Text style={{
            fontSize: (theme.typography as any).caption.fontSize,
            fontWeight: '600' as const,
            color: (theme.colors.primary as any)[700],
            marginBottom: (theme.spacing as any)[1],
          }}>Strategy:</Text>
          <Text style={{
            fontSize: (theme.typography as any).caption.fontSize,
            color: (theme.colors.text as any).primary,
          }}>{mechanic?.counterStrategy}</Text>
        </View>
      </View>

      {/* Rewards Section */}
      <View style={{
        padding: (theme.spacing as any)[4],
        borderBottomWidth: 1,
        borderBottomColor: (theme.colors.border as any).primary,
      }}>
        <Text style={{
          fontSize: (theme.typography as any).caption.fontSize,
          fontWeight: '600' as const,
          color: (theme.colors.text as any).tertiary,
          marginBottom: (theme.spacing as any)[2],
        }}>🎁 Guaranteed Reward</Text>
        <View style={{
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: (theme.spacing as any)[3],
          marginBottom: (theme.spacing as any)[1],
        }}>
          <View style={[
            {
              paddingHorizontal: (theme.spacing as any)[3],
              paddingVertical: (theme.spacing as any)[2],
              borderRadius: (theme.borderRadius as any).xl,
            },
            { backgroundColor: getRarityColor((dungeon as any).guaranteedDrop.rarity) }
          ]}>
            <Text style={{
              color: 'white',
              fontSize: (theme.typography as any).caption.fontSize,
              fontWeight: '600' as const,
            }}>{(dungeon as any).guaranteedDrop.type}</Text>
          </View>
          <Text style={{
            fontSize: (theme.typography as any).body.fontSize,
            color: (theme.colors.text as any).primary,
            fontWeight: '500' as const,
          }}>
            {(dungeon as any).guaranteedDrop.amount
              ? `${(dungeon as any).guaranteedDrop.amount}x`
              : '1x'} {(dungeon as any).guaranteedDrop.item || 'item'}
          </Text>
        </View>
        <Text style={{
          fontSize: (theme.typography as any).caption.fontSize,
          color: (theme.colors as any).purple?.[600] || '#9333ea',
          fontWeight: '600' as const,
          marginTop: (theme.spacing as any)[1],
        }}>{(dungeon as any).guaranteedDrop.rarity}</Text>

        {/* Attempt Status */}
        {(attempt as any).completed ? (
          <View style={{
            backgroundColor: (theme.colors.success as any)?.background || (theme.colors.success as any).primary,
            padding: (theme.spacing as any)[2],
            borderRadius: (theme.borderRadius as any).md,
            marginTop: (theme.spacing as any)[3],
            alignItems: 'center',
          }}>
            <Text style={{
              color: (theme.colors.success as any)?.dark || (theme.colors.success as any).primary,
              fontWeight: 'bold' as const,
            }}>✅ COMPLETED TODAY</Text>
          </View>
        ) : (attempt as any).attempts > 0 ? (
          <View style={{
            backgroundColor: (theme.colors.warning as any)?.background || (theme.colors.warning as any).primary,
            padding: (theme.spacing as any)[2],
            borderRadius: (theme.borderRadius as any).md,
            marginTop: (theme.spacing as any)[3],
            alignItems: 'center',
          }}>
            <Text style={{
              color: (theme.colors.warning as any)?.dark || (theme.colors.warning as any).primary,
              fontWeight: '600' as const,
            }}>
              {(attempt as any).attempts} attempt{(attempt as any).attempts !== 1 ? 's' : ''} made
            </Text>
            <Text style={{
              color: (theme.colors.warning as any)?.dark || (theme.colors.warning as any).primary,
              fontSize: (theme.typography as any).caption.fontSize,
              marginTop: (theme.spacing as any)[1],
            }}>
              Best damage: {(attempt as any).bestDamage?.toLocaleString() || 0}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={{
        padding: (theme.spacing as any)[4],
        gap: (theme.spacing as any)[2],
      }}>
        <Pressable
          onPress={onEnter}
          disabled={(attempt as any).completed}
          style={({ pressed }) => ({
            backgroundColor: pressed 
              ? (theme.colors.error as any)?.dark || (theme.colors.error as any).primary
              : (theme.colors.error as any)?.[500] || (theme.colors.error as any).primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{
            color: 'white',
            fontSize: (theme.typography as any).large.fontSize,
            fontWeight: 'bold' as const,
          }}>⚔️ Enter Dungeon</Text>
        </Pressable>
        
        <Pressable
          onPress={onViewLeaderboard}
          style={({ pressed }) => ({
            backgroundColor: pressed 
              ? (theme.colors.text as any).secondary 
              : 'transparent',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: (theme.colors.text as any).secondary,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{
            color: (theme.colors.text as any).secondary,
            fontSize: (theme.typography as any).medium.fontSize,
            fontWeight: '500' as const,
          }}>🏆 View Leaderboard</Text>
        </Pressable>
      </View>
    </View>
  );
};

function getThemeColor(theme: DailyDungeon['theme']): string {
  const colors: Record<string, string> = {
    VOID: '#4A5568',
    FLAME: '#C53030',
    FROST: '#3182CE',
    STORM: '#805AD5',
    LIGHT: '#D69E2E',
    SHADOW: '#2D3748',
  };
  return colors[theme] || '#4A5568';
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    COMMON: '#A0AEC0',
    UNCOMMON: '#38A169',
    RARE: '#3182CE',
    EPIC: '#805AD5',
    LEGENDARY: '#D69E2E',
  };
  return colors[rarity] || '#A0AEC0';
}
