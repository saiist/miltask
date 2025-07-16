import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import recurringTasksRoutes from '../../src/routes/recurring-tasks';
import { createTestApp, mockUser, mockAuthMiddleware, createAuthRequest } from '../helpers/test-utils';
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

describe('Recurring Tasks API', () => {
  let app: Hono;
  let mockEnv: any;

  beforeEach(() => {
    const testSetup = createTestApp();
    app = testSetup.app;
    mockEnv = testSetup.mockEnv;
    
    // Apply auth middleware first, then recurring task routes
    app.use('/api/recurring-tasks/*', mockAuthMiddleware);
    app.route('/api/recurring-tasks', recurringTasksRoutes);
    
    // Reset mocks
    vi.clearAllMocks();
    mockDrizzleInstance.clearMockData();
  });

  describe('GET /api/recurring-tasks', () => {
    it('定期タスク一覧を取得できる', async () => {
      const mockRecurringTasks = [
        {
          id: 'recurring-1',
          userId: mockUser.id,
          taskTemplate: JSON.stringify({
            type: 'game-daily',
            title: 'FGOデイリー',
            priority: 'high',
          }),
          recurrenceType: 'daily',
          recurrenceData: JSON.stringify({
            time: '04:00',
          }),
          active: true,
          lastGenerated: null,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      ];

      mockDrizzleInstance.setMockData('select', mockRecurringTasks);

      const req = createAuthRequest('GET', '/api/recurring-tasks');
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.recurringTasks).toHaveLength(1);
      expect(body.recurringTasks[0]).toMatchObject({
        id: 'recurring-1',
        taskTemplate: {
          type: 'game-daily',
          title: 'FGOデイリー',
          priority: 'high',
        },
        recurrenceType: 'daily',
        active: true,
      });
    });
  });

  describe('POST /api/recurring-tasks', () => {
    it('定期タスクを作成できる', async () => {
      const newRecurringTask = {
        taskTemplate: {
          type: 'game-daily',
          title: '原神デイリー',
          description: 'デイリー任務と樹脂消化',
          priority: 'high',
        },
        recurrenceType: 'daily',
        recurrenceData: {
          time: '05:00',
        },
        active: true,
      };

      const req = createAuthRequest('POST', '/api/recurring-tasks', newRecurringTask);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toMatchObject({
        id: expect.any(String),
        userId: mockUser.id,
        taskTemplate: newRecurringTask.taskTemplate,
        recurrenceType: 'daily',
        active: true,
      });
    });

    it('週次タスクを作成できる', async () => {
      const weeklyTask = {
        taskTemplate: {
          type: 'anime',
          title: '週刊アニメ視聴',
          priority: 'medium',
        },
        recurrenceType: 'weekly',
        recurrenceData: {
          days: ['mon', 'wed', 'fri'],
          time: '20:00',
        },
      };

      const req = createAuthRequest('POST', '/api/recurring-tasks', weeklyTask);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.recurrenceData.days).toEqual(['mon', 'wed', 'fri']);
    });

    it('無効な時刻形式はエラー', async () => {
      const invalidTask = {
        taskTemplate: {
          type: 'game-daily',
          title: 'テスト',
        },
        recurrenceType: 'daily',
        recurrenceData: {
          time: '25:00', // Invalid time
        },
      };

      const req = createAuthRequest('POST', '/api/recurring-tasks', invalidTask);
      const res = await app.request(req, { env: mockEnv });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/recurring-tasks/:id', () => {
    it('定期タスクを更新できる', async () => {
      const taskId = 'recurring-123';
      const existingTask = {
        id: taskId,
        userId: mockUser.id,
        taskTemplate: JSON.stringify({
          type: 'game-daily',
          title: '古いタイトル',
        }),
        recurrenceType: 'daily',
        recurrenceData: JSON.stringify({}),
        active: true,
        lastGenerated: null,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      };

      const updatedTask = {
        ...existingTask,
        taskTemplate: JSON.stringify({
          type: 'game-daily',
          title: '新しいタイトル',
          priority: 'high',
        }),
        active: false,
        updatedAt: Math.floor(Date.now() / 1000),
      };

      // Set up the call sequence: existing task check, then updated task fetch
      mockDrizzleInstance.setMockSequence([
        existingTask,  // 1st call: existing task check
        updatedTask    // 2nd call: updated task fetch
      ]);

      const updateData = {
        taskTemplate: {
          type: 'game-daily',
          title: '新しいタイトル',
          priority: 'high',
        },
        active: false,
      };

      const req = createAuthRequest('PUT', `/api/recurring-tasks/${taskId}`, updateData);
      const res = await app.request(req, { env: mockEnv });

      expect(res.status).toBe(200);
    });

    it('存在しない定期タスクは404エラー', async () => {
      mockDrizzleInstance.setMockData('select', []);

      const updateData = {
        active: false,
      };

      const req = createAuthRequest('PUT', '/api/recurring-tasks/non-existent', updateData);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe('定期タスクが見つかりません');
    });
  });

  describe('DELETE /api/recurring-tasks/:id', () => {
    it('定期タスクを削除できる', async () => {
      const taskId = 'recurring-123';
      const existingTask = {
        id: taskId,
        userId: mockUser.id,
        taskTemplate: JSON.stringify({
          type: 'game-daily',
          title: 'テストタスク',
        }),
      };

      mockDrizzleInstance.setMockData('select', [existingTask]);

      const req = createAuthRequest('DELETE', `/api/recurring-tasks/${taskId}`);
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe('定期タスクを削除しました');
    });

    it('存在しない定期タスクは404エラー', async () => {
      mockDrizzleInstance.setMockData('select', []);

      const req = createAuthRequest('DELETE', '/api/recurring-tasks/non-existent');
      const res = await app.request(req, { env: mockEnv });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe('定期タスクが見つかりません');
    });
  });
});