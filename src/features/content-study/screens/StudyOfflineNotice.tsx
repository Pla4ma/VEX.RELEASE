import React from 'react';
import { Text, View } from 'react-native';

import { vexFire } from '@/theme/tokens/vex-fire';

export function StudyOfflineNotice({ message }: { message: string }): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', backgroundColor: vexFire.backgroundSoft, paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text style={{ color: vexFire.amber, fontSize: 13, fontWeight: '500' }}>
        {message}
      </Text>
    </View>
  );
}
