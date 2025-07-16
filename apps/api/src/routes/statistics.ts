import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { tasks, userGames } from '@otaku-secretary/database'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import type { Env, Variables } from './index'

const statisticsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

/**
 * 統計データを取得
 */
statisticsRoutes.get('/', async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ 
      success: false,
      error: { code: 'UNAUTHORIZED', message: '認証が必要です' }
    }, 401)
  }

  try {
    const db = drizzle(c.env.DB)
    
    // 今日の日付範囲を取得
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 今週の日付範囲を取得
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // タスク統計を取得
    const [todayStats] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when completed = 1 then 1 else 0 end)`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          gte(tasks.createdAt, today),
          lte(tasks.createdAt, tomorrow)
        )
      )

    const [weekStats] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when completed = 1 then 1 else 0 end)`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, user.id),
          gte(tasks.createdAt, weekStart),
          lte(tasks.createdAt, weekEnd)
        )
      )

    // タスクタイプ別の統計
    const typeStats = await db
      .select({
        type: tasks.type,
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when completed = 1 then 1 else 0 end)`,
      })
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .groupBy(tasks.type)

    // アクティブなゲーム数を取得
    const [gameStats] = await db
      .select({
        activeGames: sql<number>`count(*)`,
      })
      .from(userGames)
      .where(
        and(
          eq(userGames.userId, user.id),
          eq(userGames.active, true)
        )
      )

    // 統計データを整形
    const statistics = {
      today: {
        total: Number(todayStats?.total || 0),
        completed: Number(todayStats?.completed || 0),
        completionRate: todayStats?.total ? 
          Math.round((Number(todayStats.completed || 0) / Number(todayStats.total)) * 100) : 0
      },
      week: {
        total: Number(weekStats?.total || 0),
        completed: Number(weekStats?.completed || 0),
        completionRate: weekStats?.total ? 
          Math.round((Number(weekStats.completed || 0) / Number(weekStats.total)) * 100) : 0,
        trend: calculateTrend(Number(weekStats?.completed || 0), Number(weekStats?.total || 0))
      },
      byType: {
        anime: {
          total: 0,
          completed: 0,
          completionRate: 0
        },
        gameTasks: {
          total: 0,
          completed: 0,
          completionRate: 0
        },
        bookReleases: {
          total: 0,
          completed: 0,
          completionRate: 0
        }
      },
      games: {
        active: Number(gameStats?.activeGames || 0)
      }
    }

    // タイプ別統計を整形
    for (const stat of typeStats) {
      const total = Number(stat.total || 0)
      const completed = Number(stat.completed || 0)
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      
      switch (stat.type) {
        case 'anime':
          statistics.byType.anime = { total, completed, completionRate }
          break
        case 'game-daily':
          statistics.byType.gameTasks = { total, completed, completionRate }
          break
        case 'book-release':
          statistics.byType.bookReleases = { total, completed, completionRate }
          break
      }
    }

    return c.json({
      success: true,
      data: statistics
    })
  } catch (error) {
    console.error('Statistics error:', error)
    return c.json({ 
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '統計データの取得に失敗しました' }
    }, 500)
  }
})

/**
 * 週次トレンドを計算
 */
function calculateTrend(completed: number, total: number): string {
  if (total === 0) return '+0%'
  const rate = (completed / total) * 100
  return rate >= 50 ? `+${Math.round(rate - 50)}%` : `-${Math.round(50 - rate)}%`
}

export default statisticsRoutes