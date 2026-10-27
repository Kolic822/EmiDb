import { defineConfig } from 'vitest/config';

/** Unit tests for the shared domain logic (filters, formatting). */
export default defineConfig({
  test: {
    include: ['packages/shared/src/**/*.spec.ts'],
  },
});
