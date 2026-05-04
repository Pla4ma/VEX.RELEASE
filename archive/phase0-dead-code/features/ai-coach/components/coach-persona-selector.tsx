/**
 * Coach Persona Selector Component
 *
 * Allows user to choose their preferred coach personality
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CoachPersona, VoiceTone, CoachStyle } from '../schemas';
import { useCoachPersonas, useCoachState, useUpdateCoachPreferences } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

export interface CoachPersonaSelectorProps {
  userId: string;
  onSelect?: (persona: CoachPersona) => void;
}

const TONE_ICONS: Record<VoiceTone, string> = {
  ENCOURAGING: '☀️',
  STERN: '🎯',
  PLAYFUL: '🎮',
  WISE: '🦉',
  COMPETITIVE: '🏆',
  GENTLE: '🌸',
};

const STYLE_DESCRIPTIONS: Record<CoachStyle, string> = {
  CHEERLEADER: 'Always positive, celebrating every win',
  DRILL_SERGEANT: 'Tough love, pushing you to your best',
  FRIEND: 'Casual, supportive, like a gym buddy',
  MENTOR: 'Wise guidance, long-term perspective',
  RIVAL: 'Competitive, challenging you to improve',
  MINDFUL: 'Gentle, focused on balance and wellness',
};

export function CoachPersonaSelector({ userId, onSelect }: CoachPersonaSelectorProps): JSX.Element {
  const { data: personas, isLoading, isError } = useCoachPersonas();
  const { data: state } = useCoachState(userId);
  const updatePreferences = useUpdateCoachPreferences();

  if (isLoading) {
    return <PersonaSelectorSkeleton />;
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load personas</Text>
      </View>
    );
  }

  const handleSelect = async (persona: CoachPersona) => {
    await updatePreferences.mutateAsync({
      userId,
      personaId: persona.id,
    });
    onSelect?.(persona);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose Your Coach</Text>
      <Text style={styles.subtitle}>
        Select a personality that matches your motivation style
      </Text>

      <View style={styles.grid}>
        {personas?.map((persona, index) => (
          <Animated.View
            key={persona.id}
            entering={FadeIn.delay(index * 100)}
          >
            <PersonaCard
              persona={persona}
              isSelected={state?.personaId === persona.id}
              onSelect={() => handleSelect(persona)}
              isUpdating={updatePreferences.isPending}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

interface PersonaCardProps {
  persona: CoachPersona;
  isSelected: boolean;
  onSelect: () => void;
  isUpdating: boolean;
}

function PersonaCard({ persona, isSelected, onSelect, isUpdating }: PersonaCardProps): JSX.Element {
  return (
    <Pressable
      onPress={onSelect}
      disabled={isUpdating}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
      accessibilityLabel={`Select ${persona.name}`}
      accessibilityState={{ selected: isSelected }}

    accessibilityRole="button"
    accessibilityHint="Activates this control">
      <View style={styles.cardHeader}>
        <Text style={styles.icon}>{TONE_ICONS[persona.voiceTone]}</Text>
        {isSelected && (
          <Animated.View entering={ZoomIn} style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
        )}
      </View>

      <Text style={styles.name}>{persona.name}</Text>
      <Text style={styles.style}>{persona.style}</Text>
      <Text style={styles.description}>{STYLE_DESCRIPTIONS[persona.style]}</Text>

      {persona.catchphrase && (
        <View style={styles.catchphraseContainer}>
          <Text style={styles.catchphrase}>"{persona.catchphrase}"</Text>
        </View>
      )}
    </Pressable>
  );
}

function PersonaSelectorSkeleton(): JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSubtitle} />
      <View style={styles.grid}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    </View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#F0FDFB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 40,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  style: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  catchphraseContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
  },
  catchphrase: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
  },
  // Skeleton
  skeletonTitle: {
    width: 200,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 24,
  },
  skeletonCard: {
    height: 150,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    marginBottom: 12,
  },
});
