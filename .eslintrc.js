module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'standard-with-typescript',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
  },
}
