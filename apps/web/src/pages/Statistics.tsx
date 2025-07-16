"use client"
import { useState, useEffect } from "react"
import { BarChart2, CheckCircle2, Tv, Gamepad2, BookOpen, TrendingUp, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Star from "@/components/ui/star"

// タスクの型定義
interface Task {
  id: string
  type: "anime" | "game-daily" | "book-release"
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  deadline?: number
  completed: boolean
  source: "manual" | "api" | "scraping"
  metadata?: {
    episode?: number
    airTime?: string
    channel?: string
    gameId?: string
    resetTime?: string
  }
}

// アニメの型定義
interface Anime {
  id: string
  title: string
  status: "watching" | "completed" | "planned"
  currentEpisode: number
  totalEpisodes?: number
  rating?: number
}

// ゲームの型定義
interface Game {
  id: string
  title: string
  platform: string
  status: "playing" | "completed" | "planned"
  hoursPlayed?: number
}

// モックデータ
const mockTasks: Task[] = [
  {
    id: "1",
    type: "anime",
    title: "SPY×FAMILY 第25話",
    description: "2クール目第1話",
    priority: "high",
    deadline: Date.now() + 3600000,
    completed: false,
    source: "scraping",
    metadata: { episode: 25, airTime: "23:00", channel: "テレビ東京" },
  },
  {
    id: "2",
    type: "game-daily",
    title: "FGO - ログインボーナス",
    priority: "medium",
    completed: true,
    source: "api",
    metadata: { gameId: "fgo", resetTime: "04:00" },
  },
  {
    id: "3",
    type: "anime",
    title: "葬送のフリーレン 第17話",
    description: "魔法使いの試験編",
    priority: "medium",
    deadline: Date.now() + 7200000,
    completed: true,
    source: "scraping",
    metadata: { episode: 17, airTime: "22:30", channel: "日本テレビ" },
  },
  {
    id: "4",
    type: "game-daily",
    title: "原神 - デイリー任務",
    priority: "high",
    deadline: Date.now() + 18000000,
    completed: false,
    source: "api",
    metadata: { gameId: "genshin", resetTime: "05:00" },
  },
  {
    id: "5",
    type: "book-release",
    title: "転生したらスライムだった件 22巻",
    description: "最新刊発売",
    priority: "high",
    completed: false,
    source: "manual",
  },
]

const mockAnimes: Anime[] = [
  {
    id: "1",
    title: "SPY×FAMILY",
    status: "watching",
    currentEpisode: 24,
    totalEpisodes: 25,
    rating: 5,
  },
  {
    id: "2",
    title: "葬送のフリーレン",
    status: "completed",
    currentEpisode: 28,
    totalEpisodes: 28,
    rating: 5,
  },
  {
    id: "3",
    title: "呪術廻戦",
    status: "watching",
    currentEpisode: 10,
    totalEpisodes: 24,
    rating: 4,
  },
  {
    id: "4",
    title: "僕のヒーローアカデミア",
    status: "planned",
    currentEpisode: 0,
    totalEpisodes: 100,
    rating: undefined,
  },
]

const mockGames: Game[] = [
  {
    id: "1",
    title: "Fate/Grand Order",
    platform: "Mobile",
    status: "playing",
    hoursPlayed: 1200,
  },
  {
    id: "2",
    title: "原神",
    platform: "PC",
    status: "playing",
    hoursPlayed: 800,
  },
  {
    id: "3",
    title: "ゼルダの伝説 ティアーズ オブ ザ キングダム",
    platform: "Switch",
    status: "completed",
    hoursPlayed: 150,
  },
  {
    id: "4",
    title: "ファイナルファンタジーVII リバース",
    platform: "PS5",
    status: "planned",
    hoursPlayed: 0,
  },
]

// 浮遊する星のコンポーネント
const FloatingStars = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([])

  useEffect(() => {
    const newStars = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 0.5 + 0.5,
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            transform: `scale(${star.size})`,
          }}
        >
          <Star className="w-2 h-2 text-pink-300/40 fill-current animate-bounce" />
        </div>
      ))}
    </div>
  )
}

