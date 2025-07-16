import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, CheckCircle2, Clock, Calendar, BookOpen, Gamepad2 } from "lucide-react"

export default function Dashboard() {
  const { user, logout, isLoggingOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">オタク秘書</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              ようこそ、{user?.username || user?.email}さん
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">ダッシュボード</h2>
          <p className="text-muted-foreground">
            あなたのオタク活動を効率的に管理しましょう
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                今週 +0%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">進行中タスク</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                期限切れ 0件
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">視聴中アニメ</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                今期 0作品
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">プレイ中ゲーム</CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                完了 0本
              </p>
            </CardContent>
          </Card>
        </div>

        {/* タブコンテンツ */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="tasks">タスク</TabsTrigger>
            <TabsTrigger value="anime">アニメ</TabsTrigger>
            <TabsTrigger value="games">ゲーム</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 今日のタスク */}
              <Card>
                <CardHeader>
                  <CardTitle>今日のタスク</CardTitle>
                  <CardDescription>
                    本日予定されているタスクです
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    タスクがありません
                  </div>
                </CardContent>
              </Card>

              {/* 最近のアクティビティ */}
              <Card>
                <CardHeader>
                  <CardTitle>最近のアクティビティ</CardTitle>
                  <CardDescription>
                    直近の活動履歴です
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    アクティビティがありません
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>タスク一覧</CardTitle>
                <CardDescription>
                  あなたのタスクを管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">タスクがありません</p>
                  <p className="text-sm mb-4">最初のタスクを作成してみましょう</p>
                  <Button>
                    タスクを作成
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>アニメリスト</CardTitle>
                <CardDescription>
                  視聴中・視聴予定のアニメを管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">アニメが登録されていません</p>
                  <p className="text-sm mb-4">お気に入りのアニメを追加してみましょう</p>
                  <Button>
                    アニメを追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ゲームリスト</CardTitle>
                <CardDescription>
                  プレイ中・プレイ予定のゲームを管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">ゲームが登録されていません</p>
                  <p className="text-sm mb-4">プレイしているゲームを追加してみましょう</p>
                  <Button>
                    ゲームを追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}