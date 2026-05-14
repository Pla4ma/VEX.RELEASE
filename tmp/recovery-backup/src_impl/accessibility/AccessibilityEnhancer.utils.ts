import React from 'react';

export function generateAccessibilityLabel(options: {
  children?: React.ReactNode;
  title?: string;
  props: Record<string, unknown>;
}): string {
  const { children, title, props } = options;

  if (title) {
    return title;
  }

  if (children && typeof children === 'string') {
    return children;
  }

  if (typeof props['placeholder'] === 'string') {
    return props['placeholder'];
  }

  if (typeof props['value'] === 'string') {
    return props['value'];
  }

  return 'Interactive element';
}

export function generateAccessibilityHint(props: Record<string, unknown>): string {
  if (props.onPress) {
    return 'Activates this control';
  }

  if (props.onLongPress) {
    return 'Long press activates this control';
  }

  if (props.onValueChange) {
    return 'Adjusts this setting';
  }

  if (props.onChangeText) {
    return 'Text input field';
  }

  return 'Interactive control';
}

export function inferSemanticRole(props: Record<string, unknown>): string {
  if (props.onPress) {
    return 'button';
  }

  if (props.onChangeText || props.value !== undefined) {
    return 'textbox';
  }

  if (props.onValueChange) {
    if (props.value === true || props.value === false) {
      return 'switch';
    }
    return 'slider';
  }

  if (props.selected !== undefined) {
    return 'radio';
  }

  return 'generic';
}
