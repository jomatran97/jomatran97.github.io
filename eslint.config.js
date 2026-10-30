import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist', '.astro', 'node_modules', '.lighthouseci', 'playwright-report'] },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];
