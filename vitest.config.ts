/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig loads the Astro plugins, so tests can import .astro components (Container API).
export default getViteConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
