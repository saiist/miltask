import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { generateId } from 'lucia'
import { Scrypt } from 'lucia'
import { initializeLucia } from './lucia'
import type { Env } from '../routes/index'

const authRoutes = new Hono<{ Bindings: Env }>()

// Signup schema
const signupSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  username: z.string().min(3, 'ユーザー名は3文字以上で入力してください').max(20, 'ユーザー名は20文字以下で入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください').max(100, 'パスワードは100文字以下で入力してください'),
})

// Login schema
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

// Signup endpoint
authRoutes.post('/signup', zValidator('json', signupSchema), async (c) => {
  try {
    const { email, username, password } = c.req.valid('json')
    const lucia = initializeLucia(c.env)
    
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first()
    
    if (existingUser) {
      return c.json({ error: 'このメールアドレスまたはユーザー名は既に使用されています' }, 400)
    }
    
    // Hash password
    const scrypt = new Scrypt()
    const hashedPassword = await scrypt.hash(password)
    
    // Create user
    const userId = generateId(15)
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, username, hashed_password) VALUES (?, ?, ?, ?)'
    ).bind(userId, email, username, hashedPassword).run()
    
    // Create session
    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    
    c.header('Set-Cookie', sessionCookie.serialize())
    
    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        username,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: 'サインアップに失敗しました' }, 500)
  }
})

// Login endpoint
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')
    const lucia = initializeLucia(c.env)
    
    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, hashed_password FROM users WHERE email = ?'
    ).bind(email).first() as { id: string, email: string, username: string, hashed_password: string } | null
    
    if (!user) {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 400)
    }
    
    // Verify password
    const scrypt = new Scrypt()
    const validPassword = await scrypt.verify(user.hashed_password, password)
    if (!validPassword) {
      return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 400)
    }
    
    // Create session
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    
    c.header('Set-Cookie', sessionCookie.serialize())
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'ログインに失敗しました' }, 500)
  }
})

// Logout endpoint
authRoutes.post('/logout', async (c) => {
  try {
    const lucia = initializeLucia(c.env)
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '')
    
    if (!sessionId) {
      return c.json({ error: 'セッションが見つかりません' }, 400)
    }
    
    await lucia.invalidateSession(sessionId)
    const sessionCookie = lucia.createBlankSessionCookie()
    
    c.header('Set-Cookie', sessionCookie.serialize())
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'ログアウトに失敗しました' }, 500)
  }
})

// Get current user
authRoutes.get('/me', async (c) => {
  try {
    const lucia = initializeLucia(c.env)
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '')
    
    if (!sessionId) {
      return c.json({ error: 'セッションが見つかりません' }, 401)
    }
    
    const { session, user } = await lucia.validateSession(sessionId)
    
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      c.header('Set-Cookie', sessionCookie.serialize())
      return c.json({ error: 'セッションが無効です' }, 401)
    }
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'ユーザー情報の取得に失敗しました' }, 500)
  }
})

export default authRoutes