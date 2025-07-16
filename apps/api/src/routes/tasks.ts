import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { tasks } from '@otaku-secretary/database';
import type { Env } from './index';
import type { User, Session } from 'lucia';

interface Variables {
  user: User | null;
  session: Session | null;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const createTaskSchema = z.object({
  type: z.enum(['anime', 'game-daily', 'book-release']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  deadline: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  deadline: z.string().datetime().optional(),
  completed: z.boolean().optional(),
});

const taskQuerySchema = z.object({
  type: z.enum(['anime', 'game-daily', 'book-release']).optional(),
  completed: z.string().transform(val => val === 'true').optional(),
  date: z.string().optional(), // YYYY-MM-DD format
  limit: z.string().transform(val => parseInt(val, 10)).default('50'),
  offset: z.string().transform(val => parseInt(val, 10)).default('0'),
});

// Helper function to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Helper function to get today's date range
function getTodayRange() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start: startOfDay,
    end: endOfDay,
  };
}

// GET /api/tasks/today - 今日のタスク取得
app.get('/today', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const db = drizzle(c.env.DB);
  const { start, end } = getTodayRange();

  try {
    const todayTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          gte(tasks.createdAt, start),
          lte(tasks.createdAt, end)
        )
      )
      .orderBy(
        sql`CASE ${tasks.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`,
        desc(tasks.createdAt)
      );

    // Calculate summary
    const total = todayTasks.length;
    const completed = todayTasks.filter(task => task.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Parse metadata for each task
    const tasksWithMetadata = todayTasks.map(task => ({
      ...task,
      metadata: task.metadata ? JSON.parse(task.metadata) : null,
      deadline: task.deadline ? new Date(task.deadline * 1000).toISOString() : null,
    }));

    return c.json({
      tasks: tasksWithMetadata,
      summary: {
        total,
        completed,
        completionRate,
      },
    });
  } catch (error) {
    console.error('Error fetching today tasks:', error);
    return c.json({ error: 'タスクの取得に失敗しました' }, 500);
  }
});

// GET /api/tasks - タスク一覧取得（フィルタ可）
app.get('/', zValidator('query', taskQuerySchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const { type, completed, date, limit, offset } = c.req.valid('query');
  const db = drizzle(c.env.DB);

  try {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id));

    // Apply filters
    const conditions = [eq(tasks.userId, user.id)];
    
    if (type) {
      conditions.push(eq(tasks.type, type));
    }
    
    if (completed !== undefined) {
      conditions.push(eq(tasks.completed, completed));
    }
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(
        gte(tasks.createdAt, startOfDay),
        lte(tasks.createdAt, endOfDay)
      );
    }

    const result = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    const tasksWithMetadata = result.map(task => ({
      ...task,
      metadata: task.metadata ? JSON.parse(task.metadata) : null,
      deadline: task.deadline ? new Date(task.deadline * 1000).toISOString() : null,
    }));

    return c.json({
      tasks: tasksWithMetadata,
      pagination: {
        limit,
        offset,
        count: result.length,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ error: 'タスクの取得に失敗しました' }, 500);
  }
});

// POST /api/tasks - タスク作成
app.post('/', zValidator('json', createTaskSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const data = c.req.valid('json');
  const db = drizzle(c.env.DB);

  try {
    const taskId = generateId();
    const now = new Date();
    const deadline = data.deadline ? new Date(data.deadline) : null;

    const newTask = {
      id: taskId,
      userId: user.id,
      type: data.type,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      deadline: deadline ? Math.floor(deadline.getTime() / 1000) : null,
      completed: false,
      source: 'manual' as const,
      externalId: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tasks).values(newTask);

    return c.json({
      ...newTask,
      deadline: deadline ? deadline.toISOString() : null,
    }, 201);
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ error: 'タスクの作成に失敗しました' }, 500);
  }
});

// PUT /api/tasks/:id - タスク更新
app.put('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const taskId = c.req.param('id');
  const data = c.req.valid('json');
  const db = drizzle(c.env.DB);

  try {
    // Check if task exists and belongs to user
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .get();

    if (!existingTask) {
      return c.json({ error: 'タスクが見つかりません' }, 404);
    }

    const now = new Date();
    const deadline = data.deadline ? new Date(data.deadline) : undefined;

    const updateData: any = {
      updatedAt: now,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (deadline) updateData.deadline = Math.floor(deadline.getTime() / 1000);

    await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

    const updatedTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .get();

    return c.json({
      ...updatedTask,
      metadata: updatedTask!.metadata ? JSON.parse(updatedTask!.metadata) : null,
      deadline: updatedTask!.deadline ? new Date(updatedTask!.deadline * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ error: 'タスクの更新に失敗しました' }, 500);
  }
});

// DELETE /api/tasks/:id - タスク削除
app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const taskId = c.req.param('id');
  const db = drizzle(c.env.DB);

  try {
    // Check if task exists and belongs to user
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .get();

    if (!existingTask) {
      return c.json({ error: 'タスクが見つかりません' }, 404);
    }

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

    return c.json({ message: 'タスクを削除しました' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return c.json({ error: 'タスクの削除に失敗しました' }, 500);
  }
});

// POST /api/tasks/:id/complete - タスク完了
app.post('/:id/complete', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const taskId = c.req.param('id');
  const db = drizzle(c.env.DB);

  try {
    // Check if task exists and belongs to user
    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .get();

    if (!existingTask) {
      return c.json({ error: 'タスクが見つかりません' }, 404);
    }

    const now = new Date();
    await db
      .update(tasks)
      .set({
        completed: true,
        updatedAt: now,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

    const updatedTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .get();

    return c.json({
      ...updatedTask,
      metadata: updatedTask!.metadata ? JSON.parse(updatedTask!.metadata) : null,
      deadline: updatedTask!.deadline ? new Date(updatedTask!.deadline * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return c.json({ error: 'タスクの完了に失敗しました' }, 500);
  }
});

// POST /api/tasks/bulk-complete - 一括完了
app.post('/bulk-complete', zValidator('json', z.object({
  taskIds: z.array(z.string()).min(1).max(50),
})), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const { taskIds } = c.req.valid('json');
  const db = drizzle(c.env.DB);

  try {
    const now = new Date();
    
    // Update all specified tasks
    await db
      .update(tasks)
      .set({
        completed: true,
        updatedAt: now,
      })
      .where(
        and(
          eq(tasks.userId, user.id),
          sql`${tasks.id} IN (${sql.join(taskIds.map(id => sql`${id}`), sql`, `)})`
        )
      );

    // Get updated tasks
    const updatedTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          sql`${tasks.id} IN (${sql.join(taskIds.map(id => sql`${id}`), sql`, `)})`
        )
      );

    const tasksWithMetadata = updatedTasks.map(task => ({
      ...task,
      metadata: task.metadata ? JSON.parse(task.metadata) : null,
      deadline: task.deadline ? new Date(task.deadline * 1000).toISOString() : null,
    }));

    return c.json({
      tasks: tasksWithMetadata,
      count: updatedTasks.length,
    });
  } catch (error) {
    console.error('Error bulk completing tasks:', error);
    return c.json({ error: 'タスクの一括完了に失敗しました' }, 500);
  }
});

export default app;