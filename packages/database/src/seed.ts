import { drizzle } from 'drizzle-orm/d1';
import { gameMasters } from './schema/game-masters';
import type { GameDailyTask } from './schema/game-masters';

const gameData = [
  {
    id: 'fgo',
    name: 'Fate/Grand Order',
    platform: 'mobile' as const,
    dailyTasks: [
      {
        id: 'login_bonus',
        name: 'ログインボーナス',
        description: '毎日のログインボーナスを受け取る',
        priority: 'medium' as const,
        resetTime: '04:00',
        category: 'login'
      },
      {
        id: 'ap_consumption',
        name: 'AP消化',
        description: 'AP（アクションポイント）を消化する',
        priority: 'medium' as const,
        category: 'combat'
      },
      {
        id: 'master_mission',
        name: 'マスターミッション',
        description: '週間マスターミッションを進める',
        priority: 'high' as const,
        category: 'mission'
      }
    ] as GameDailyTask[],
    iconUrl: 'https://cdn.example.com/fgo-icon.png'
  },
  {
    id: 'genshin',
    name: '原神',
    platform: 'multi' as const,
    dailyTasks: [
      {
        id: 'daily_commission',
        name: 'デイリー任務',
        description: '4つのデイリー任務をクリアする',
        priority: 'high' as const,
        resetTime: '05:00',
        category: 'mission'
      },
      {
        id: 'resin_consumption',
        name: '樹脂消化',
        description: '天然樹脂を消化する（上限160）',
        priority: 'medium' as const,
        category: 'resource'
      },
      {
        id: 'realm_currency',
        name: '洞天宝銭回収',
        description: '塵歌壺の洞天宝銭を回収する',
        priority: 'low' as const,
        resetTime: '05:00',
        category: 'collection'
      }
    ] as GameDailyTask[],
    iconUrl: 'https://cdn.example.com/genshin-icon.png'
  },
  {
    id: 'umamusume',
    name: 'ウマ娘 プリティーダービー',
    platform: 'mobile' as const,
    dailyTasks: [
      {
        id: 'daily_race',
        name: 'デイリーレース',
        description: 'デイリーレースに3回出走する',
        priority: 'medium' as const,
        resetTime: '05:00',
        category: 'combat'
      },
      {
        id: 'circle_competition',
        name: 'サークル競技場',
        description: 'サークル競技場に参加する',
        priority: 'low' as const,
        resetTime: '12:00',
        category: 'competition'
      },
      {
        id: 'training',
        name: '育成',
        description: 'ウマ娘の育成を進める',
        priority: 'high' as const,
        category: 'training'
      }
    ] as GameDailyTask[],
    iconUrl: 'https://cdn.example.com/umamusume-icon.png'
  },
  {
    id: 'granblue',
    name: 'グランブルーファンタジー',
    platform: 'multi' as const,
    dailyTasks: [
      {
        id: 'daily_mission',
        name: 'デイリーミッション',
        description: 'デイリーミッションをクリアする',
        priority: 'high' as const,
        resetTime: '05:00',
        category: 'mission'
      },
      {
        id: 'casino_poker',
        name: 'カジノポーカー',
        description: 'カジノでポーカーをプレイする',
        priority: 'low' as const,
        category: 'minigame'
      },
      {
        id: 'arcarum',
        name: 'アーカルム',
        description: 'アーカルムの転世を進める',
        priority: 'medium' as const,
        category: 'exploration'
      }
    ] as GameDailyTask[],
    iconUrl: 'https://cdn.example.com/granblue-icon.png'
  },
  {
    id: 'puzzdra',
    name: 'パズル&ドラゴンズ',
    platform: 'mobile' as const,
    dailyTasks: [
      {
        id: 'login_bonus',
        name: 'ログインボーナス',
        description: '毎日のログインボーナスを受け取る',
        priority: 'medium' as const,
        resetTime: '04:00',
        category: 'login'
      },
      {
        id: 'daily_dungeon',
        name: 'デイリーダンジョン',
        description: 'デイリーダンジョンをクリアする',
        priority: 'high' as const,
        category: 'combat'
      },
      {
        id: 'stamina_consumption',
        name: 'スタミナ消化',
        description: 'スタミナを効率的に消化する',
        priority: 'medium' as const,
        category: 'resource'
      }
    ] as GameDailyTask[],
    iconUrl: 'https://cdn.example.com/puzzdra-icon.png'
  }
];

export async function seedGameMasters(d1Database: D1Database) {
  const db = drizzle(d1Database);
  
  console.log('🌱 Seeding game masters...');
  
  try {
    for (const game of gameData) {
      await db.insert(gameMasters).values({
        id: game.id,
        name: game.name,
        platform: game.platform,
        dailyTasks: JSON.stringify(game.dailyTasks),
        iconUrl: game.iconUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✅ Added ${game.name}`);
    }
    
    console.log('🎉 Game masters seeding completed successfully');
  } catch (error) {
    console.error('❌ Game masters seeding failed:', error);
    throw error;
  }
}