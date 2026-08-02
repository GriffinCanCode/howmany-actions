import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Only src/ is TypeScript; the build outputs and the plain-Node scripts under
// test/ are excluded so a stale bundle never fails lint.
export default tseslint.config(
  {
    ignores: ['dist/', 'lib/', 'node_modules/', '**/*.js', '**/*.cjs']
  },
  js.configs.recommended,
  // `base` wires the parser and plugin without turning on any of
  // typescript-eslint's own rules, matching what this repo has always linted.
  tseslint.configs.base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      // Allow console.log for GitHub Actions logging
      'no-console': 'off',
      // Allow unused vars that start with underscore
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Prefer const assertions
      'prefer-const': 'error',
      // Consistent quote style
      quotes: ['error', 'single', { avoidEscape: true }],
      // Consistent comma style
      'comma-dangle': ['error', 'never']
    }
  }
);
