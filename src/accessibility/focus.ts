/**
 * Focus Management
 *
 * Focus navigation and management utilities
 */

import { FocusableElement } from './types';

const focusableElements: FocusableElement[] = [];

/**
 * Register a focusable element
 */
export function registerFocusableElement(element: FocusableElement): void {
  // Remove existing element with same ID
  const existingIndex = focusableElements.findIndex(el => el.id === element.id);
  if (existingIndex !== -1) {
    focusableElements.splice(existingIndex, 1);
  }

  focusableElements.push(element);
}

/**
 * Get next focusable element
 */
export function getNextFocusableElement(currentId?: string): FocusableElement | null {
  if (focusableElements.length === 0) {
    return null;
  }

  if (!currentId) {
    return focusableElements[0] ?? null;
  }

  const currentIndex = focusableElements.findIndex(el => el.id === currentId);
  if (currentIndex === -1) {
    return focusableElements[0] ?? null;
  }

  const nextIndex = (currentIndex + 1) % focusableElements.length;
  return focusableElements[nextIndex] ?? null;
}

/**
 * Get previous focusable element
 */
export function getPreviousFocusableElement(currentId?: string): FocusableElement | null {
  if (focusableElements.length === 0) {
    return null;
  }

  if (!currentId) {
    return focusableElements[focusableElements.length - 1] ?? null;
  }

  const currentIndex = focusableElements.findIndex(el => el.id === currentId);
  if (currentIndex === -1) {
    return focusableElements[focusableElements.length - 1] ?? null;
  }

  const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
  return focusableElements[prevIndex] ?? null;
}

/**
 * Unregister a focusable element
 */
export function unregisterFocusableElement(elementId: string): void {
  const index = focusableElements.findIndex(el => el.id === elementId);
  if (index !== -1) {
    focusableElements.splice(index, 1);
  }
}

/**
 * Get all registered focusable elements
 */
export function getFocusableElements(): FocusableElement[] {
  return [...focusableElements];
}
