import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '../components/ui/Skeleton';

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
      <Skeleton width={40} height={40} variant="circular" />
    </View>
  );
}
