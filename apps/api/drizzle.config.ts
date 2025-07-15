import type { Config } from 'drizzle-kit'

export default {
  schema: './src/database/schema.ts',
  out: './migrations',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/otaku-secretary.sqlite',
  },
} satisfies Config