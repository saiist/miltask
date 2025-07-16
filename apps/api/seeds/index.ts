import { createClient } from '@libsql/client'

// ローカルSQLiteファイルのパス
const client = createClient({
  url: 'file:./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/otaku-secretary.sqlite'
})

const gameMasters = [
  {
    id: 'fgo',
    name: 'Fate/Grand Order',
    platform: 'mobile',
    dailyTasks: JSON.stringify([
      { id: 'login_bonus', name: 'ログインボーナス', priority: 'high' },
      { id: 'daily_quest', name: 'デイリークエスト', priority: 'medium' },
      { id: 'fp_gacha', name: 'フレンドポイント召喚', priority: 'low' }
    ]),
    iconUrl: null,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000)
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    platform: 'mobile',
    dailyTasks: JSON.stringify([
      { id: 'daily_commission', name: 'デイリー任務', priority: 'high' },
      { id: 'resin_spend', name: '樹脂消費', priority: 'high' },
      { id: 'realm_currency', name: '洞天宝銭回収', priority: 'medium' }
    ]),
    iconUrl: null,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000)
  },
  {
    id: 'umamusume',
    name: 'ウマ娘',
    platform: 'mobile',
    dailyTasks: JSON.stringify([
      { id: 'training', name: 'トレーニング', priority: 'high' },
      { id: 'race', name: 'レース', priority: 'medium' },
      { id: 'mission', name: 'ミッション', priority: 'medium' }
    ]),
    iconUrl: null,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000)
  }
]

async function seed() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // 既存のゲームマスターデータを削除
    await client.execute('DELETE FROM game_masters')
    
    // 新しいデータを挿入
    for (const game of gameMasters) {
      await client.execute({
        sql: `INSERT INTO game_masters (id, name, platform, daily_tasks, icon_url, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          game.id,
          game.name,
          game.platform,
          game.dailyTasks,
          game.iconUrl,
          game.createdAt,
          game.updatedAt
        ]
      })
      console.log(`✅ Added game: ${game.name}`)
    }
    
    console.log('🎉 Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

seed()