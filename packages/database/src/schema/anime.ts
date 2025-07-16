import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * ユーザーのアニメ管理テーブル
 */
export const anime = sqliteTable('anime', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  
  // 基本情報
  title: text('title').notNull(),
  malId: integer('mal_id'), // MyAnimeList ID
  imageUrl: text('image_url'),
  
  // 視聴状態
  status: text('status', { enum: ['watching', 'completed', 'planned', 'dropped'] }).notNull().default('planned'),
  currentEpisode: integer('current_episode').notNull().default(0),
  totalEpisodes: integer('total_episodes'),
  
  // 評価
  rating: integer('rating'), // 1-10
  notes: text('notes'),
  
  // メタデータ
  metadata: text('metadata'), // JSON
  
  // タイムスタンプ
  startedAt: integer('started_at'),
  completedAt: integer('completed_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => ({
  userIdIdx: index('anime_user_id_idx').on(table.userId),
  statusIdx: index('anime_status_idx').on(table.status),
  userStatusIdx: index('anime_user_status_idx').on(table.userId, table.status),
}));