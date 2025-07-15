import { Context, Next } from 'hono'
import { initializeLucia } from './lucia'
import type { Env } from '../routes/index'
import type { User, Session } from 'lucia'

interface Variables {
  user: User | null
  session: Session | null
  [key: string]: any
}

export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const lucia = initializeLucia(c.env)
  const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '')

  if (!sessionId) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const { session, user } = await lucia.validateSession(sessionId)

    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      c.header('Set-Cookie', sessionCookie.serialize())
      return c.json({ error: 'セッションが無効です' }, 401)
    }

    // Fresh session - extend session
    if (session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)
      c.header('Set-Cookie', sessionCookie.serialize())
    }

    // Add user to context
    c.set('user', user)
    c.set('session', session)

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: '認証処理でエラーが発生しました' }, 500)
  }
}

export function optionalAuthMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const lucia = initializeLucia(c.env)
  const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '')

  if (!sessionId) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }

  return lucia.validateSession(sessionId).then(({ session, user }) => {
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      c.header('Set-Cookie', sessionCookie.serialize())
      c.set('user', null)
      c.set('session', null)
    } else {
      // Fresh session - extend session
      if (session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        c.header('Set-Cookie', sessionCookie.serialize())
      }
      c.set('user', user)
      c.set('session', session)
    }
    return next()
  }).catch((error) => {
    console.error('Optional auth middleware error:', error)
    c.set('user', null)
    c.set('session', null)
    return next()
  })
}