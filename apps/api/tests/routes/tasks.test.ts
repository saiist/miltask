import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import tasksRoutes from '../../src/routes/tasks';
import { createTestApp, mockUser, mockAuthMiddleware, mockAuthMiddlewareFail, createAuthRequest } from '../helpers/test-utils';
import { createMockDrizzle } from '../helpers/mock-db';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => `test-uuid-${Date.now()}`),
});

// Mock drizzle-orm
const mockDrizzleInstance = createMockDrizzle();
vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDrizzleInstance),
}));

describe('Tasks API', () => {
  let app: Hono;
  let mockEnv: any;

  beforeEach(() => {
    const testSetup = createTestApp();
    app = testSetup.app;
    mockEnv = testSetup.mockEnv;
    
    // Apply auth middleware first, then task routes
    app.use('/api/tasks/*', mockAuthMiddleware);
    app.route('/api/tasks', tasksRoutes);
    
    // Reset mocks
    vi.clearAllMocks();
    mockDrizzleInstance.clearMockData();
  });

  describe('POST /api/tasks', () => {
    it('正常なタスクを作成できる', async () => {
      const newTask = {
        type: 'anime',
        title: 'SPY×FAMILY 第25話',
        description: '2クール目第1話',
        priority: 'high',
      };

      const req = createAuthRequest('POST', '/api/tasks', newTask);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toMatchObject({
        id: expect.any(String),
        userId: mockUser.id,
        type: 'anime',
        title: 'SPY×FAMILY 第25話',
        description: '2クール目第1話',
        priority: 'high',
        completed: false,
      });
    });

    it('タイトルなしはエラー', async () => {
      const newTask = {
        type: 'anime',
        description: 'タイトルなし',
      };

      const req = createAuthRequest('POST', '/api/tasks', newTask);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('無効なタスクタイプはエラー', async () => {
      const newTask = {
        type: 'invalid-type',
        title: 'Invalid Task',
      };

      const req = createAuthRequest('POST', '/api/tasks', newTask);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('認証なしではエラー', async () => {
      // Remove auth middleware for this test
      const testApp = new Hono();
      testApp.use('/api/tasks/*', mockAuthMiddlewareFail);
      testApp.route('/api/tasks', tasksRoutes);

      const newTask = {
        type: 'anime',
        title: 'Test Task',
      };

      const req = createAuthRequest('POST', '/api/tasks', newTask);
      const res = await testApp.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe('認証が必要です');
    });
  });

  describe('GET /api/tasks', () => {
    it('タスク一覧を取得できる', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          userId: mockUser.id,
          type: 'anime',
          title: 'Test Anime Task',
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          userId: mockUser.id,
          type: 'game-daily',
          title: 'FGO Daily',
          completed: true,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDrizzleInstance.setMockData('select', mockTasks);

      const req = createAuthRequest('GET', '/api/tasks');
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      if (res.status !== 200) {
        console.error('GET /api/tasks error:', body);
      }
      expect(res.status).toBe(200);
      expect(body.tasks).toHaveLength(2);
      expect(body.pagination).toMatchObject({
        limit: 50,
        offset: 0,
        count: 2,
      });
    });
  });

  describe('GET /api/tasks/today', () => {
    it('今日のタスクを取得できる', async () => {
      const todayTasks = [
        {
          id: 'task-today-1',
          userId: mockUser.id,
          type: 'game-daily',
          title: 'FGO デイリー',
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDrizzleInstance.setMockData('select', todayTasks);

      const req = createAuthRequest('GET', '/api/tasks/today');
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      if (res.status !== 200) {
        console.error('GET /api/tasks/today error:', body);
      }
      expect(res.status).toBe(200);
      expect(body).toHaveProperty('tasks');
      expect(body).toHaveProperty('summary');
      expect(body.summary).toMatchObject({
        total: expect.any(Number),
        completed: expect.any(Number),
        completionRate: expect.any(Number),
      });
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('タスクを更新できる', async () => {
      const existingTask = {
        id: 'task-to-update',
        userId: mockUser.id,
        type: 'anime',
        title: 'Old Title',
        completed: false,
      };

      // Mock the select query to return existing task
      mockDrizzleInstance.setMockData('select', [existingTask]);

      const updateData = {
        title: 'Updated Title',
        completed: true,
      };

      const req = createAuthRequest('PUT', '/api/tasks/task-to-update', updateData);
      const res = await app.request(req, { env: mockEnv });

      expect(res.status).toBe(200);
    });

    it('存在しないタスクは404エラー', async () => {
      // Mock empty result
      mockDrizzleInstance.setMockData('select', []);

      const updateData = {
        title: 'Updated Title',
      };

      const req = createAuthRequest('PUT', '/api/tasks/non-existent', updateData);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe('タスクが見つかりません');
    });
  });

  describe('POST /api/tasks/:id/complete', () => {
    it('タスクを完了できる', async () => {
      const existingTask = {
        id: 'task-to-complete',
        userId: mockUser.id,
        type: 'game-daily',
        title: 'FGO Daily',
        completed: false,
      };

      mockDrizzleInstance.setMockData('select', [existingTask]);

      const req = createAuthRequest('POST', '/api/tasks/task-to-complete/complete');
      const res = await app.request(req, { env: mockEnv });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('タスクを削除できる', async () => {
      const existingTask = {
        id: 'task-to-delete',
        userId: mockUser.id,
        type: 'anime',
        title: 'Task to Delete',
      };

      mockDrizzleInstance.setMockData('select', [existingTask]);

      const req = createAuthRequest('DELETE', '/api/tasks/task-to-delete');
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe('タスクを削除しました');
    });
  });

  describe('POST /api/tasks/bulk-complete', () => {
    it('複数タスクを一括完了できる', async () => {
      const tasksToComplete = [
        { id: 'task-1', userId: mockUser.id, completed: false },
        { id: 'task-2', userId: mockUser.id, completed: false },
        { id: 'task-3', userId: mockUser.id, completed: false },
      ];

      mockDrizzleInstance.setMockData('select', tasksToComplete);

      const req = createAuthRequest('POST', '/api/tasks/bulk-complete', {
        taskIds: ['task-1', 'task-2', 'task-3'],
      });

      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.count).toBe(3);
      expect(body.tasks).toHaveLength(3);
    });

    it('空の配列はエラー', async () => {
      const req = createAuthRequest('POST', '/api/tasks/bulk-complete', {
        taskIds: [],
      });

      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });
});