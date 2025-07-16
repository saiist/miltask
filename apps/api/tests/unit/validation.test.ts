import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// タスク作成スキーマのテスト
const createTaskSchema = z.object({
  type: z.enum(['anime', 'game-daily', 'book-release']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  deadline: z.string().datetime().optional(),
});

describe('Task Validation', () => {
  describe('createTaskSchema', () => {
    it('有効なタスクデータを検証できる', () => {
      const validTask = {
        type: 'anime',
        title: 'SPY×FAMILY 第25話',
        description: '2クール目第1話',
        priority: 'high',
      };

      const result = createTaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('anime');
        expect(result.data.title).toBe('SPY×FAMILY 第25話');
        expect(result.data.priority).toBe('high');
      }
    });

    it('タイトルなしは検証エラー', () => {
      const invalidTask = {
        type: 'anime',
      };

      const result = createTaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('無効なタスクタイプは検証エラー', () => {
      const invalidTask = {
        type: 'invalid-type',
        title: 'テストタスク',
      };

      const result = createTaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('長すぎるタイトルは検証エラー', () => {
      const invalidTask = {
        type: 'anime',
        title: 'a'.repeat(201), // 201文字
      };

      const result = createTaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('デフォルト優先度が設定される', () => {
      const taskWithoutPriority = {
        type: 'anime',
        title: 'テストタスク',
      };

      const result = createTaskSchema.safeParse(taskWithoutPriority);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('medium');
      }
    });
  });
});

// 定期タスクのバリデーションテスト
const recurrenceDataSchema = z.object({
  days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  interval: z.number().min(1).optional(),
});

describe('Recurrence Validation', () => {
  describe('recurrenceDataSchema', () => {
    it('有効な日次スケジュールを検証できる', () => {
      const dailySchedule = {
        time: '14:00',
      };

      const result = recurrenceDataSchema.safeParse(dailySchedule);
      expect(result.success).toBe(true);
    });

    it('有効な週次スケジュールを検証できる', () => {
      const weeklySchedule = {
        days: ['mon', 'wed', 'fri'],
        time: '20:00',
      };

      const result = recurrenceDataSchema.safeParse(weeklySchedule);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days).toHaveLength(3);
      }
    });

    it('無効な時刻形式は検証エラー', () => {
      const invalidSchedule = {
        time: '25:00', // 無効な時刻
      };

      const result = recurrenceDataSchema.safeParse(invalidSchedule);
      expect(result.success).toBe(false);
    });

    it('無効な曜日は検証エラー', () => {
      const invalidSchedule = {
        days: ['mon', 'invalid-day'],
        time: '14:00',
      };

      const result = recurrenceDataSchema.safeParse(invalidSchedule);
      expect(result.success).toBe(false);
    });
  });
});