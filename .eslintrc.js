module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  env: {
    node: true,
    es2022: true
  },
  rules: {
    // Allow console.log for GitHub Actions logging
    'no-console': 'off',
    // Allow unused vars that start with underscore
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    // Prefer const assertions
    'prefer-const': 'error',
    // Consistent quote style
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    // Consistent comma style
    'comma-dangle': ['error', 'never']
  },
  ignorePatterns: [
    'dist/',
    'lib/',
    'node_modules/',
    '*.js'
  ]
}; 