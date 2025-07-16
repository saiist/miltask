import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { gameMasters } from './game-masters';

export const userGames = sqliteTable('user_games', {
  userId: text('user_id').notNull().references(() => users.id),
  gameId: text('game_id').notNull().references(() => gameMasters.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  settings: text('settings'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.gameId] }),
}));

export type UserGame = typeof userGames.$inferSelect;
export type NewUserGame = typeof userGames.$inferInsert;

export interface UserGameSettings {
  enabledTasks: string[]; // task IDs to enable
  customPriorities?: Record<string, 'high' | 'medium' | 'low'>;
  notifications?: {
    enabled: boolean;
    beforeReset?: number; // minutes before reset time
  };
}