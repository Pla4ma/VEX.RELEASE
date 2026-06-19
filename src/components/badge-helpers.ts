import React from 'react';

export function getAccessibilityLabel(
  children: React.ReactNode,
  fallback: string,
): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  return fallback;
}