import React from 'react';
import { View, Text } from 'react-native';
import { render } from '@testing-library/react-native';

describe('Test environment smoke', () => {
  it('renders View with Text', () => {
    const { getByText } = render(
      <View testID="smoke-view">
        <Text>Smoke Test</Text>
      </View>
    );
    expect(getByText('Smoke Test')).toBeTruthy();
  });

  it('renders NavigationContainer mock screen', () => {
    const { NavigationContainer } = require('@react-navigation/native');
    const { createNativeStackNavigator } = require('@react-navigation/native-stack');
    const Stack = createNativeStackNavigator();
    const TestScreen = () => (
      <View testID="test-screen">
        <Text>Navigation works</Text>
      </View>
    );
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    expect(getByText('Navigation works')).toBeTruthy();
  });

  it('has ImageLoader turbo module mock', () => {
    expect(global.__turboModuleProxy).toBeDefined();
    const loader = (global as any).__turboModuleProxy('ImageLoader');
    expect(loader).toBeDefined();
    expect(loader.getConstants).toBeDefined();
  });

  it('has NativeAnimatedHelper mock', () => {
    expect(() => require('react-native/Libraries/Animated/NativeAnimatedHelper')).not.toThrow();
  });

  it('has Reanimated mock', () => {
    const reanimated = require('react-native-reanimated');
    expect(reanimated.useSharedValue).toBeDefined();
  });

  it('has Gesture Handler mock', () => {
    const gh = require('react-native-gesture-handler');
    expect(gh.Gesture).toBeDefined();
  });

  it('has Safe Area Context mock', () => {
    const sac = require('react-native-safe-area-context');
    expect(sac.SafeAreaProvider).toBeDefined();
  });
});
