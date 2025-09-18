// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pluginPromise from 'eslint-plugin-promise';
import eslintJestPlugin from 'eslint-plugin-jest';
import eslintContainerbase from '@containerbase/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import * as importX from 'eslint-plugin-import-x';
import globals from 'globals';

export default defineConfig(
  {
    ignores: ['dist'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintJestPlugin.configs['flat/recommended'],
  eslintJestPlugin.configs['flat/style'],
  pluginPromise.configs['flat/recommended'],
  eslintContainerbase.configs.all,
  // @ts-expect-error -- wrong types
  importX.flatConfigs.recommended,
  // importX.flatConfigs.typescript,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,js,mjs,cjs}'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      // parserOptions: {
      //   projectService: true,
      //   tsconfigRootDir: import.meta.dirname,
      //   allowDefaultProject: ['*.mjs', 'src/test-utils.ts', '*.spec.ts'],
      //   defaultProject: './tsconfig.lint.json',
      // },
    },

    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
  },
);
