import nx from '@nx/eslint-plugin';
import angularRecommendedPlugin from '@angular-eslint/eslint-plugin';
import eslint from '@eslint/js';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';
// import htmlPlugin from 'eslint-plugin-html';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

const { browser, node } = globals;
const { configs } = eslint;

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.base.json',
      },
      // globals: {
      //   ...browser,
      //   ...node,
      // },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      '@angular-eslint': angularRecommendedPlugin,
      prettier: prettierPlugin,
      tsdoc,
      jsdoc,
    },
    rules: {
      ...configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...angularRecommendedPlugin.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      ...jsdoc.configs.recommended.rules,
      'jsdoc/require-hyphen-before-param-description': 'warn',
      'jsdoc/require-asterisk-prefix': 'warn',
      'jsdoc/require-description': 'warn',
      // 'jsdoc/require-description-complete-sentence': 'warn',
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true, // Only require JSDoc for public-facing (exported) members
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > ClassDeclaration',
            'ExportNamedDeclaration > VariableDeclaration',
          ],
          exemptEmptyConstructors: true,
          checkGetters: false,
          checkSetters: false,
        },
      ],
      'jsdoc/no-bad-blocks': 'warn',
      'jsdoc/no-blank-block-descriptions': 'warn',
      'jsdoc/no-defaults': 'warn',
      'jsdoc/informative-docs': 'warn',
      // 'jsdoc/match-description': 'warn',
      'jsdoc/check-syntax': 'warn',
      'tsdoc/syntax': 'warn',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-param-type': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['app', 'met', 'mdl'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['app', 'met', 'mdl'], style: 'kebab-case' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-alert': 'warn',
      'prettier/prettier': 'warn',
    },
  },
];
