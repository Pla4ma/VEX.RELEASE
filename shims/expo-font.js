/**
 * expo-font shim for Expo Go / remote-debug
 *
 * The real expo-font calls requireNativeModule('ExpoFontLoader') at module
 * evaluation time (ExpoFontLoader.js top-level). This fires before the
 * native bridge is ready, crashing with:
 *   ERROR [runtime not ready]: TypeError: undefined is not a function
 *
 * This shim provides stub implementations of the expo-font API so the app
 * can load without crashing. Custom fonts won't work in Expo Go, but the
 * app will render with system fonts.
 */

// Stub font loading - no-ops in Expo Go
const loadedFonts = {};

export function isLoaded(_fontFamily) {
  return false;
}

export function getLoadedFonts() {
  return Object.keys(loadedFonts);
}

export function isLoading(_fontFamily) {
  return false;
}

export function loadAsync(fontFamilyOrFontMap, _source) {
  if (typeof fontFamilyOrFontMap === 'object') {
    // Map of font names to sources
    Object.keys(fontFamilyOrFontMap).forEach(name => {
      loadedFonts[name] = true;
    });
    return Promise.resolve();
  }
  // Single font
  loadedFonts[fontFamilyOrFontMap] = true;
  return Promise.resolve();
}

export async function unloadAllAsync() {
  Object.keys(loadedFonts).forEach(key => delete loadedFonts[key]);
}

export async function unloadAsync(fontFamilyOrFontMap, _options) {
  if (typeof fontFamilyOrFontMap === 'object') {
    Object.keys(fontFamilyOrFontMap).forEach(name => {
      delete loadedFonts[name];
    });
  } else {
    delete loadedFonts[fontFamilyOrFontMap];
  }
}

export const FontDisplay = {
  AUTO: 'auto',
  BLOCK: 'block',
  SWAP: 'swap',
  FALLBACK: 'fallback',
  OPTIONAL: 'optional',
};

// useFonts hook - returns [loaded, error]
export function useFonts(_sources) {
  return [true, null];
}
