module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js', '**/*.test.ts', '**/*.test.tsx'],
      env: { jest: true },
    },
  ],
  rules: {
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': 'off',
    'no-void': 'off',
  },
};