export default function StatisticsDashboard() {
  // 統計データの計算
  const totalTasks = mockTasks.length
  const completedTasks = mockTasks.filter((task) => task.completed).length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const animeCounts = {
    watching: mockAnimes.filter((anime) => anime.status === "watching").length,
    completed: mockAnimes.filter((anime) => anime.status === "completed").length,
    planned: mockAnimes.filter((anime) => anime.status === "planned").length,
    total: mockAnimes.length,
  }

  const gameCounts = {
    playing: mockGames.filter((game) => game.status === "playing").length,
    completed: mockGames.filter((game) => game.status === "completed").length,
    planned: mockGames.filter((game) => game.status === "planned").length,
    total: mockGames.length,
  }

  const taskTypeCounts = mockTasks.reduce(
    (acc, task) => {
      if (task.completed) {
        acc[task.type] = (acc[task.type] || 0) + 1
      }
      return acc
    },
    {} as Record<Task["type"], number>,
  )

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* 幻想的な背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950 -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent -z-10" />

      {/* 浮遊する星 */}
      <FloatingStars />

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-purple-300" />
          統計ダッシュボード
        </h2>
        <p className="text-white/70 mb-8">あなたのオタク活動の傾向を分析しましょう。</p>

        {/* 全体タスク完了率 */}
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              全体タスク完了率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-lg font-semibold">
                {completedTasks}/{totalTasks} 完了
              </span>
              <span className="text-white text-2xl font-bold">{taskCompletionRate}%</span>
            </div>
            <Progress value={taskCompletionRate} className="h-4 bg-white/20" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* タスクタイプ別完了数 */}
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-300" />
                タスクタイプ別完了数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-pink-300" />
                    <span>アニメ</span>
                  </div>
                  <span className="font-semibold">{taskTypeCounts.anime || 0} 件</span>
                </div>
                <Progress value={((taskTypeCounts.anime || 0) / completedTasks) * 100} className="h-2 bg-white/20" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-blue-300" />
                    <span>ゲームデイリー</span>
                  </div>
                  <span className="font-semibold">{taskTypeCounts["game-daily"] || 0} 件</span>
                </div>
                <Progress
                  value={((taskTypeCounts["game-daily"] || 0) / completedTasks) * 100}
                  className="h-2 bg-white/20"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-300" />
                    <span>新刊</span>
                  </div>
                  <span className="font-semibold">{taskTypeCounts["book-release"] || 0} 件</span>
                </div>
                <Progress
                  value={((taskTypeCounts["book-release"] || 0) / completedTasks) * 100}
                  className="h-2 bg-white/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* アニメ視聴ステータス */}
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-pink-300" />
                アニメ視聴ステータス
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-blue-300 fill-current" />
                  <span>視聴中</span>
                </div>
                <span className="font-semibold">
                  {animeCounts.watching} 作品 ({((animeCounts.watching / animeCounts.total) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-green-300 fill-current" />
                  <span>完了</span>
                </div>
                <span className="font-semibold">
                  {animeCounts.completed} 作品 ({((animeCounts.completed / animeCounts.total) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-yellow-300 fill-current" />
                  <span>視聴予定</span>
                </div>
                <span className="font-semibold">
                  {animeCounts.planned} 作品 ({((animeCounts.planned / animeCounts.total) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 text-white/70 text-sm">合計: {animeCounts.total} 作品</div>
            </CardContent>
          </Card>

          {/* ゲームプレイ状況 */}
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-300" />
                ゲームプレイ状況
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-purple-300 fill-current" />
                  <span>プレイ中</span>
                </div>
                <span className="font-semibold">
                  {gameCounts.playing} 本 ({((gameCounts.playing / gameCounts.total) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-emerald-300 fill-current" />
                  <span>完了</span>
                </div>
                <span className="font-semibold">
                  {gameCounts.completed} 本 ({((gameCounts.completed / gameCounts.total) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-orange-300 fill-current" />
                  <span>プレイ予定</span>
                </div>
                <span className="font-semibold">
                  {gameCounts.planned} 本 ({((gameCounts.planned / gameCounts.total) * 100 || 0).toFixed(0)}%)
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 text-white/70 text-sm">合計: {gameCounts.total} 本</div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </div>
  )
}