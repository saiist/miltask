export const APP_NAME = 'ミルタス'
export const APP_NAME_EN = 'Otaku Secretary'

export const APP_VERSION = '0.0.1'

export const APP_DESCRIPTION = 'アニメ、ゲーム、書籍管理とタスク管理を統合したオタク向け生産性アプリ'

export const API_BASE_URL = '/api'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const SUPPORTED_LANGUAGES = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' }
] as const

export const DEFAULT_LANGUAGE = 'ja'

export const THEMES = [
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
  { value: 'auto', label: '自動' }
] as const

export const DEFAULT_THEME = 'auto'

export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm'

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'フリー',
    maxTasks: 100,
    maxItems: 500,
    features: ['基本機能', 'タスク管理', 'コレクション管理']
  },
  pro: {
    name: 'プロ',
    maxTasks: 1000,
    maxItems: 5000,
    features: ['全機能', 'APIアクセス', '優先サポート', '高度な統計']
  },
  premium: {
    name: 'プレミアム',
    maxTasks: -1, // 無制限
    maxItems: -1,
    features: ['全機能', 'APIアクセス', '優先サポート', '高度な統計', 'カスタムテーマ', 'データエクスポート']
  }
} as const