import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, CheckCircle2, Clock, Calendar, BookOpen, Gamepad2, Plus, Star, Heart, Sparkles, User, TrendingUp } from "lucide-react"
import AddTaskModal from "@/components/modals/add-task-modal"
import AddAnimeModal from "@/components/modals/add-anime-modal"
import AddGameModal from "@/components/modals/add-game-modal"

// 浮遊する星のコンポーネント
const FloatingStars = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([])

  useEffect(() => {
    const newStars = Array.from({ length: 30 }, (_, i) => ({
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
          <Star className="w-1 h-1 text-white/20 fill-current animate-bounce" />
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout, isLoggingOut } = useAuth()
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddAnimeModal, setShowAddAnimeModal] = useState(false)
  const [showAddGameModal, setShowAddGameModal] = useState(false)

  // Mock data - これらは後で実際のAPIから取得する
  const stats = {
    completedTasks: 23,
    activeTasks: 7,
    watchingAnime: 5,
    playingGames: 3,
    weeklyChange: "+12%",
    overdueCount: 2,
    currentSeason: "2024冬",
    completedGames: 15
  }

  const handleAddTask = async (taskData: any) => {
    console.log('Adding task:', taskData)
    // TODO: API呼び出しを実装
  }

  const handleAddAnime = async (animeData: any) => {
    console.log('Adding anime:', animeData)
    // TODO: API呼び出しを実装
  }

  const handleAddGame = async (gameData: any) => {
    console.log('Adding game:', gameData)
    // TODO: API呼び出しを実装
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 幻想的な背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950" />
      <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent" />
      
      {/* 浮遊する星 */}
      <FloatingStars />

      {/* ヘッダー */}
      <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400/30 to-indigo-500/30 rounded-full flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full flex items-center justify-center text-sm shadow-inner">
                👩‍💼
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              オタク秘書 <Sparkles className="w-5 h-5 text-purple-300" />
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-300" />
                {user?.username || user?.email}さん
              </div>
              <div className="text-xs text-purple-200/80">おかえりなさい！</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-red-300 rounded-xl transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-lg bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            ダッシュボード
          </h2>
          <p className="text-purple-100/90 text-lg">
            あなたのオタク活動を効率的に管理しましょう ✨
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-500/20" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">完了タスク</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white drop-shadow-lg">{stats.completedTasks}</div>
              <p className="text-xs text-emerald-200/80 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                今週 {stats.weeklyChange}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-500/20" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">進行中タスク</CardTitle>
              <Clock className="h-5 w-5 text-orange-300" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white drop-shadow-lg">{stats.activeTasks}</div>
              <p className="text-xs text-orange-200/80">
                期限切れ {stats.overdueCount}件
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-pink-500/25 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-500/20" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">視聴中アニメ</CardTitle>
              <BookOpen className="h-5 w-5 text-pink-300" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white drop-shadow-lg">{stats.watchingAnime}</div>
              <p className="text-xs text-pink-200/80">
                {stats.currentSeason} {stats.watchingAnime}作品
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">プレイ中ゲーム</CardTitle>
              <Gamepad2 className="h-5 w-5 text-blue-300" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white drop-shadow-lg">{stats.playingGames}</div>
              <p className="text-xs text-blue-200/80">
                完了 {stats.completedGames}本
              </p>
            </CardContent>
          </Card>
        </div>

        {/* タブコンテンツ */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300">
              概要
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300">
              タスク
            </TabsTrigger>
            <TabsTrigger value="anime" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300">
              アニメ
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-white text-white/70 rounded-xl transition-all duration-300">
              ゲーム
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 今日のタスク */}
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10" />
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-300" />
                    今日のタスク
                  </CardTitle>
                  <CardDescription className="text-purple-100/80">
                    本日予定されているタスクです
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-center py-8 text-purple-100/60">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">今日のタスクはありません</p>
                    <p className="text-sm">素晴らしい一日をお過ごしください！</p>
                  </div>
                </CardContent>
              </Card>

              {/* 最近のアクティビティ */}
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-blue-400/10" />
                <CardHeader className="relative">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-300" />
                    最近のアクティビティ
                  </CardTitle>
                  <CardDescription className="text-indigo-100/80">
                    直近の活動履歴です
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-center py-8 text-indigo-100/60">
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">アクティビティがありません</p>
                    <p className="text-sm">新しいタスクを作成してみましょう！</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-green-400/10" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      タスク一覧
                    </CardTitle>
                    <CardDescription className="text-emerald-100/80">
                      あなたのタスクを管理します
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    タスクを追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-center py-16 text-emerald-100/60">
                  <Calendar className="h-20 w-20 mx-auto mb-6 opacity-30" />
                  <p className="text-xl font-medium mb-3">タスクがありません</p>
                  <p className="text-sm mb-6">最初のタスクを作成してみましょう</p>
                  <Button
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    タスクを作成
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anime" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-rose-400/10" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-pink-300" />
                      アニメリスト
                    </CardTitle>
                    <CardDescription className="text-pink-100/80">
                      視聴中・視聴予定のアニメを管理します
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddAnimeModal(true)}
                    className="bg-gradient-to-r from-pink-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    アニメを追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-center py-16 text-pink-100/60">
                  <BookOpen className="h-20 w-20 mx-auto mb-6 opacity-30" />
                  <p className="text-xl font-medium mb-3">アニメが登録されていません</p>
                  <p className="text-sm mb-6">お気に入りのアニメを追加してみましょう</p>
                  <Button
                    onClick={() => setShowAddAnimeModal(true)}
                    className="bg-gradient-to-r from-pink-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    アニメを追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-blue-300" />
                      ゲームリスト
                    </CardTitle>
                    <CardDescription className="text-blue-100/80">
                      プレイ中・プレイ予定のゲームを管理します
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddGameModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    ゲームを追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-center py-16 text-blue-100/60">
                  <Gamepad2 className="h-20 w-20 mx-auto mb-6 opacity-30" />
                  <p className="text-xl font-medium mb-3">ゲームが登録されていません</p>
                  <p className="text-sm mb-6">プレイしているゲームを追加してみましょう</p>
                  <Button
                    onClick={() => setShowAddGameModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    ゲームを追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
        onSubmit={handleAddAnime}
      />
      <AddGameModal
        open={showAddGameModal}
        onOpenChange={setShowAddGameModal}
        onSubmit={handleAddGame}
      />
    </div>
  )
}