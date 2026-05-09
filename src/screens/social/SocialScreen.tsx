/**
 * Social Screen (Disabled at Launch)
 *
 * Social features are disabled at launch. This screen renders a
 * simple "coming soon" placeholder so the route can compile if
 * it is referenced anywhere, but it is gated out of navigation.
 */

import React from 'react';
import { View } from 'react-native';
import { Box, Text } from '../../components/primitives';

export const SocialScreen: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <Box flex={1} alignItems="center" justifyContent="center" px="lg">
        <Text variant="h2">Social Features</Text>
        <Text variant="body" color="text.secondary">
          Social features will be available in a future update.
        </Text>
      </Box>
    </View>
  );
};

export default SocialScreen;
