import { TaskCategory, TaskPriority, TaskStatus } from '../types/models/task'
import { SelectOption } from '../types/common'

export const TASK_CATEGORIES: Record<TaskCategory, string> = {
  anime: 'アニメ',
  game: 'ゲーム',
  book: '書籍',
  personal: '個人',
  work: '仕事',
  other: 'その他'
}

export const TASK_PRIORITIES: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急'
}

export const TASK_STATUSES: Record<TaskStatus, string> = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル'
}

export const TASK_CATEGORY_OPTIONS: SelectOption<TaskCategory>[] = Object.entries(
  TASK_CATEGORIES
).map(([value, label]) => ({ value: value as TaskCategory, label }))

export const TASK_PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = Object.entries(
  TASK_PRIORITIES
).map(([value, label]) => ({ value: value as TaskPriority, label }))

export const TASK_STATUS_OPTIONS: SelectOption<TaskStatus>[] = Object.entries(
  TASK_STATUSES
).map(([value, label]) => ({ value: value as TaskStatus, label }))

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500'
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}