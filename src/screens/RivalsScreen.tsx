/**
 * Rivals Screen (Disabled at Launch)
 *
 * Rivals features are disabled at launch. This screen renders a
 * simple "coming soon" placeholder so the route can compile if
 * it is referenced anywhere, but it is gated out of navigation.
 */

import React from 'react';
import { View } from 'react-native';
import { Box, Text } from '../components/primitives';

export const RivalsScreen: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <Box flex={1} alignItems="center" justifyContent="center" px="lg">
        <Text variant="h2">Rivals</Text>
        <Text variant="body" color="text.secondary">
          Rivals features will be available in a future update.
        </Text>
      </Box>
    </View>
  );
};

export default RivalsScreen;
