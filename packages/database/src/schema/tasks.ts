import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'anime' | 'game-daily' | 'book-release'
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').notNull().default('medium'), // 'high' | 'medium' | 'low'
  deadline: integer('deadline', { mode: 'timestamp' }),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  source: text('source').notNull().default('manual'), // 'manual' | 'api' | 'scraping' | 'recurring'
  externalId: text('external_id'),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userDateIdx: index('idx_tasks_user_date').on(table.userId, table.createdAt),
  typeIdx: index('idx_tasks_type').on(table.type),
  completedIdx: index('idx_tasks_completed').on(table.completed),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type TaskType = 'anime' | 'game-daily' | 'book-release';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskSource = 'manual' | 'api' | 'scraping' | 'recurring';