import { Lucia } from 'lucia'
import { D1Adapter } from '@lucia-auth/adapter-sqlite'
import type { Env } from '../routes/index'

export function initializeLucia(env: Env) {
  const adapter = new D1Adapter(env.DB, {
    user: 'users',
    session: 'sessions',
  })

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: env.ENVIRONMENT === 'production',
        sameSite: 'lax',
        httpOnly: true,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
        username: attributes.username,
      }
    },
  })
}

export interface DatabaseUserAttributes {
  email: string
  username: string
}

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}