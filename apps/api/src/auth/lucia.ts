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
        id: attributes.id,
        email: attributes.email,
        username: attributes.username,
      }
    },
  })
}

export interface DatabaseUserAttributes {
  id: string
  email: string
  username: string
}

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}