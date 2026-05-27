module.exports = {
  root: true,
  extends: ['@react-native'],
  rules: {
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'warn',
    'no-new-func': 'warn',
    'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['src/utils/haptics.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: ['src/utils/haptics.ts'],
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