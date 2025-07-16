import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { recurringTasks } from '@otaku-secretary/database';
import type { Env } from './index';
import type { User, Session } from 'lucia';

interface Variables {
  user: User | null;
  session: Session | null;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const taskTemplateSchema = z.object({
  type: z.enum(['anime', 'game-daily', 'book-release']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

const recurrenceDataSchema = z.object({
  days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  interval: z.number().min(1).optional(),
});

const createRecurringTaskSchema = z.object({
  taskTemplate: taskTemplateSchema,
  recurrenceType: z.enum(['daily', 'weekly', 'custom']),
  recurrenceData: recurrenceDataSchema,
  active: z.boolean().default(true),
});

const updateRecurringTaskSchema = z.object({
  taskTemplate: taskTemplateSchema.optional(),
  recurrenceType: z.enum(['daily', 'weekly', 'custom']).optional(),
  recurrenceData: recurrenceDataSchema.optional(),
  active: z.boolean().optional(),
});

// Helper function to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// GET /api/recurring-tasks - 定期タスク一覧
app.get('/', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const db = drizzle(c.env.DB);

  try {
    const userRecurringTasks = await db
      .select()
      .from(recurringTasks)
      .where(eq(recurringTasks.userId, user.id))
      .orderBy(desc(recurringTasks.createdAt));

    const tasksWithParsedData = userRecurringTasks.map(task => ({
      ...task,
      taskTemplate: task.taskTemplate ? JSON.parse(task.taskTemplate) : null,
      recurrenceData: task.recurrenceData ? JSON.parse(task.recurrenceData) : null,
      lastGenerated: task.lastGenerated ? new Date(task.lastGenerated * 1000).toISOString() : null,
      createdAt: new Date(task.createdAt * 1000).toISOString(),
      updatedAt: new Date(task.updatedAt * 1000).toISOString(),
    }));

    return c.json({
      recurringTasks: tasksWithParsedData,
    });
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    return c.json({ error: '定期タスクの取得に失敗しました' }, 500);
  }
});

// POST /api/recurring-tasks - 定期タスク作成
app.post('/', zValidator('json', createRecurringTaskSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const data = c.req.valid('json');
  const db = drizzle(c.env.DB);

  try {
    const taskId = generateId();
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);

    const newRecurringTask = {
      id: taskId,
      userId: user.id,
      taskTemplate: JSON.stringify(data.taskTemplate),
      recurrenceType: data.recurrenceType,
      recurrenceData: JSON.stringify(data.recurrenceData),
      active: data.active,
      lastGenerated: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.insert(recurringTasks).values(newRecurringTask);

    return c.json({
      ...newRecurringTask,
      taskTemplate: data.taskTemplate,
      recurrenceData: data.recurrenceData,
      lastGenerated: null,
      createdAt: new Date(timestamp * 1000).toISOString(),
      updatedAt: new Date(timestamp * 1000).toISOString(),
    }, 201);
  } catch (error) {
    console.error('Error creating recurring task:', error);
    return c.json({ error: '定期タスクの作成に失敗しました' }, 500);
  }
});

// PUT /api/recurring-tasks/:id - 定期タスク更新
app.put('/:id', zValidator('json', updateRecurringTaskSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const taskId = c.req.param('id');
  const data = c.req.valid('json');
  const db = drizzle(c.env.DB);

  try {
    // Check if recurring task exists and belongs to user
    const existingTask = await db
      .select()
      .from(recurringTasks)
      .where(and(eq(recurringTasks.id, taskId), eq(recurringTasks.userId, user.id)))
      .get();

    if (!existingTask) {
      return c.json({ error: '定期タスクが見つかりません' }, 404);
    }

    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);

    const updateData: any = {
      updatedAt: timestamp,
    };

    if (data.taskTemplate !== undefined) {
      updateData.taskTemplate = JSON.stringify(data.taskTemplate);
    }
    if (data.recurrenceType !== undefined) {
      updateData.recurrenceType = data.recurrenceType;
    }
    if (data.recurrenceData !== undefined) {
      updateData.recurrenceData = JSON.stringify(data.recurrenceData);
    }
    if (data.active !== undefined) {
      updateData.active = data.active;
    }

    await db
      .update(recurringTasks)
      .set(updateData)
      .where(and(eq(recurringTasks.id, taskId), eq(recurringTasks.userId, user.id)));

    const updatedTask = await db
      .select()
      .from(recurringTasks)
      .where(and(eq(recurringTasks.id, taskId), eq(recurringTasks.userId, user.id)))
      .get();

    return c.json({
      ...updatedTask,
      taskTemplate: updatedTask!.taskTemplate ? JSON.parse(updatedTask!.taskTemplate) : null,
      recurrenceData: updatedTask!.recurrenceData ? JSON.parse(updatedTask!.recurrenceData) : null,
      lastGenerated: updatedTask!.lastGenerated ? new Date(updatedTask!.lastGenerated * 1000).toISOString() : null,
      createdAt: new Date(updatedTask!.createdAt * 1000).toISOString(),
      updatedAt: new Date(updatedTask!.updatedAt * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error updating recurring task:', error);
    return c.json({ error: '定期タスクの更新に失敗しました' }, 500);
  }
});

// DELETE /api/recurring-tasks/:id - 定期タスク削除
app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const taskId = c.req.param('id');
  const db = drizzle(c.env.DB);

  try {
    // Check if recurring task exists and belongs to user
    const existingTask = await db
      .select()
      .from(recurringTasks)
      .where(and(eq(recurringTasks.id, taskId), eq(recurringTasks.userId, user.id)))
      .get();

    if (!existingTask) {
      return c.json({ error: '定期タスクが見つかりません' }, 404);
    }

    await db
      .delete(recurringTasks)
      .where(and(eq(recurringTasks.id, taskId), eq(recurringTasks.userId, user.id)));

    return c.json({ message: '定期タスクを削除しました' });
  } catch (error) {
    console.error('Error deleting recurring task:', error);
    return c.json({ error: '定期タスクの削除に失敗しました' }, 500);
  }
});

export default app;