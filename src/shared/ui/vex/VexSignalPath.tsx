import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

export interface VexSignalPathItem { title: string; subtitle: string }

interface VexSignalPathProps {
  items: readonly VexSignalPathItem[];
  currentIndex: number;
  fireThread?: boolean;
}

export function VexSignalPath({ items, currentIndex, fireThread = false }: VexSignalPathProps): React.JSX.Element {
  const { theme } = useTheme();
  if (fireThread) {
    return (
      <View style={{ paddingVertical: theme.spacing[4], position: 'relative' }}>
        <View pointerEvents="none" style={{ backgroundColor: vexFire.ember, bottom: theme.spacing[4], left: '50%', opacity: 0.34, position: 'absolute', top: theme.spacing[4], width: theme.spacing[1] }} />
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          const signalColor = isCurrent || isComplete ? vexFire.ember : vexFire.border;
          const isLeft = index % 2 === 0;
          const copy = <View style={{ alignItems: isLeft ? 'flex-end' : 'flex-start', flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[3] }}><Text color={isCurrent ? vexFire.ember : vexFire.cream} variant="label" style={{ letterSpacing: 1.4, textAlign: isLeft ? 'right' : 'left' }}>{item.title}</Text><Text color={vexFire.textMuted} variant="bodySmall" style={{ textAlign: isLeft ? 'right' : 'left' }}>{item.subtitle}</Text></View>;
          const node = <View style={{ alignItems: 'center', height: isCurrent ? theme.spacing[16] : theme.spacing[12], justifyContent: 'center', width: isCurrent ? theme.spacing[16] : theme.spacing[12] }}>{isCurrent ? <View pointerEvents="none" style={{ borderColor: vexFire.ember, borderRadius: theme.borderRadius.full, borderWidth: 2, height: theme.spacing[16], opacity: 0.38, position: 'absolute', width: theme.spacing[16] }} /> : null}<View style={{ alignItems: 'center', backgroundColor: isCurrent ? vexFire.ember : vexFire.backgroundRaised, borderColor: signalColor, borderRadius: theme.borderRadius.full, borderWidth: isCurrent ? 2 : 1, height: isCurrent ? theme.spacing[12] : theme.spacing[10], justifyContent: 'center', shadowColor: isCurrent ? vexFire.ember : vexFire.shadow, shadowOpacity: isCurrent ? 0.9 : 0, shadowRadius: theme.spacing[4], width: isCurrent ? theme.spacing[12] : theme.spacing[10] }}><Text color={isCurrent ? vexFire.background : vexFire.textSecondary} variant="bodySmall">{index + 1}</Text></View></View>;
          return <View key={item.title} style={{ alignItems: 'center', flexDirection: 'row', minHeight: theme.spacing[16] }}>{isLeft ? copy : <View style={{ flex: 1 }} />}{node}{isLeft ? <View style={{ flex: 1 }} /> : copy}</View>;
        })}
      </View>
    );
  }
  return (
    <View style={{ gap: theme.spacing[1] }}>
      {items.map((item, index) => {
        const isCurrent = index === currentIndex;
        const isComplete = index < currentIndex;
        const signalColor = isCurrent || isComplete ? theme.colors.primary[500] : theme.colors.primary[800];
        return <View key={item.title} style={{ flexDirection: 'row', minHeight: theme.spacing[16] + theme.spacing[1] }}><View style={{ alignItems: 'center', width: theme.spacing[12] }}><View style={{ alignItems: 'center', backgroundColor: isCurrent ? theme.colors.primary[500] : theme.colors.surface.card, borderColor: signalColor, borderRadius: theme.borderRadius.full, borderWidth: isCurrent ? 2 : 1, height: isCurrent ? theme.spacing[10] : theme.spacing[8], justifyContent: 'center', width: isCurrent ? theme.spacing[10] : theme.spacing[8] }}><Text color={isCurrent ? 'text.inverse' : 'text.secondary'} variant="bodySmall">{index + 1}</Text></View>{index < items.length - 1 ? <View style={{ backgroundColor: index < currentIndex ? theme.colors.primary[500] : theme.colors.border.DEFAULT, flex: 1, marginVertical: theme.spacing[1], width: theme.spacing[1] }} /> : null}</View><View style={{ flex: 1, gap: theme.spacing[1], paddingLeft: theme.spacing[3], paddingTop: isCurrent ? 0 : theme.spacing[1] }}><Text color={isCurrent ? 'primary.500' : 'text.primary'} variant="label" style={{ letterSpacing: 1.4 }}>{item.title}</Text><Text color="text.tertiary" variant="bodySmall">{item.subtitle}</Text></View></View>;
      })}
    </View>
  );
}
