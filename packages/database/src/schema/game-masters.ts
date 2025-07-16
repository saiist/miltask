import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const gameMasters = sqliteTable('game_masters', {
  id: text('id').primaryKey(), // 'fgo', 'genshin', 'umamusume', etc.
  name: text('name').notNull(),
  platform: text('platform').notNull(), // 'mobile' | 'pc' | 'console' | 'multi'
  dailyTasks: text('daily_tasks').notNull(), // JSON array
  iconUrl: text('icon_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type GameMaster = typeof gameMasters.$inferSelect;
export type NewGameMaster = typeof gameMasters.$inferInsert;

export type GamePlatform = 'mobile' | 'pc' | 'console' | 'multi';

export interface GameDailyTask {
  id: string;
  name: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  resetTime?: string; // '04:00'
  category?: string; // 'login', 'combat', 'collection', etc.
}