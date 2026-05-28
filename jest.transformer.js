const babelJest = require('babel-jest');

function vitestMockHoistPlugin({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'vi' }) &&
          (
            t.isIdentifier(callee.property, { name: 'mock' }) ||
            t.isIdentifier(callee.property, { name: 'unmock' })
          )
        ) {
          callee.object = t.identifier('jest');
        }
      },
    },
  };
}

module.exports = babelJest.createTransformer({
  presets: ['babel-preset-expo'],
  plugins: [
    vitestMockHoistPlugin,
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@theme': './src_impl/theme',
          '@components': './src_impl/components',
          '@navigation': './src_impl/navigation',
          '@store': './src_impl/store',
          '@utils': './src_impl/utils',
          '@types': './src_impl/types',
          '@constants': './src_impl/constants',
          '@overlays': './src_impl/overlays',
          '@animation': './src_impl/animation',
          '@icons': './src_impl/icons',
          '@a11y': './src_impl/a11y',
          '@events': './src_impl/events',
          '@analytics': './src_impl/analytics',
          '@featureFlags': './src_impl/featureFlags',
          '@settings': './src_impl/settings',
          '@persistence': './src_impl/persistence',
          '@network': './src_impl/network',
          '@errors': './src_impl/errors',
          '@states': './src_impl/states',
          '@shell': './src_impl/shell',
          '@app': './src_impl/app',
          '@screens': './src_impl/screens',
          '@validation': './src_impl/validation',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
});
