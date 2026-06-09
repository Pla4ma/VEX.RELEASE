import React from 'react';
import { Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';

export function buildGlassDefs(): JSX.Element {
  return (
    <Defs>
      <RadialGradient cx="42%" cy="38%" id="liquidCore" r="65%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
        <Stop offset="18%" stopColor="#F0FFF9" stopOpacity="0.94" />
        <Stop offset="38%" stopColor="#C4FCE8" stopOpacity="0.78" />
        <Stop offset="58%" stopColor="#7AE8C8" stopOpacity="0.52" />
        <Stop offset="78%" stopColor="#3DD4A8" stopOpacity="0.32" />
        <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.18" />
      </RadialGradient>

      <LinearGradient id="rimLight" x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <Stop offset="25%" stopColor="#E8FFF6" stopOpacity="0.72" />
        <Stop offset="55%" stopColor="#5FEDC7" stopOpacity="0.45" />
        <Stop offset="85%" stopColor="#18B894" stopOpacity="0.68" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0.85" />
      </LinearGradient>

      <RadialGradient cx="48%" cy="45%" id="innerDistortion" r="50%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
        <Stop offset="35%" stopColor="#D4FFF0" stopOpacity="0.38" />
        <Stop offset="70%" stopColor="#8AEFD4" stopOpacity="0.22" />
        <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.08" />
      </RadialGradient>

      <RadialGradient cx="32%" cy="28%" id="specularHot" r="28%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.78" />
        <Stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.32" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </RadialGradient>

      <RadialGradient cx="65%" cy="22%" id="specularSecondary" r="18%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
        <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.38" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </RadialGradient>

      <RadialGradient cx="50%" cy="85%" id="contactShadow" r="35%">
        <Stop offset="0%" stopColor="#0A5E4D" stopOpacity="0.22" />
        <Stop offset="50%" stopColor="#0A5E4D" stopOpacity="0.08" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0" />
      </RadialGradient>

      <LinearGradient id="edgeBevel" x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.18" />
        <Stop offset="60%" stopColor="#0A9B8A" stopOpacity="0.12" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0.55" />
      </LinearGradient>

      <RadialGradient cx="50%" cy="50%" id="mintGlow" r="55%">
        <Stop offset="0%" stopColor="#5FEDC7" stopOpacity="0.28" />
        <Stop offset="50%" stopColor="#18B894" stopOpacity="0.12" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0" />
      </RadialGradient>

      <LinearGradient id="ribbonBody" x1="0" x2="1" y1="0" y2="0.6">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
        <Stop offset="30%" stopColor="#E8FFF6" stopOpacity="0.72" />
        <Stop offset="60%" stopColor="#A7F9EA" stopOpacity="0.48" />
        <Stop offset="100%" stopColor="#7AE8C8" stopOpacity="0.28" />
      </LinearGradient>

      <RadialGradient cx="45%" cy="40%" id="lensBody" r="55%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
        <Stop offset="25%" stopColor="#F0FFF9" stopOpacity="0.78" />
        <Stop offset="55%" stopColor="#C4FCE8" stopOpacity="0.52" />
        <Stop offset="80%" stopColor="#5FEDC7" stopOpacity="0.28" />
        <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.15" />
      </RadialGradient>
    </Defs>
  );
}
