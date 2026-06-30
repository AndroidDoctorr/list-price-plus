import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['adapters/**/*.test.ts', 'utils/**/*.test.ts'],
  },
});
