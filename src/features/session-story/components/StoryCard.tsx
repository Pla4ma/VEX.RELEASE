/**
 * Story Card Component
 *
 * Displays session narrative in a shareable card format
 * Handles loading, empty, error states
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { getSessionNarrator } from '../SessionNarrator';
import { getNarrativeRepository } from '../NarrativeRepository';
import {
  TransformationErrorBoundary,
  TransformationLoadingState,
  TransformationEmptyState,
  TransformationErrorState,
} from '../../../integration/ErrorBoundary';

interface Props {
  sessionId: string;
  onShare?: () => void;
}

export function StoryCard({ sessionId, onShare }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<ReturnType<ReturnType<typeof getSessionNarrator>['getStoryCard']>>(null);

  const narrator = getSessionNarrator();
  const repository = getNarrativeRepository();

  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from repository first
        const saved = await repository.loadNarrative(sessionId);
        if (saved.success && saved.data) {
          // Narrative loaded from persistence
        }

        const card = narrator.getStoryCard(sessionId);
        setStoryData(card);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [sessionId, narrator, repository]);


  const handleShare = async () => {
    if (!storyData) {
      return;
    }

    try {
      await Share.share({
        message: `${storyData.title}\n\n${storyData.subtitle}\n\n${storyData.heroQuote}\n\nShared from VEX App`,
      });
      onShare?.();
    } catch (err) {
      setError('Failed to share story');
    }
  };

  if (loading) {
    return <TransformationLoadingState message="Loading your story..." />;
  }

  if (error) {
    return <TransformationErrorState error={error} onRetry={loadStory} />;
  }

  if (!storyData) {
    return (
      <TransformationEmptyState
        icon="📖"
        title="No Story Yet"
        message="Complete a session to generate your story!"
      />
    );
  }

  const themeColors: Record<string, string> = {
    triumph: '#10B981',
    struggle: '#F59E0B',
    comeback: '#EF4444',
    mastery: '#8B5CF6',
    learning: '#3B82F6',
  };

  const accentColor = themeColors[storyData.theme] || '#6366F1';

  return (
    <TransformationErrorBoundary systemName="Story Card">
      <View style={[styles.container, { borderLeftColor: accentColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>📖</Text>
          <Text style={styles.sessionLabel}>Session Story</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{storyData.title}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {storyData.stats.map((stat, index) => (
            <View key={index} style={styles.statBadge}>
              <Text style={styles.statText}>{stat}</Text>
            </View>
          ))}
        </View>

        {/* Hero Quote */}
        <View style={[styles.quoteContainer, { backgroundColor: accentColor + '15' }]}>
          <Text style={[styles.quote, { color: accentColor }]}>{storyData.heroQuote}</Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={[styles.shareButton, { backgroundColor: accentColor }]} onPress={handleShare}>
          <Text style={styles.shareText}>Share Story</Text>
        </TouchableOpacity>
      </View>
    </TransformationErrorBoundary>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  sessionLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  quoteContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },
  shareButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};
