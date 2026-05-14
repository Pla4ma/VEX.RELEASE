import { 
  type ScreenReaderAnnouncement, 
  type FocusableElement, 
  type AccessibilityPreferences 
} from './AccessibilitySystem.types';

export const announcements: ScreenReaderAnnouncement[] = [];

export const focusableElements = new Map<string, FocusableElement[]>();

export const userPreferences = new Map<string, AccessibilityPreferences>();
