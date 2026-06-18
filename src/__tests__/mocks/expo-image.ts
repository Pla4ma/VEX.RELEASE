/**
 * Jest mock for expo-image
 *
 * Replaces the native Image with a simple RN Image reference.
 */
import React from 'react';

function Image(props: Record<string, unknown>) {
  return React.createElement('Image', props);
}

Image.prefetch = jest.fn();
Image.clearCache = jest.fn(() => Promise.resolve());

export { Image };
export default Image;
