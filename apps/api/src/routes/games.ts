import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { gameMasters, userGames } from '@otaku-secretary/database';
import { authMiddleware } from '../auth/middleware';
import type { Env } from './index';
import type { User, Session } from 'lucia';

interface Variables {
  user: User | null;
  session: Session | null;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const addUserGameSchema = z.object({
  gameId: z.string().min(1),
  settings: z.object({
    enabledTasks: z.array(z.string()),
    customPriorities: z.record(z.enum(['high', 'medium', 'low'])).optional(),
    notifications: z.object({
      enabled: z.boolean(),
      beforeReset: z.number().optional(),
    }).optional(),
  }).optional(),
});

// GET /api/games - 利用可能ゲーム一覧（認証不要）
app.get('/', async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const games = await db
      .select()
      .from(gameMasters)
      .orderBy(gameMasters.name);

    const gamesWithTasks = games.map(game => ({
      ...game,
      dailyTasks: game.dailyTasks ? JSON.parse(game.dailyTasks) : [],
    }));

    return c.json({
      games: gamesWithTasks,
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return c.json({ error: 'ゲーム一覧の取得に失敗しました' }, 500);
  }
});

// GET /api/games/user - ユーザーのゲーム設定
app.get('/user', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const db = drizzle(c.env.DB);

  try {
    const userGameSettings = await db
      .select({
        gameId: userGames.gameId,
        active: userGames.active,
        settings: userGames.settings,
        createdAt: userGames.createdAt,
        updatedAt: userGames.updatedAt,
        gameName: gameMasters.name,
        gamePlatform: gameMasters.platform,
        gameIcon: gameMasters.iconUrl,
        dailyTasks: gameMasters.dailyTasks,
      })
      .from(userGames)
      .innerJoin(gameMasters, eq(userGames.gameId, gameMasters.id))
      .where(eq(userGames.userId, user.id));

    const gamesWithSettings = userGameSettings.map(game => ({
      gameId: game.gameId,
      active: game.active,
      settings: game.settings ? JSON.parse(game.settings) : null,
      createdAt: game.createdAt ? new Date(game.createdAt * 1000).toISOString() : null,
      updatedAt: game.updatedAt ? new Date(game.updatedAt * 1000).toISOString() : null,
      game: {
        id: game.gameId,
        name: game.gameName,
        platform: game.gamePlatform,
        iconUrl: game.gameIcon,
        dailyTasks: game.dailyTasks ? JSON.parse(game.dailyTasks) : [],
      },
    }));

    return c.json({
      userGames: gamesWithSettings,
    });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return c.json({ error: 'ユーザーゲーム設定の取得に失敗しました' }, 500);
  }
});

// POST /api/games/user - ゲーム設定追加
app.post('/user', authMiddleware, zValidator('json', addUserGameSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const { gameId, settings } = c.req.valid('json');
  const db = drizzle(c.env.DB);

  try {
    // Check if game exists
    const game = await db
      .select()
      .from(gameMasters)
      .where(eq(gameMasters.id, gameId))
      .get();

    if (!game) {
      return c.json({ error: '指定されたゲームが見つかりません' }, 404);
    }

    // Check if user already has this game
    const existingUserGame = await db
      .select()
      .from(userGames)
      .where(and(eq(userGames.userId, user.id), eq(userGames.gameId, gameId)))
      .get();

    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);

    if (existingUserGame) {
      // Update existing
      await db
        .update(userGames)
        .set({
          active: true,
          settings: settings ? JSON.stringify(settings) : null,
          updatedAt: timestamp,
        })
        .where(and(eq(userGames.userId, user.id), eq(userGames.gameId, gameId)));
    } else {
      // Create new
      await db.insert(userGames).values({
        userId: user.id,
        gameId,
        active: true,
        settings: settings ? JSON.stringify(settings) : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    // Return updated user game
    const updatedUserGame = await db
      .select({
        gameId: userGames.gameId,
        active: userGames.active,
        settings: userGames.settings,
        createdAt: userGames.createdAt,
        updatedAt: userGames.updatedAt,
        gameName: gameMasters.name,
        gamePlatform: gameMasters.platform,
        gameIcon: gameMasters.iconUrl,
        dailyTasks: gameMasters.dailyTasks,
      })
      .from(userGames)
      .innerJoin(gameMasters, eq(userGames.gameId, gameMasters.id))
      .where(and(eq(userGames.userId, user.id), eq(userGames.gameId, gameId)))
      .get();

    return c.json({
      gameId: updatedUserGame!.gameId,
      active: updatedUserGame!.active,
      settings: updatedUserGame!.settings ? JSON.parse(updatedUserGame!.settings) : null,
      createdAt: updatedUserGame!.createdAt ? new Date(updatedUserGame!.createdAt * 1000).toISOString() : null,
      updatedAt: updatedUserGame!.updatedAt ? new Date(updatedUserGame!.updatedAt * 1000).toISOString() : null,
      game: {
        id: updatedUserGame!.gameId,
        name: updatedUserGame!.gameName,
        platform: updatedUserGame!.gamePlatform,
        iconUrl: updatedUserGame!.gameIcon,
        dailyTasks: updatedUserGame!.dailyTasks ? JSON.parse(updatedUserGame!.dailyTasks) : [],
      },
    }, existingUserGame ? 200 : 201);
  } catch (error) {
    console.error('Error adding user game:', error);
    return c.json({ error: 'ゲーム設定の追加に失敗しました' }, 500);
  }
});

// DELETE /api/games/user/:gameId - ゲーム設定削除
app.delete('/user/:gameId', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const gameId = c.req.param('gameId');
  const db = drizzle(c.env.DB);

  try {
    // Check if user game exists
    const existingUserGame = await db
      .select()
      .from(userGames)
      .where(and(eq(userGames.userId, user.id), eq(userGames.gameId, gameId)))
      .get();

    if (!existingUserGame) {
      return c.json({ error: 'ゲーム設定が見つかりません' }, 404);
    }

    // Soft delete by setting active to false
    await db
      .update(userGames)
      .set({
        active: false,
        updatedAt: Math.floor(new Date().getTime() / 1000),
      })
      .where(and(eq(userGames.userId, user.id), eq(userGames.gameId, gameId)));

    return c.json({ message: 'ゲーム設定を削除しました' });
  } catch (error) {
    console.error('Error deleting user game:', error);
    return c.json({ error: 'ゲーム設定の削除に失敗しました' }, 500);
  }
});

export default app;