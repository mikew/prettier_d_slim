module.exports = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {},
  plugins: ['simple-import-sort'],
  ignorePatterns: ['lib/', 'old/'],
  extends: [
    'plugin:@typescript-eslint/recommended',

    // Disables rules that TypeScript already checks.
    'plugin:@typescript-eslint/eslint-recommended',

    // disables rules that prettier fixes.
    // others disable rules that common eslint configs set.
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        // Allow function hoisting.
        functions: false,
        classes: false,
        variables: false,
        typedefs: false,
      },
    ],
    'simple-import-sort/sort': [
      'warn',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],

          // Node.js builtins.
          [`^(${require('module').builtinModules.join('|')})(/|$)`],

          // Packages.
          // Things that start with a letter (or digit or underscore), or `@`
          // followed by a letter.
          ['^@?\\w'],

          // Local packages.
          ['^(@src)(/.*|$)'],

          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],

          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
        ],
      },
    ],
    // '@typescript-eslint/no-explicit-any': 'off',
  },
}
