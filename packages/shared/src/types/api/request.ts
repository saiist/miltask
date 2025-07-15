import { TaskCategory, TaskPriority, TaskStatus } from '../models/task'
import { WatchStatus } from '../models/anime'
import { PlayStatus } from '../models/game'

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface TaskCreateRequest {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string
  tags?: string[]
  relatedItemId?: string
  relatedItemType?: 'anime' | 'game' | 'book'
}

export interface TaskUpdateRequest {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
  tags?: string[]
}

export interface TaskQueryParams extends PaginationParams {
  categories?: TaskCategory[]
  priorities?: TaskPriority[]
  statuses?: TaskStatus[]
  tags?: string[]
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface AnimeListUpdateRequest {
  status: WatchStatus
  score?: number
  episodesWatched?: number
  notes?: string
  isFavorite?: boolean
}

export interface GameListUpdateRequest {
  status: PlayStatus
  score?: number
  hoursPlayed?: number
  notes?: string
  isFavorite?: boolean
}

export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthRegisterRequest {
  email: string
  password: string
  username: string
}