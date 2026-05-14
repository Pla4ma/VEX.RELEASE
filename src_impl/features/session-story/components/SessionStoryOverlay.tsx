/**
 * Session Story Overlay
 *
 * Integrates the cinematic story moment into the existing SessionComplete flow.
 * Shows between grade reveal and consequence cards.
 *
 * @phase 17.2 - Enhancement to existing SessionCompleteContent
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { haptics } from '@/shared/feedback';
import { useReducedMotion } from '@/hooks';
import { useSessionStory } from '../hooks';
import type { StoryBeat, EmotionalArc } from '../schemas';

// ============================================================================
// Types
// ============================================================================

interface SessionStoryOverlayProps {
  sessionId: string;
  userId: string;
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const SessionStoryOverlay: React.FC<SessionStoryOverlayProps> = ({ sessionId, userId, isVisible, onComplete, onSkip }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isReducedMotion } = useReducedMotion();

  // Get story data
  const { story, isLoading } = useSessionStory(sessionId, userId);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Start animation when visible
  useEffect(() => {
    if (isVisible && story && !hasStarted) {
      setHasStarted(true);
      fadeAnim.value = withTiming(1, {
        duration: isReducedMotion ? 100 : 400,
      });
    }
  }, [isVisible, story, hasStarted, fadeAnim, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  // Haptic handler - defined before useEffect that uses it
  const handleHaptic = useCallback(
    (pattern: StoryBeat['hapticPattern']) => {
      if (isReducedMotion) {
        return;
      }
      switch (pattern) {
        case 'LIGHT':
          haptics.impact('light');
          break;
        case 'MEDIUM':
          haptics.impact('medium');
          break;
        case 'HEAVY':
          haptics.impact('heavy');
          break;
        case 'SUCCESS':
          haptics.success('light');
          break;
        case 'CELEBRATION':
          haptics.success('heavy');
          break;
      }
    },
    [isReducedMotion],
  );

  // Auto-advance through beats
  useEffect(() => {
    if (!story || !hasStarted) {
      return;
    }

    if (currentBeatIndex >= story.totalBeats) {
      // Story complete
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
    }

    const currentBeat = story.beats[currentBeatIndex];

    // Trigger haptic
    if (currentBeat.hapticPattern !== 'NONE' && !isReducedMotion) {
      handleHaptic(currentBeat.hapticPattern);
    }

    // Auto-advance after duration
    const timer = setTimeout(() => {
      setCurrentBeatIndex((prev) => prev + 1);
    }, currentBeat.durationMs);

    return () => clearTimeout(timer);
  }, [currentBeatIndex, story, hasStarted, onComplete, isReducedMotion, handleHaptic]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const handleNext = useCallback(() => {
    if (story && currentBeatIndex < story.totalBeats - 1) {
      setCurrentBeatIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentBeatIndex, story, onComplete]);

  // Get current beat
  const currentBeat = story?.beats[currentBeatIndex];

  // Get emotion color
  const getEmotionColor = (emotion: EmotionalArc): string => {
    const colors: Record<EmotionalArc, string> = {
      TRIUMPH: theme.colors.success.DEFAULT,
      MASTERY: theme.colors.primary[500],
      RESILIENCE: theme.colors.warning.DEFAULT,
      DETERMINATION: theme.colors.info.DEFAULT,
      ANTICIPATION: theme.colors.primary[400] ?? theme.colors.primary[500],
      WONDER: theme.colors.primary[400] ?? theme.colors.primary[500],
      GRATITUDE: theme.colors.success.DEFAULT,
      RELIEF: theme.colors.success.DEFAULT,
    };
    return colors[emotion] ?? theme.colors.primary[500];
  };

  const emotionColor = currentBeat ? getEmotionColor(currentBeat.emotion) : theme.colors.primary[500];

  // Loading state
  if (isLoading || !story) {
    return <View />;
  }

  // Not visible
  if (!isVisible) {
    return <View />;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background?.primary ?? '#000',
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        animatedStyle,
      ]}
    >
      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {story.beats.map((_beat: StoryBeat, index: number) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index <= currentBeatIndex ? emotionColor : (theme.colors.border?.DEFAULT ?? '#3333'),
              }}
            />
          ))}
        </View>

        <Pressable onPress={handleSkip} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text?.muted ?? '#888' }}>Skip Story</Text>
        </Pressable>
      </View>

      {/* Story content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>{currentBeat && <StoryBeatCard beat={currentBeat} emotionColor={emotionColor} theme={theme} />}</View>

      {/* Tap to continue */}
      <Pressable style={{ paddingVertical: 24, alignItems: 'center' }} onPress={handleNext}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text?.muted ?? '#888' }}>Tap to continue</Text>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// Story Beat Card Component
// ============================================================================

interface StoryBeatCardProps {
  beat: StoryBeat;
  emotionColor: string;
  theme: DynamicValue;
}

const StoryBeatCard: React.FC<StoryBeatCardProps> = ({ beat, emotionColor, theme }) => {
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    slideAnim.value = 30;
    slideAnim.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, [beat.id, slideAnim]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  // Get icon for beat type
  const getIcon = (type: StoryBeat['type']): string => {
    const icons: Record<string, string> = {
      OPENING: '🌅',
      FOCUS_JOURNEY: '🎯',
      STREAK_MOMENT: '🔥',
      BOSS_BATTLE: '⚔️',
      MILESTONE_REACHED: '🏆',
      PERFECTION_MOMENT: '✨',
      COMEBACK_TRIUMPH: '🦅',
      PROGRESSION_CLIFFHANGER: '📈',
      ACHIEVEMENT_UNLOCK: '🎖️',
      CLOSING_REFLECTION: '🌟',
    };
    return icons[type] ?? '📝';
  };

  return (
    <Animated.View style={[{ alignItems: 'center', width: '100%' }, slideStyle]}>
      {/* Icon */}
      <View style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, backgroundColor: `${emotionColor}20` }}>
        <Text style={{ fontSize: 36 }}>{getIcon(beat.type)}</Text>
      </View>

      {/* Headline */}
      <Text style={{ fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12, lineHeight: 36, color: theme.colors.text?.primary ?? '#fff' }}>{beat.headline}</Text>

      {/* Subtext */}
      {beat.subtext && <Text style={{ fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 20, color: theme.colors.text?.secondary ?? '#aaa' }}>{beat.subtext}</Text>}

      {/* Context pill */}
      {beat.metadata?.context && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: `${emotionColor}20` }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: emotionColor }}>{beat.metadata.context}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default SessionStoryOverlay;
