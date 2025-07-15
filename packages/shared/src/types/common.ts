export type ID = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

export interface SoftDelete extends Timestamps {
  deletedAt?: Date
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ValueOf<T> = T[keyof T]

export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: string
  order: SortOrder
}