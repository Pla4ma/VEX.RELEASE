/**
 * Social Screen (Disabled at Launch)
 *
 * Social features are disabled at launch. This screen renders a
 * simple "coming soon" placeholder so the route can compile if
 * it is referenced anywhere, but it is gated out of navigation.
 */

import React from 'react';
<<<<<<< HEAD
import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';

export const SocialScreen: React.FC = () => {
  return (
    <LockedFeatureScreen
      feature="social_tab"
      stage="ENGAGED"
      title="Social Features"
      description="Connect with friends and compete in focus challenges"
      whyItMatters="Social features will be available in a future update."
      unlockLabel="Coming soon"
      ctaLabel="Back to focus"
      icon="users"
      onPress={() => undefined}
    />
=======
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
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
  );
};

export default SocialScreen;
