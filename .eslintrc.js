module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  extends: [
    'standard',
  ],
  plugins: [
    'jest',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
  },
}
