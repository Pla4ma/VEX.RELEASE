import React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface RootAuthLoadingScreenProps {
  background: string;
  primary: string;
}

export function RootAuthLoadingScreen({
  background,
  primary,
}: RootAuthLoadingScreenProps): JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: background,
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color={primary} size="large" />
    </View>
  );
}
