import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { useTodayTasks, useCreateTask, useCompleteTask } from "@/hooks/use-tasks"
import { useGames, useUserGames, useAddUserGame } from "@/hooks/use-games"
import { useStatistics } from "@/hooks/use-statistics"
import { useAnimeList, useCreateAnime } from "@/hooks/use-anime"
import {
  CheckCircle2,
  Circle,
  Clock,
  Star,
  Tv,
  Gamepad2,
  Calendar,
  Settings,
  User,
  LogOut,
  BarChart3,
  Activity,
  Plus,
  BarChart2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddTaskModal from "@/components/modals/add-task-modal"
import AddAnimeModal from "@/components/modals/add-anime-modal"
import AddGameFromListModal from "@/components/modals/add-game-from-list-modal"
import NotificationCenter from "@/components/NotificationCenter"
import type { TaskCreateInput, Task, AnimeCreateInput, Anime } from "@otaku-secretary/api-client"

// ゲームの型定義（ローカル管理用）

interface Game {
  id: string
  title: string
  platform: string
  status: "playing" | "completed" | "planned"
  hoursPlayed?: number
}

// モックデータ
const initialAnimes: Anime[] = [
  {
    id: "1",
    userId: "user1",
    title: "SPY×FAMILY",
    status: "watching",
    currentEpisode: 24,
    totalEpisodes: 25,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "2",
    userId: "user1",
    title: "葬送のフリーレン",
    status: "watching",
    currentEpisode: 16,
    totalEpisodes: 28,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

const initialGames: Game[] = [
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

// 統計カードコンポーネント
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  color: string
  trend?: string
  onClick?: () => void
}) => (
  <Card
    onClick={onClick}
    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-white/70 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && <span className={`text-sm ${color}`}>{trend}</span>}
          </div>
          <p className="text-white/60 text-xs">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color.replace("text-", "bg-").replace("-300", "-500/20")}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
)

// 空状態コンポーネント
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-white/60" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/60 text-center mb-6 max-w-md">{description}</p>
    <Button
      onClick={onAction}
      className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-0"
    >
      {actionLabel}
    </Button>
  </div>
)

