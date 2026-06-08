import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '../../../components/primitives/Text';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { Icon } from '../../../icons';

interface ProgressionStatCardProps {
  label: string;
  orb: 'mint' | 'cyan' | 'fire' | 'amber' | 'lavender' | 'pearl';
  value: string;
  progress?: number;
}

export const ProgressionStatCard: React.FC<ProgressionStatCardProps> = ({
  label,
  orb,
  value,
  progress = 0.65,
}) => {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.40)',
        borderColor: 'rgba(255, 255, 255, 0.90)',
        borderRadius: 18,
        borderWidth: 1.5,
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 14,
        gap: 8,
      }}
    >
      <View style={{ position: 'relative', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(10, 155, 138, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0A9B8A"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={{ position: 'absolute' }}>
          <Icon color="#0A9B8A" name="sparkles" size="sm" strokeWidth="thin" variant="outline" />
        </View>
      </View>
      <Text
        style={{
          color: '#0A1F1A',
          fontSize: 16,
          fontWeight: '900',
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: '#3D5A52',
          fontSize: 11,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default ProgressionStatCard;
