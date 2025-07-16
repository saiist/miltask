import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/*.ts',
  out: './src/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: ':memory:',
  },
} satisfies Config;