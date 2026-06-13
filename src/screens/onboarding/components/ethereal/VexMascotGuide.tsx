import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { GuideAction } from './VexMascotGuide.helpers';
import { AnimatedMascot } from './AnimatedMascot';
import { MascotSpeechBubble } from './MascotSpeechBubble';
import {
  PLACEMENT_STYLES,
  SIZE_CONFIG,
  type MascotMood,
  type MascotPlacement,
  type MascotSize,
} from './VexMascotGuide.tokens';

type VexMascotGuideProps = {
  mood?: MascotMood;
  message: string;
  submessage?: string;
  size?: MascotSize;
  placement?: MascotPlacement;
  onBack?: () => void;
  onReplay?: () => void;
  onSkip?: () => void;
  hideActions?: boolean;
  style?: object;
  reactionKey?: string | number;
};

function getDirectedFrames(mood: MascotMood): readonly MascotMood[] {
  if (mood === 'thinking') {
    return ['listening', 'thinking', 'pointing', 'thinking'];
  }
  if (mood === 'pointing') {
    return ['wave', 'pointing', 'listening', 'pointing'];
  }
  if (mood === 'celebrate') {
    return ['encouraging', 'celebrate', 'wave', 'celebrate'];
  }
  if (mood === 'recovery') {
    return ['recovery', 'listening', 'encouraging', 'recovery'];
  }
  return ['wave', 'listening', 'pointing', mood];
}

export function VexMascotGuide({
  mood = 'default',
  message,
  submessage,
  size = 'question',
  placement = 'inline',
  onBack,
  onReplay,
  onSkip,
  hideActions = false,
  style,
  reactionKey,
}: VexMascotGuideProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const config = SIZE_CONFIG[size];
  const placementStyle = PLACEMENT_STYLES[placement];
  const directedFrames = useMemo(() => getDirectedFrames(mood), [mood]);
  const directedMood = isReducedMotion
    ? mood
    : directedFrames[frame % directedFrames.length] ?? mood;

  useEffect(() => {
    setFrame(0);
  }, [mood, message]);

  useEffect(() => {
    if (isReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setFrame((current) => current + 1);
    }, 620);

    return () => clearInterval(timer);
  }, [isReducedMotion, mood]);

  return (
    <View style={[{ width: '100%' }, placementStyle, style]}>
      <AnimatedMascot
        isCelebrating={directedMood === 'celebrate'}
        isPointing={directedMood === 'pointing'}
        preferPng
        isSpeaking
        isThinking={directedMood === 'thinking'}
        mood={directedMood}
        reactionKey={`${reactionKey ?? message}-${directedMood}-${frame}`}
        reducedMotion={isReducedMotion}
        size={{ width: config.width, height: config.height }}
      />
      <MascotSpeechBubble
        config={config}
        message={message}
        placement={placement}
        pulseKey={`${directedMood}-${frame}`}
        reducedMotion={isReducedMotion}
        submessage={submessage}
      >
        {!hideActions && (onBack || onReplay || onSkip) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {onBack ? <GuideAction label="Back" onPress={onBack} /> : null}
            {onReplay ? <GuideAction label="Replay" onPress={onReplay} /> : null}
            {onSkip ? <GuideAction label="Skip guide" onPress={onSkip} strong /> : null}
          </View>
        ) : null}
      </MascotSpeechBubble>
    </View>
  );
}
