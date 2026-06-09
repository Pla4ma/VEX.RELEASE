import React from 'react';
import Svg, { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';

import { etherealText } from '@/theme/tokens/ethereal-sky';

export function AppleGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M16.6 13.1c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.8-2.8-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5 0-.1-2.7-1-2.7-3.3ZM14.6 6.8c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.7-1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.2Z"
        fill={color}
      />
    </Svg>
  );
}

export function GoogleGlyph(): React.JSX.Element {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3-4.1 3-7Z" fill={etherealText.googleBlue} />
      <Path d="M12 22c2.6 0 4.8-.9 6.5-2.8l-3.1-2.4c-.9.6-2 .9-3.4.9-2.5 0-4.6-1.7-5.4-4H3.4v2.5C5 19.6 8.2 22 12 22Z" fill={etherealText.googleGreen} />
      <Path d="M6.6 13.7c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.7H3.4C2.8 9 2.5 10.4 2.5 12s.3 3 .9 4.3l3.2-2.6Z" fill={etherealText.googleYellow} />
      <Path d="M12 6.2c1.4 0 2.7.5 3.7 1.5l2.8-2.8C16.8 3.1 14.6 2 12 2 8.2 2 5 4.4 3.4 7.7l3.2 2.5c.8-2.3 2.9-4 5.4-4Z" fill={etherealText.googleRed} />
    </Svg>
  );
}

export function EnvelopeGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x="3.5" y="6" width="17" height="12" rx="1.8" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M4.5 7.2 12 13l7.5-5.8" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </Svg>
  );
}

export function ArrowGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32">
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8">
        <Line x1="6" y1="16" x2="25" y2="16" />
        <Polyline points="18 9 25 16 18 23" />
      </G>
    </Svg>
  );
}

export function PrivacyShieldGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M12 3 19 6v5c0 4.4-2.8 8-7 10-4.2-2-7-5.6-7-10V6l7-3Z" fill="none" stroke={color} strokeWidth="1.8" />
      <Path d="M9 12.1 11.1 14 15 9.8" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </Svg>
  );
}

export function LockGlyph({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke={color} strokeWidth="1.8" />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.8" />
      <Circle cx="12" cy="15" r="1.2" fill={color} />
    </Svg>
  );
}
