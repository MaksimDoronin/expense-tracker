// @ts-check
const nextConfig = require('eslint-config-next');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...nextConfig,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
