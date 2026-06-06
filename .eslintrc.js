module.exports = {
  root: true,
  extends: ['@react-native'],
  rules: {
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/react-in-jsx-scope': 'off',
    'no-new-func': 'warn',
    'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['src/utils/haptics.ts', 'src/utils/haptics-types.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: ['src/utils/haptics.ts', 'src/utils/haptics-types.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'react-native', importNames: ['Animated', 'AsyncStorage', 'FlatList'], message: 'Use Reanimated (not RN Animated), MMKV (not AsyncStorage), FlashList (not FlatList)' },
              { name: 'expo-haptics', message: 'Use src/utils/haptics.ts named functions instead' },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: ['archive/**', 'node_modules/**', 'dist/**'],
};