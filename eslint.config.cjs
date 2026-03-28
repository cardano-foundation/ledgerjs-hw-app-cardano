// ESLint flat config (ESLint 9+). Legacy .eslintrc content migrated via FlatCompat.
const {FlatCompat} = require('@eslint/eslintrc')
const path = require('path')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = [
  {
    ignores: ['dist/**', 'docs_generated/**', '_typedoc/**', 'node_modules/**'],
  },
  ...compat.config({
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:import/typescript',
      'vacuumlabs',
      'prettier',
    ],
    env: {
      es6: true,
      node: true,
      mocha: true,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: true,
        },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      'import/no-cycle': ['error'],
      'import/no-extraneous-dependencies': ['error'],
      'no-duplicate-imports': 'off',
      'import/no-duplicates': ['error'],
      'spaced-comment': ['error', 'always', {block: {balanced: true}}],
      'quote-props': ['error', 'consistent'],
      '@typescript-eslint/no-redeclare': ['error'],

      'consistent-return': 'off',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
    plugins: ['import'],
  }),
]
