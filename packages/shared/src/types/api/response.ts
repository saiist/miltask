import { Task } from '../models/task'
import { User, UserProfile } from '../models/user'
import { Anime, AnimeListEntry } from '../models/anime'
import { Game, GameListEntry } from '../models/game'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface TaskListResponse extends PaginatedResponse<Task> {}

export interface AnimeListResponse extends PaginatedResponse<AnimeListEntry> {}

export interface GameListResponse extends PaginatedResponse<GameListEntry> {}

export interface DashboardStats {
  tasks: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  anime: {
    watching: number
    completed: number
    planToWatch: number
  }
  games: {
    playing: number
    completed: number
    planToPlay: number
  }
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'task' | 'anime' | 'game' | 'book'
  action: string
  itemId: string
  itemTitle: string
  timestamp: Date
}