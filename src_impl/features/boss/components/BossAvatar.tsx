import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

type BossVariant = 'wraith' | 'behemoth' | 'hydra';

interface BossAvatarProps {
  bossName: string;
  size?: number;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
}

function pickVariant(name: string): BossVariant {
  const normalized = name.toLowerCase();
  if (normalized.includes('hydra') || normalized.includes('serpent')) {return 'hydra';}
  if (normalized.includes('titan') || normalized.includes('golem')) {return 'behemoth';}
  return 'wraith';
}

function Wraith({ primaryColor, secondaryColor, glowColor }: BossAvatarProps) {
  return (
    <G>
      <Ellipse cx="100" cy="166" rx="54" ry="14" fill={glowColor} opacity="0.25" />
      <Path d="M60 66C60 38 82 18 110 18C138 18 160 42 160 72C160 109 142 138 130 170L92 170C79 138 60 109 60 66Z" fill="url(#boss-gradient)" />
      <Path d="M81 77C87 69 93 66 100 66C107 66 113 69 119 77" stroke={glowColor} strokeWidth="7" strokeLinecap="round" />
      <Circle cx="85" cy="82" r="7" fill={glowColor} opacity="0.95" />
      <Circle cx="116" cy="82" r="7" fill={glowColor} opacity="0.95" />
      <Path d="M77 124L92 170L68 148L77 124Z" fill={secondaryColor} opacity="0.9" />
      <Path d="M124 124L132 148L108 170L124 124Z" fill={secondaryColor} opacity="0.9" />
      <Path d="M94 108C100 114 103 114 110 108" stroke={glowColor} strokeWidth="6" strokeLinecap="round" />
      <Path d="M53 63L35 94L58 94Z" fill={secondaryColor} opacity="0.8" />
      <Path d="M159 62L164 95L142 93Z" fill={secondaryColor} opacity="0.8" />
    </G>
  );
}

function Behemoth({ primaryColor, secondaryColor, glowColor }: BossAvatarProps) {
  return (
    <G>
      <Ellipse cx="100" cy="166" rx="58" ry="16" fill={glowColor} opacity="0.2" />
      <Path d="M48 92C48 53 72 28 110 28C147 28 171 53 171 92C171 126 151 159 119 170H87C60 160 48 131 48 92Z" fill="url(#boss-gradient)" />
      <Path d="M63 47L82 24L88 53Z" fill={secondaryColor} />
      <Path d="M157 47L133 23L130 52Z" fill={secondaryColor} />
      <Circle cx="82" cy="88" r="9" fill={glowColor} opacity="0.92" />
      <Circle cx="132" cy="88" r="9" fill={glowColor} opacity="0.92" />
      <Path d="M79 117H135L120 137H95Z" fill={secondaryColor} />
      <Path d="M62 117L41 134L54 154L73 137Z" fill={secondaryColor} opacity="0.85" />
      <Path d="M151 117L162 134L149 154L131 137Z" fill={secondaryColor} opacity="0.85" />
    </G>
  );
}

function Hydra({ primaryColor, secondaryColor, glowColor }: BossAvatarProps) {
  return (
    <G>
      <Ellipse cx="100" cy="170" rx="62" ry="14" fill={glowColor} opacity="0.22" />
      <Path d="M72 142C69 102 76 79 90 58C103 38 128 31 142 48C151 58 152 77 145 90C138 103 126 116 122 143Z" fill="url(#boss-gradient)" />
      <Path d="M98 150C94 112 100 91 114 71C126 54 146 50 158 62C168 73 167 91 156 104C144 117 132 128 128 150Z" fill={secondaryColor} opacity="0.95" />
      <Path d="M47 150C48 114 59 95 75 77C88 63 108 63 118 76C126 87 124 105 113 117C101 130 86 140 82 154Z" fill={primaryColor} opacity="0.88" />
      <Circle cx="108" cy="76" r="6" fill={glowColor} />
      <Circle cx="136" cy="82" r="6" fill={glowColor} />
      <Circle cx="76" cy="95" r="6" fill={glowColor} />
      <Path d="M69 160C84 149 117 148 135 159" stroke={glowColor} strokeWidth="8" strokeLinecap="round" />
    </G>
  );
}

export function BossAvatar(props: BossAvatarProps): JSX.Element {
  const { size = 160, primaryColor, secondaryColor, glowColor } = props;
  const variant = pickVariant(props.bossName);

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="boss-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={secondaryColor} />
          <Stop offset="100%" stopColor={primaryColor} />
        </LinearGradient>
      </Defs>
      {variant === 'behemoth' ? <Behemoth {...props} /> : null}
      {variant === 'hydra' ? <Hydra {...props} /> : null}
      {variant === 'wraith' ? <Wraith {...props} /> : null}
    </Svg>
  );
}

export default BossAvatar;
