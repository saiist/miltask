export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date
  completedAt?: Date
  tags: string[]
  relatedItemId?: string // アニメ、ゲーム、書籍のID
  relatedItemType?: 'anime' | 'game' | 'book'
  createdAt: Date
  updatedAt: Date
}

export type TaskCategory = 
  | 'anime'
  | 'game'
  | 'book'
  | 'personal'
  | 'work'
  | 'other'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface TaskFilter {
  categories?: TaskCategory[]
  priorities?: TaskPriority[]
  statuses?: TaskStatus[]
  tags?: string[]
  search?: string
  dateFrom?: Date
  dateTo?: Date
}