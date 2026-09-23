import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['js/**/*.js', 'bombus/js/**/*.js'],
    ignores: ['**/*.test.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        performance: 'readonly',
      },
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
      },
    },
  },
];
