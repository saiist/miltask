import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from '../auth/routes'
import { authMiddleware } from '../auth/middleware'
import type { User, Session } from 'lucia'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  ENVIRONMENT: string
  [key: string]: any
}

interface Variables {
  user: User | null
  session: Session | null
  [key: string]: any
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))

// Health check
app.get('/health', (c) => c.json({ 
  status: 'ok',
  environment: c.env.ENVIRONMENT,
  timestamp: new Date().toISOString()
}))

// Auth routes
app.route('/auth', authRoutes)

// Protected API routes
app.get('/api/tasks', authMiddleware, async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  
  return c.json({
    tasks: [
      {
        id: '1',
        title: 'サンプルタスク',
        type: 'anime',
        completed: false,
        userId: user.id
      }
    ]
  })
})

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app