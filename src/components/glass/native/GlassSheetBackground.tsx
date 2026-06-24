import React from 'react';
import type { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { NativeGlassSurface } from './NativeGlassSurface';

/**
 * Glass background for @gorhom/bottom-sheet.
 * Pass as `backgroundComponent={<GlassSheetBackground />}`.
 * Renders NativeGlassSurface variant="sheet" with the style
 * that @gorhom/bottom-sheet provides (borderRadius, overflow, etc.).
 */
export const GlassSheetBackground = React.memo(function GlassSheetBackground({
  pointerEvents,
  style,
}: BottomSheetBackgroundProps): React.ReactNode {
  return (
    <NativeGlassSurface
      variant="sheet"
      pointerEvents={pointerEvents}
      style={style}
    />
  );
});
