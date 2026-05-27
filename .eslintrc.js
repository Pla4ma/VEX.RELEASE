module.exports = {
  root: true,
  extends: ['@react-native'],
  rules: {
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'no-new-func': 'warn',
    'react-native/no-inline-styles': 'off',
  },
  ignorePatterns: ['archive/**', 'node_modules/**', 'dist/**'],
};
