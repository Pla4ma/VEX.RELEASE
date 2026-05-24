/**
 * Z-Index Tokens
 *
 * Layer management for consistent stacking context.
 */

import type { ZIndexScale } from '../types';

/**
 * Z-index scale for consistent layer management
 */
export const zIndex: ZIndexScale = {
  auto: 'auto',
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
};

/**
 * Component-specific z-index values
 */
export const componentZIndex = {
  // Navigation
  header: zIndex.sticky,
  tabBar: zIndex.sticky,

  // Overlays
  modal: zIndex.modal,
  modalBackdrop: zIndex.modalBackdrop,
  bottomSheet: zIndex.modal,
  dialog: zIndex.modal,

  // Floating elements
  tooltip: zIndex.tooltip,
  popover: zIndex.popover,
  toast: zIndex.toast,
  notification: zIndex.toast,

  // Dropdowns
  select: zIndex.dropdown,
  menu: zIndex.dropdown,
  autocomplete: zIndex.dropdown,

  // Sticky elements
  stickyHeader: zIndex.sticky,
  stickyFooter: zIndex.sticky,
};

/**
 * Get z-index value as number for React Native
 */
export function getZIndex(key: keyof ZIndexScale): number {
  const value = zIndex[key];
  return typeof value === 'number' ? value : 0;
}
