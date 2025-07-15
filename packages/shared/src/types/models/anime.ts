export interface Anime {
  id: string
  title: string
  titleEnglish?: string
  titleJapanese?: string
  type: AnimeType
  episodes?: number
  status: AnimeStatus
  airingStatus: AiringStatus
  aired: {
    from?: Date
    to?: Date
  }
  season?: AnimeSeason
  year?: number
  studios: string[]
  genres: string[]
  synopsis?: string
  imageUrl?: string
  score?: number
  userStatus?: UserAnimeStatus
}

export type AnimeType = 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special'

export type AnimeStatus = 'Finished Airing' | 'Currently Airing' | 'Not yet aired'

export type AiringStatus = 'finished' | 'airing' | 'upcoming'

export type AnimeSeason = 'winter' | 'spring' | 'summer' | 'fall'

export interface UserAnimeStatus {
  status: WatchStatus
  score?: number
  episodesWatched: number
  startDate?: Date
  finishDate?: Date
  notes?: string
  isFavorite: boolean
}

export type WatchStatus = 
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'plan_to_watch'

export interface AnimeListEntry {
  anime: Anime
  userStatus: UserAnimeStatus
  addedAt: Date
  updatedAt: Date
}