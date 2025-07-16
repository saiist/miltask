import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const recurringTasks = sqliteTable('recurring_tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  taskTemplate: text('task_template').notNull(), // JSON string
  recurrenceType: text('recurrence_type').notNull(), // 'daily' | 'weekly' | 'custom'
  recurrenceData: text('recurrence_data').notNull(), // JSON string
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  lastGenerated: integer('last_generated', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdx: index('idx_recurring_tasks_user').on(table.userId),
}));

export type RecurringTask = typeof recurringTasks.$inferSelect;
export type NewRecurringTask = typeof recurringTasks.$inferInsert;

export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export interface TaskTemplate {
  type: string;
  title: string;
  description?: string;
  priority: string;
  metadata?: Record<string, any>;
}

export interface RecurrenceData {
  days?: string[]; // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  time?: string; // '14:00'
  interval?: number; // for custom recurrence
}