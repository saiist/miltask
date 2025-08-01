import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from '../auth/routes'
import tasksRoutes from './tasks'
import gamesRoutes from './games'
import recurringTasksRoutes from './recurring-tasks'
import statisticsRoutes from './statistics'
import animeRoutes from './anime'
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
app.use('/api/tasks/*', authMiddleware)
app.route('/api/tasks', tasksRoutes)
app.use('/api/recurring-tasks/*', authMiddleware)
app.route('/api/recurring-tasks', recurringTasksRoutes)

// Game routes (some public, some protected)
app.route('/api/games', gamesRoutes)

// Statistics routes
app.use('/api/statistics/*', authMiddleware)
app.route('/api/statistics', statisticsRoutes)

// Anime routes
app.route('/api/anime', animeRoutes)

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app