// タスクカードコンポーネント
const TaskCard = ({ task, onToggle, isCompleting }: { task: Task; onToggle: (id: string) => void; isCompleting?: boolean }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-300 bg-red-500/20"
      case "medium":
        return "text-yellow-300 bg-yellow-500/20"
      case "low":
        return "text-green-300 bg-green-500/20"
      default:
        return "text-gray-300 bg-gray-500/20"
    }
  }

  return (
    <div className="group p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/20">
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task.id)} 
          className="mt-1 text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCompleting}
        >
          {isCompleting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
          ) : task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className={`font-medium text-white/90 ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
            <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
              {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
            </Badge>
          </div>
          {task.description && <p className="text-sm text-white/60">{task.description}</p>}
        </div>
      </div>
    </div>
  )
}

// アニメカードコンポーネント
const AnimeCard = ({ anime }: { anime: Anime }) => (
  <div className="p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/20">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium text-white/90">{anime.title}</h3>
      <Badge className="text-xs px-2 py-1 text-blue-300 bg-blue-500/20">
        {anime.status === "watching" ? "視聴中" : 
         anime.status === "completed" ? "完了" : 
         anime.status === "dropped" ? "中断" : "予定"}
      </Badge>
    </div>
    <div className="flex items-center gap-4 text-sm text-white/60">
      <span>
        {anime.currentEpisode}/{anime.totalEpisodes || "?"} 話
      </span>
      {anime.rating && (
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span>{anime.rating}</span>
        </div>
      )}
    </div>
  </div>
)

// ゲームカードコンポーネント
const GameCard = ({ game }: { game: Game }) => (
  <div className="p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/20">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium text-white/90">{game.title}</h3>
      <Badge className="text-xs px-2 py-1 text-green-300 bg-green-500/20">{game.platform}</Badge>
    </div>
    <div className="flex items-center gap-4 text-sm text-white/60">
      <span>{game.hoursPlayed || 0}時間プレイ</span>
      <Badge className="text-xs px-2 py-1 text-purple-300 bg-purple-500/20">
        {game.status === "playing" ? "プレイ中" : game.status === "completed" ? "完了" : "予定"}
      </Badge>
    </div>
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout, isLoggingOut } = useAuth()
  const { data: todayTasksData, isLoading: isLoadingTasks, error: tasksError } = useTodayTasks()
  const createTaskMutation = useCreateTask()
  const completeTaskMutation = useCompleteTask()
  
  // ゲーム関連のフック
  const { data: availableGames, isLoading: isLoadingGames, error: gamesError } = useGames()
  const { data: userGames } = useUserGames()
  const addUserGameMutation = useAddUserGame()
  
  // 統計データのフック
  const { data: statisticsData } = useStatistics()
  
  // アニメ関連のフック
  const { data: animeList, error: animeError } = useAnimeList()
  const createAnimeMutation = useCreateAnime()
  
  const [animes] = useState<Anime[]>(initialAnimes)
  const [games] = useState<Game[]>(initialGames)
  const [activeTab, setActiveTab] = useState("overview")
  const [taskFilter, setTaskFilter] = useState<"all" | "completed" | "pending">("all")
  const [animeFilter, setAnimeFilter] = useState<"all" | "watching" | "completed" | "planned" | "dropped">("all")
  const [gameFilter, setGameFilter] = useState<"all" | "playing" | "completed" | "planned">("all")
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddAnimeModal, setShowAddAnimeModal] = useState(false)
  const [showAddGameModal, setShowAddGameModal] = useState(false)

  // APIデータとモックデータを結合した統計
  const currentAnimeList = animeList || animes
  const stats = {
    completedTasks: statisticsData?.today.completed || todayTasksData?.summary.completed || 0,
    activeTasks: statisticsData?.today.total 
      ? (statisticsData.today.total - statisticsData.today.completed)
      : (todayTasksData?.summary.total ? (todayTasksData.summary.total - todayTasksData.summary.completed) : 0),
    watchingAnime: currentAnimeList.filter(anime => anime.status === "watching").length,
    playingGames: statisticsData?.games.active || userGames?.filter(ug => ug.active).length || 0,
    weeklyChange: statisticsData?.week.trend || "+0%",
    overdueCount: 0, // TODO: 期限切れタスクAPIから取得
    currentSeason: "2024冬",
    completedGames: 0, // TODO: 完了済みゲームAPIから取得
    completionRate: statisticsData?.today.completionRate || todayTasksData?.summary.completionRate || 0
  }

  const handleLogout = () => {
    logout()
  }

  const toggleTask = (taskId: string) => {
    // タスクの完了状態を切り替える
    const task = todayTasksData?.tasks.find((t: Task) => t.id === taskId)
    if (task && !task.completed) {
      // 未完了のタスクのみ完了にできる
      completeTaskMutation.mutate(taskId)
    }
  }

  const handleAddTask = async (taskData: {
    title: string;
    description?: string;
    type: 'anime' | 'game-daily' | 'book-release';
    priority: 'low' | 'medium' | 'high';
    deadline?: Date;
  }) => {
    const input: TaskCreateInput = {
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority,
      deadline: taskData.deadline?.toISOString(),
    }
    
    await createTaskMutation.mutateAsync(input)
  }

  const addAnime = async (animeData: any) => {
    const animeInput: AnimeCreateInput = {
      title: animeData.title,
      malId: animeData.mal_id,
      imageUrl: animeData.image_url,
      status: animeData.status || "planned",
      currentEpisode: animeData.currentEpisode || 0,
      totalEpisodes: animeData.episodes || animeData.totalEpisodes,
      rating: animeData.rating,
      notes: animeData.notes,
    }
    
    await createAnimeMutation.mutateAsync(animeInput)
  }

  const addGame = async (gameId: string) => {
    // ゲームをユーザーのリストに追加
    await addUserGameMutation.mutateAsync({ gameId })
  }

  // フィルターされたデータ
  const filteredTasks = todayTasksData?.tasks.filter((task: Task) => {
    if (taskFilter === "completed") return task.completed
    if (taskFilter === "pending") return !task.completed
    return true
  }) || []

  const filteredAnimes = currentAnimeList.filter((anime) => {
    if (animeFilter === "watching") return anime.status === "watching"
    if (animeFilter === "completed") return anime.status === "completed"
    if (animeFilter === "planned") return anime.status === "planned"
    if (animeFilter === "dropped") return anime.status === "dropped"
    return true
  })

  const filteredGames = games.filter((game) => {
    if (gameFilter === "playing") return game.status === "playing"
    if (gameFilter === "completed") return game.status === "completed"
    if (gameFilter === "planned") return game.status === "planned"
    return true
  })

  // 初回ローディング時のスケルトン
  if (isLoadingTasks && !todayTasksData) {
    return (
      <div className="min-h-screen relative">
        {/* 幻想的な背景 */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950" />
        <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent" />
        
        <FloatingStars />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            <p className="text-white/70 text-lg">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    )
  }

  // エラー時の表示
  if (tasksError || animeError || gamesError) {
    return (
      <div className="min-h-screen relative">
        {/* 幻想的な背景 */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950" />
        <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent" />
        
        <FloatingStars />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">エラーが発生しました</h2>
            <p className="text-white/70 mb-6">データの読み込みに失敗しました。もう一度お試しください。</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-0"
            >
              再読み込み
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* 幻想的な背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950" />
      <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent" />

      {/* 浮遊する星 */}
      <FloatingStars />

      {/* ヘッダー */}
      <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-sm">
                👩‍💼
              </div>
              <h1 className="text-xl font-bold text-white">ミルタス</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm mr-4">ようこそ、{user?.username || user?.email}さん</span>
              <NotificationCenter />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/statistics")}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <BarChart2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/notifications")}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページタイトル */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">ダッシュボード</h2>
          <p className="text-white/70">あなたの趣味ライフを効率的に管理しましょう</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="完了タスク"
            value={stats.completedTasks}
            subtitle="今週 +0%"
            icon={CheckCircle2}
            color="text-green-300"
            trend="+0%"
            onClick={() => setActiveTab("tasks")}
          />
          <StatsCard
            title="進行中タスク"
            value={stats.activeTasks}
            subtitle="期限切れ 0件"
            icon={Clock}
            color="text-orange-300"
            onClick={() => setActiveTab("tasks")}
          />
          <StatsCard
            title="視聴中アニメ"
            value={stats.watchingAnime}
            subtitle="今期 0作品"
            icon={Tv}
            color="text-pink-300"
            onClick={() => setActiveTab("anime")}
          />
          <StatsCard
            title="プレイ中ゲーム"
            value={stats.playingGames}
            subtitle="完了 0本"
            icon={Gamepad2}
            color="text-blue-300"
            onClick={() => setActiveTab("games")}
          />
        </div>

        {/* タブコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg"
            >
              概要
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg"
            >
              タスク
            </TabsTrigger>
            <TabsTrigger
              value="anime"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg"
            >
              アニメ
            </TabsTrigger>
            <TabsTrigger
              value="games"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-lg"
            >
              ゲーム
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 今日のタスク */}
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-300" />
                    今日のタスク
                  </CardTitle>
                  <p className="text-white/60 text-sm">本日予定されているタスクです</p>
                </CardHeader>
                <CardContent>
                  {isLoadingTasks ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-purple-100/60">読み込み中...</p>
                    </div>
                  ) : todayTasksData?.tasks.length ? (
                    <div className="space-y-3">
                      {todayTasksData.tasks.slice(0, 3).map((task: Task) => (
                        <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                      ))}
                      <div className="pt-3 border-t border-white/10">
                        <Button
                          onClick={() => setActiveTab("tasks")}
                          variant="ghost"
                          className="w-full text-white/70 hover:text-white hover:bg-white/10"
                        >
                          + タスクを追加
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="タスクがありません"
                      description="最初のタスクを作成してみましょう"
                      actionLabel="タスクを作成"
                      onAction={() => setActiveTab("tasks")}
                    />
                  )}
                </CardContent>
              </Card>

              {/* 最近のアクティビティ */}
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-300" />
                    最近のアクティビティ
                  </CardTitle>
                  <p className="text-white/60 text-sm">直近の活動履歴です</p>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={Activity}
                    title="アクティビティがありません"
                    description="活動を開始すると履歴が表示されます"
                    actionLabel="活動を開始"
                    onAction={() => {}}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-300" />
                  タスク一覧
                </CardTitle>
                <Button
                  onClick={() => setShowAddTaskModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => setTaskFilter("all")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      taskFilter === "all" ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    すべて
                  </Button>
                  <Button
                    onClick={() => setTaskFilter("pending")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      taskFilter === "pending"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    未完了
                  </Button>
                  <Button
                    onClick={() => setTaskFilter("completed")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      taskFilter === "completed"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    完了済み
                  </Button>
                </div>
                {filteredTasks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={toggleTask}
                        isCompleting={completeTaskMutation.isPending && completeTaskMutation.variables === task.id}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="タスクがありません"
                    description="最初のタスクを作成してみましょう"
                    actionLabel="タスクを作成"
                    onAction={() => setShowAddTaskModal(true)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anime" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-pink-300" />
                  アニメリスト
                </CardTitle>
                <Button
                  onClick={() => setShowAddAnimeModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => setAnimeFilter("all")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      animeFilter === "all" ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    すべて
                  </Button>
                  <Button
                    onClick={() => setAnimeFilter("watching")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      animeFilter === "watching"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    視聴中
                  </Button>
                  <Button
                    onClick={() => setAnimeFilter("completed")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      animeFilter === "completed"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    完了
                  </Button>
                  <Button
                    onClick={() => setAnimeFilter("planned")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      animeFilter === "planned"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    視聴予定
                  </Button>
                  <Button
                    onClick={() => setAnimeFilter("dropped")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      animeFilter === "dropped"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    中断
                  </Button>
                </div>
                {filteredAnimes.length > 0 ? (
                  <div className="space-y-3">
                    {filteredAnimes.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Tv}
                    title="アニメが登録されていません"
                    description="お気に入りのアニメを追加してみましょう"
                    actionLabel="アニメを追加"
                    onAction={() => setShowAddAnimeModal(true)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-blue-300" />
                  ゲームリスト
                </CardTitle>
                <Button
                  onClick={() => setShowAddGameModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => setGameFilter("all")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      gameFilter === "all" ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    すべて
                  </Button>
                  <Button
                    onClick={() => setGameFilter("playing")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      gameFilter === "playing"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    プレイ中
                  </Button>
                  <Button
                    onClick={() => setGameFilter("completed")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      gameFilter === "completed"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    完了
                  </Button>
                  <Button
                    onClick={() => setGameFilter("planned")}
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-full text-sm ${
                      gameFilter === "planned"
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    プレイ予定
                  </Button>
                </div>
                {filteredGames.length > 0 ? (
                  <div className="space-y-3">
                    {filteredGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Gamepad2}
                    title="ゲームが登録されていません"
                    description="プレイしているゲームを追加してみましょう"
                    actionLabel="ゲームを追加"
                    onAction={() => setShowAddGameModal(true)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>

      {/* モーダル */}
      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onSubmit={handleAddTask}
      />
      <AddAnimeModal
        open={showAddAnimeModal}
        onOpenChange={setShowAddAnimeModal}
        onSubmit={addAnime}
      />
      <AddGameFromListModal
        open={showAddGameModal}
        onOpenChange={setShowAddGameModal}
        games={availableGames || []}
        onSelectGame={addGame}
        isLoading={isLoadingGames}
      />

    </div>
  )
}