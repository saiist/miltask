export interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatarUrl?: string
  preferences: UserPreferences
  subscription: SubscriptionStatus
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'ja' | 'en'
  notifications: NotificationSettings
  defaultTaskCategory?: string
  timezone: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  taskReminders: boolean
  weeklyReport: boolean
  recommendations: boolean
}

export interface SubscriptionStatus {
  tier: 'free' | 'pro' | 'premium'
  isActive: boolean
  expiresAt?: Date
  features: string[]
}

export interface UserProfile extends User {
  stats: UserStats
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  currentStreak: number
  longestStreak: number
  favoriteCategories: Array<{
    category: string
    count: number
  }>
}