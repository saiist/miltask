import { Hono } from 'hono'
import { cors } from 'hono/cors'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  ENVIRONMENT: string
  [key: string]: any
}

const app = new Hono<{ Bindings: Env }>()

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

// API routes
app.get('/api/tasks', async (c) => {
  // TODO: Implement task list
  return c.json({
    tasks: [
      {
        id: '1',
        title: 'サンプルタスク',
        type: 'anime',
        completed: false
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