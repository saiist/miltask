export interface Game {
  id: string
  title: string
  platform: GamePlatform[]
  genre: string[]
  developer?: string
  publisher?: string
  releaseDate?: Date
  description?: string
  imageUrl?: string
  metacriticScore?: number
  userStatus?: UserGameStatus
}

export type GamePlatform = 
  | 'PC'
  | 'PlayStation 5'
  | 'PlayStation 4'
  | 'Xbox Series X/S'
  | 'Xbox One'
  | 'Nintendo Switch'
  | 'Steam Deck'
  | 'Mobile'

export interface UserGameStatus {
  status: PlayStatus
  score?: number
  hoursPlayed?: number
  startDate?: Date
  finishDate?: Date
  notes?: string
  isFavorite: boolean
  achievements?: {
    total: number
    unlocked: number
  }
}

export type PlayStatus = 
  | 'playing'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'plan_to_play'

export interface GameListEntry {
  game: Game
  userStatus: UserGameStatus
  addedAt: Date
  updatedAt: Date
}

export interface GameSession {
  id: string
  gameId: string
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number // in minutes
  notes?: string
}