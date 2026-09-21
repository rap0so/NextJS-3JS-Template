import { configs, plugins } from 'eslint-config-airbnb-extended';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'coverage/**', 'node_modules/**', 'next-env.d.ts'],
  },

  /**
   * airbnb-extended ships rules and plugin registrations as separate exports,
   * so the plugins have to be installed into the config before any rule that
   * references them.
   */
  plugins.stylistic,
  plugins.importX,
  plugins.node,
  plugins.react,
  plugins.reactA11y,
  plugins.reactHooks,
  plugins.next,
  plugins.typescriptEslint,

  /**
   * Airbnb (flat) + React + React Hooks + jsx-a11y + import-x + @next/next
   * + typescript-eslint. `configs.next.all` is `recommended` (which carries the
   * Next.js plugin rules) plus `typescript` -- using only `.typescript` would
   * silently drop every Next.js rule.
   */
  ...configs.next.all,

  {
    name: 'project/settings',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    name: 'project/rules',
    rules: {
      // The App Router's file conventions are default-exported single components.
      'import-x/prefer-default-export': 'off',
      // Next resolves `react` itself; JSX transform makes the import unnecessary.
      'react/react-in-jsx-scope': 'off',
      // Props spreading is the idiomatic way to write wrapper/polymorphic components.
      'react/jsx-props-no-spreading': 'off',
      // TS interfaces already document the props; defaultProps is gone in React 19.
      'react/require-default-props': 'off',
      // devDependencies are legitimate in config, test and story files.
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.config.{ts,mts,js,mjs}',
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            '**/vitest.setup.ts',
            '**/test/**',
            // @theatre/studio is deliberately a devDependency: the editor must
            // never ship. See next.config.ts and src/lib/theatre/studio.ts.
            '**/src/lib/theatre/studio.ts',
          ],
        },
      ],
      // Theatre.js studio is a dev-only side-effect import.
      'import-x/no-import-module-exports': 'off',
    },
  },

  {
    name: 'project/tests',
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'vitest.setup.ts'],
    rules: {
      'no-underscore-dangle': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Stubs for browser APIs jsdom lacks are intentionally stateless.
      'class-methods-use-this': 'off',
    },
  },

  {
    // Type-aware linting needs a tsconfig project; plain JS config files are not in one.
    name: 'project/js-config-files',
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Must stay last: turns off every rule that would fight Prettier.
  prettierConfig,
);
