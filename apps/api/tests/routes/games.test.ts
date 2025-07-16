import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createTestApp, mockUser, mockAuthMiddleware, createAuthRequest } from '../helpers/test-utils';
import { createMockDrizzle } from '../helpers/mock-db';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => `test-uuid-${Date.now()}`),
});

// Mock the auth middleware that's imported directly in games.ts
vi.mock('../../src/auth/middleware', () => ({
  authMiddleware: vi.fn(async (c, next) => {
    c.set('user', mockUser);
    c.set('session', { id: 'test-session', userId: mockUser.id, expiresAt: new Date() });
    await next();
  }),
}));

// Mock drizzle-orm
const mockDrizzleInstance = createMockDrizzle();
vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDrizzleInstance),
}));

// Import after mocks
import gamesRoutes from '../../src/routes/games';

describe('Games API', () => {
  let app: Hono;
  let authApp: Hono;
  let mockEnv: any;

  beforeEach(() => {
    const testSetup = createTestApp();
    app = testSetup.app;
    authApp = testSetup.app; // Same app since middleware is mocked
    mockEnv = testSetup.mockEnv;
    
    // Apply routes
    app.route('/api/games', gamesRoutes);
    
    // Reset mocks
    vi.clearAllMocks();
    mockDrizzleInstance.clearMockData();
  });

  describe('GET /api/games', () => {
    it('利用可能なゲーム一覧を取得できる（認証不要）', async () => {
      const mockGames = [
        {
          id: 'fgo',
          name: 'Fate/Grand Order',
          platform: 'mobile',
          dailyTasks: JSON.stringify([
            {
              id: 'login_bonus',
              name: 'ログインボーナス',
              priority: 'medium',
            },
          ]),
          iconUrl: 'https://example.com/fgo.png',
        },
        {
          id: 'genshin',
          name: '原神',
          platform: 'multi',
          dailyTasks: JSON.stringify([
            {
              id: 'daily_commission',
              name: 'デイリー任務',
              priority: 'high',
            },
          ]),
          iconUrl: 'https://example.com/genshin.png',
        },
      ];

      mockDrizzleInstance.setMockData('select', mockGames);

      const req = new Request('http://localhost/api/games');
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.games).toHaveLength(2);
      expect(body.games[0]).toMatchObject({
        id: 'fgo',
        name: 'Fate/Grand Order',
        platform: 'mobile',
        dailyTasks: expect.any(Array),
      });
    });
  });

  describe('GET /api/games/user', () => {
    it('ユーザーのゲーム設定を取得できる', async () => {
      const mockUserGames = [
        {
          gameId: 'fgo',
          active: true,
          settings: JSON.stringify({
            enabledTasks: ['login_bonus', 'ap_consumption'],
          }),
          gameName: 'Fate/Grand Order',
          gamePlatform: 'mobile',
          gameIcon: 'https://example.com/fgo.png',
          dailyTasks: JSON.stringify([
            {
              id: 'login_bonus',
              name: 'ログインボーナス',
            },
          ]),
        },
      ];

      mockDrizzleInstance.setMockData('select', mockUserGames);

      const req = createAuthRequest('GET', '/api/games/user');
      const res = await authApp.request(req, { env: mockEnv });
      const body = await res.json();

      if (res.status !== 200) {
        console.error('GET /api/games/user error:', body);
      }
      expect(res.status).toBe(200);
      expect(body.userGames).toHaveLength(1);
      expect(body.userGames[0]).toMatchObject({
        gameId: 'fgo',
        active: true,
        settings: {
          enabledTasks: ['login_bonus', 'ap_consumption'],
        },
      });
    });
  });

  describe('POST /api/games/user', () => {
    it('ゲーム設定を追加できる', async () => {
      // Mock sequence for POST /api/games/user:
      // 1. Game exists check (should return the game)
      // 2. User game exists check (should return null for new creation)
      // 3. Final user game fetch (should return created user game)
      const mockGame = {
        id: 'fgo',
        name: 'Fate/Grand Order',
        platform: 'mobile',
      };
      
      const mockUserGame = {
        gameId: 'fgo',
        active: true,
        settings: JSON.stringify({
          enabledTasks: ['login_bonus'],
          notifications: {
            enabled: true,
            beforeReset: 30,
          },
        }),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        gameName: 'Fate/Grand Order',
        gamePlatform: 'mobile',
        gameIcon: null,
        dailyTasks: null,
      };

      // Set up the call sequence: game exists, no user game exists, then created user game
      mockDrizzleInstance.setMockSequence([
        mockGame,     // 1st call: game exists check
        null,         // 2nd call: user game exists check (null = not found)
        mockUserGame  // 3rd call: final user game fetch
      ]);

      const newGameSettings = {
        gameId: 'fgo',
        settings: {
          enabledTasks: ['login_bonus'],
          notifications: {
            enabled: true,
            beforeReset: 30,
          },
        },
      };

      const req = createAuthRequest('POST', '/api/games/user', newGameSettings);
      const res = await authApp.request(req, { env: mockEnv });

      expect(res.status).toBe(201);
    });

    it('存在しないゲームはエラー', async () => {
      // Mock no game found
      mockDrizzleInstance.setMockData('select', []);

      const newGameSettings = {
        gameId: 'non-existent',
      };

      const req = createAuthRequest('POST', '/api/games/user', newGameSettings);
      const res = await authApp.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe('指定されたゲームが見つかりません');
    });
  });

  describe('DELETE /api/games/user/:gameId', () => {
    it('ゲーム設定を削除できる（実際にはsoft delete）', async () => {
      const mockUserGame = {
        userId: mockUser.id,
        gameId: 'fgo',
        active: true,
      };

      mockDrizzleInstance.setMockData('select', [mockUserGame]);

      const req = createAuthRequest('DELETE', '/api/games/user/fgo');
      const res = await authApp.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe('ゲーム設定を削除しました');
    });

    it('存在しないゲーム設定は404エラー', async () => {
      // Mock no user game found
      mockDrizzleInstance.setMockData('select', []);

      const req = createAuthRequest('DELETE', '/api/games/user/non-existent');
      const res = await authApp.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe('ゲーム設定が見つかりません');
    });
  });
});