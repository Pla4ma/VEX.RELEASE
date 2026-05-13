/**
 * Mobile Optimized Container
 * Ensures proper mobile UX: keyboard handling, safe areas, touch targets
 */

import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createSheet } from '@/shared/ui/create-sheet';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  avoidHeader?: boolean;
  avoidBottomNav?: boolean;
  padding?: number;
  backgroundColor?: string;
}

const { height, width } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isTablet = width > 768;
const styles = createSheet({
  container: {
    flex: 1,
    minHeight: isSmallScreen ? 'auto' : '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
});

/**
 * Mobile Touch Target Wrapper
 * Ensures minimum 44x44 touch targets for accessibility
 */
interface TouchTargetProps {
  children: React.ReactNode;
  minSize?: number;
  onPress?: () => void;
}

/**
 * Mobile Grid - Responsive grid for mobile layouts
 */
interface MobileGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

export * from "./MobileOptimizedContainer.part1";
