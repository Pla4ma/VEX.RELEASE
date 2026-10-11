const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores([
    'archive/**',
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'android/**',
    'ios/**',
    '.expo/**',
  ]),
  expoConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Keep the project's established TypeScript and React enforcement rules.
      'prettier/prettier': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-new-func': 'warn',

      // New React Compiler-era rules that the old config never enforced
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutable-arguments': 'off',

      // Re-export conflicts in token barrels are intentional (export * patterns)
      'import/export': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-unresolved': 'off',
      'import/first': 'off',

      // Cosmetic rules producing noise on legacy code
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
    },
  },
  {
    // Zustand stores: actions destructured in partialize() are intentionally
    // unused there (they're excluded from persisted state). False positive.
    files: ['src/**/store.ts', 'src/**/*-store.ts', 'src/**/*.store.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/utils/haptics.ts', 'src/utils/haptics-types.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Animated', 'AsyncStorage', 'FlatList'],
              message:
                'Use Reanimated (not RN Animated), MMKV (not AsyncStorage), FlashList (not FlatList)',
            },
            {
              name: 'expo-haptics',
              message: 'Use src/utils/haptics.ts named functions instead',
            },
          ],
        },
      ],
    },
  },
]);
