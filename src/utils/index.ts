/**
 * Utilities Export
 */

// Date utilities
export {
  formatRelativeTime,
  formatDate,
  formatTime,
  formatDateTime,
  isToday,
  isYesterday,
  addDays,
  startOfDay,
  endOfDay,
  parseISO,
  toISO,
} from './date';

// String utilities
export {
  capitalize,
  titleCase,
  truncate,
  removeWhitespace,
  slugify,
  kebabCase,
  camelCase,
  randomString,
  formatNumber,
  formatFileSize,
  maskString,
  getInitials,
  isValidEmail,
  isValidPhone,
} from './string';

// Phase 7 — Haptics & Touch Targets
export {
  triggerHaptic,
  type HapticFeedbackKind,
} from './haptics';
export {
  MIN_TOUCH_TARGET,
  calculateHitSlop,
  getSquareHitSlop,
  getIconHitSlop,
  getTouchTargetProps,
  getMinTouchTargetStyle,
  auditTouchTarget,
  StandardHitSlops,
} from './touchTarget';
