import React from 'react';
import { VexMascotGuide, type MascotMood } from './VexMascotGuide';

type MascotGuideProps = {
  title: string;
  body: string;
  stepLabel?: string;
  onBack?: () => void;
  onReplay?: () => void;
  onSkip?: () => void;
  compact?: boolean;
};

export function MascotGuide({
  title,
  body,
  stepLabel,
  onBack,
  onReplay,
  onSkip,
  compact = false,
}: MascotGuideProps): React.JSX.Element {
  return (
    <VexMascotGuide
      message={title}
      mood={'default' as MascotMood}
      onBack={onBack}
      onReplay={onReplay}
      onSkip={onSkip}
      placement="inline"
      size={compact ? 'inline' : 'question'}
      submessage={body}
    />
  );
}
