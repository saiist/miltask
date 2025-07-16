import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { anime } from '@otaku-secretary/database';
import { initializeLucia } from '../auth/lucia';
import { getCookie } from 'hono/cookie';
import type { User, Session } from 'lucia';

const animeRoutes = new Hono<{
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    user: User;
    session: Session;
  };
}>();

// アニメ作成のバリデーションスキーマ
const createAnimeSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  malId: z.number().optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(['watching', 'completed', 'planned', 'dropped']).default('planned'),
  currentEpisode: z.number().min(0).default(0),
  totalEpisodes: z.number().min(1).optional(),
  rating: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

// アニメ更新のバリデーションスキーマ
const updateAnimeSchema = createAnimeSchema.partial();

// 認証ミドルウェア
animeRoutes.use('*', async (c, next) => {
  const lucia = initializeLucia(c.env);
  const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '') ?? null;
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', user);
  c.set('session', session);
  await next();
});

// アニメ一覧取得
animeRoutes.get('/', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = drizzle(c.env.DB);
    const userAnime = await db
      .select()
      .from(anime)
      .where(eq(anime.userId, user.id))
      .orderBy(desc(anime.updatedAt));

    return c.json({
      success: true,
      data: userAnime,
    });
  } catch (error) {
    console.error('Failed to fetch anime list:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 特定のステータスのアニメ取得
animeRoutes.get('/status/:status', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const status = c.req.param('status');
    if (!['watching', 'completed', 'planned', 'dropped'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const db = drizzle(c.env.DB);
    const userAnime = await db
      .select()
      .from(anime)
      .where(and(
        eq(anime.userId, user.id),
        eq(anime.status, status as any)
      ))
      .orderBy(desc(anime.updatedAt));

    return c.json({
      success: true,
      data: userAnime,
    });
  } catch (error) {
    console.error('Failed to fetch anime by status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// アニメ作成
animeRoutes.post('/', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const validatedData = createAnimeSchema.parse(body);

    const db = drizzle(c.env.DB);
    const now = Date.now();
    const animeId = crypto.randomUUID();

    const newAnime = {
      id: animeId,
      userId: user.id,
      title: validatedData.title,
      malId: validatedData.malId || null,
      imageUrl: validatedData.imageUrl || null,
      status: validatedData.status,
      currentEpisode: validatedData.currentEpisode,
      totalEpisodes: validatedData.totalEpisodes || null,
      rating: validatedData.rating || null,
      notes: validatedData.notes || null,
      metadata: null,
      startedAt: validatedData.status === 'watching' ? now : null,
      completedAt: validatedData.status === 'completed' ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(anime).values(newAnime);

    return c.json({
      success: true,
      data: newAnime,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    console.error('Failed to create anime:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// アニメ更新
animeRoutes.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const animeId = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateAnimeSchema.parse(body);

    const db = drizzle(c.env.DB);
    
    // アニメが存在し、ユーザーのものであることを確認
    const existingAnime = await db
      .select()
      .from(anime)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ))
      .get();

    if (!existingAnime) {
      return c.json({ error: 'Anime not found' }, 404);
    }

    const now = Date.now();
    const updateData: any = {
      ...validatedData,
      updatedAt: now,
    };

    // ステータス変更時のタイムスタンプ更新
    if (validatedData.status) {
      if (validatedData.status === 'watching' && existingAnime.status !== 'watching') {
        updateData.startedAt = now;
      } else if (validatedData.status === 'completed' && existingAnime.status !== 'completed') {
        updateData.completedAt = now;
      }
    }

    await db
      .update(anime)
      .set(updateData)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ));

    // 更新されたアニメを取得
    const updatedAnime = await db
      .select()
      .from(anime)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ))
      .get();

    return c.json({
      success: true,
      data: updatedAnime,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    console.error('Failed to update anime:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// アニメ削除
animeRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const animeId = c.req.param('id');
    const db = drizzle(c.env.DB);

    // アニメが存在し、ユーザーのものであることを確認
    const existingAnime = await db
      .select()
      .from(anime)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ))
      .get();

    if (!existingAnime) {
      return c.json({ error: 'Anime not found' }, 404);
    }

    await db
      .delete(anime)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ));

    return c.json({
      success: true,
      message: 'Anime deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete anime:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// エピソード進行度更新
animeRoutes.post('/:id/progress', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const animeId = c.req.param('id');
    const body = await c.req.json();
    const { currentEpisode } = z.object({
      currentEpisode: z.number().min(0),
    }).parse(body);

    const db = drizzle(c.env.DB);

    // アニメが存在し、ユーザーのものであることを確認
    const existingAnime = await db
      .select()
      .from(anime)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ))
      .get();

    if (!existingAnime) {
      return c.json({ error: 'Anime not found' }, 404);
    }

    const now = Date.now();
    const updateData: any = {
      currentEpisode,
      updatedAt: now,
    };

    // 最終話に到達した場合、ステータスを完了に変更
    if (existingAnime.totalEpisodes && currentEpisode >= existingAnime.totalEpisodes) {
      updateData.status = 'completed';
      updateData.completedAt = now;
    } else if (existingAnime.status === 'planned') {
      // 視聴開始
      updateData.status = 'watching';
      updateData.startedAt = now;
    }

    await db
      .update(anime)
      .set(updateData)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ));

    // 更新されたアニメを取得
    const updatedAnime = await db
      .select()
      .from(anime)
      .where(and(
        eq(anime.id, animeId),
        eq(anime.userId, user.id)
      ))
      .get();

    return c.json({
      success: true,
      data: updatedAnime,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    console.error('Failed to update anime progress:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default animeRoutes;