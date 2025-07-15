import { z } from 'zod'
import { TaskCategory, TaskPriority, TaskStatus } from '../types/models/task'

export const taskCategorySchema = z.enum([
  'anime',
  'game',
  'book',
  'personal',
  'work',
  'other'
])

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled'])

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
  category: taskCategorySchema,
  priority: taskPrioritySchema,
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).max(10, 'タグは10個までです').optional(),
  relatedItemId: z.string().optional(),
  relatedItemType: z.enum(['anime', 'game', 'book']).optional()
})

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: taskStatusSchema.optional()
})

export const taskFilterSchema = z.object({
  categories: z.array(taskCategorySchema).optional(),
  priorities: z.array(taskPrioritySchema).optional(),
  statuses: z.array(taskStatusSchema).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
})

export type TaskCreateInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type TaskFilterInput = z.infer<typeof taskFilterSchema>