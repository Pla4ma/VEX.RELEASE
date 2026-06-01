/**
 * Focus navigation and element registration utilities.
 */

import type { FocusableElement } from './types';

const focusableElements = new Map<string, FocusableElement[]>();

export function registerFocusableElement(
  screenId: string,
  element: FocusableElement,
): void {
  const elements = focusableElements.get(screenId) || [];
  elements.push(element);
  elements.sort((a, b) => a.order - b.order);
  focusableElements.set(screenId, elements);
}

export function getNextFocusableElement(
  screenId: string,
  currentId: string,
): FocusableElement | null {
  const elements = focusableElements.get(screenId) || [];
  const currentIndex = elements.findIndex((e) => e.id === currentId);
  if (currentIndex === -1) {
    return elements[0] || null;
  }
  return elements[currentIndex + 1] || elements[0] || null;
}

export function getPreviousFocusableElement(
  screenId: string,
  currentId: string,
): FocusableElement | null {
  const elements = focusableElements.get(screenId) || [];
  const currentIndex = elements.findIndex((e) => e.id === currentId);
  if (currentIndex === -1) {
    return elements[elements.length - 1] || null;
  }
  return elements[currentIndex - 1] || elements[elements.length - 1] || null;
}
