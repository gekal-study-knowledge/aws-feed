import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off', // Next.js does not require React in scope
    },
  },
  configPrettier,
  {
    settings: {
      react: {
        // 'detect' は eslint-plugin-react が ESLint 10 で消えた API を呼ぶため使えない
        version: '19.2',
      },
    },
  },
  {
    // next-env.d.ts は Next.js が生成する（.gitignore 対象）ので整形の対象外にする
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'public/**', 'next-env.d.ts'],
  },
];
