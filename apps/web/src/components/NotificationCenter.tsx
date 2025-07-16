import { useState, useEffect } from "react"
import { Bell, CheckCircle2, Clock, Tv, Gamepad2, BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// 通知の型定義
interface Notification {
  id: string
  type: "reminder" | "new-anime" | "daily-achievement" | "new-book" | "game-reset"
  title: string
  description: string
  timestamp: number
  read: boolean
}

// モック通知データ
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "reminder",
    title: "⏰ デイリータスクリマインダー",
    description: "FGOのログインボーナスを忘れずに受け取りましょう",
    timestamp: Date.now() - 1000 * 60 * 30, // 30分前
    read: false,
  },
  {
    id: "notif-2",
    type: "new-anime",
    title: "📺 新着アニメ",
    description: "今日放送予定: SPY×FAMILY 第25話",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2時間前
    read: false,
  },
  {
    id: "notif-3",
    type: "daily-achievement",
    title: "✅ デイリー達成",
    description: "すべてのタスクを完了しました！お疲れ様でした！",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1日前
    read: true,
  },
  {
    id: "notif-4",
    type: "game-reset",
    title: "🎮 ゲームデイリーリセット",
    description: "原神のデイリー任務がリセットされました",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 120, // 1日と2時間前
    read: true,
  },
  {
    id: "notif-5",
    type: "new-book",
    title: "📚 新刊発売",
    description: "転生したらスライムだった件 22巻が発売されました！",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2日前
    read: true,
  },
]

// 通知アイコンのマップ
const notificationIcons = {
  reminder: Clock,
  "new-anime": Tv,
  "daily-achievement": CheckCircle2,
  "new-book": BookOpen,
  "game-reset": Gamepad2,
}

// 日付フォーマット関数
const formatDateForGrouping = (timestamp: number): string => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "今日"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "昨日"
  } else {
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
  }
}

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    console.log("NotificationCenter rendered")
  }, [])

  useEffect(() => {
    console.log("NotificationCenter open state changed:", open)
  }, [open])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  // 通知を日付でグループ化
  const groupedNotifications = notifications.reduce(
    (acc, notif) => {
      const dateGroup = formatDateForGrouping(notif.timestamp)
      if (!acc[dateGroup]) {
        acc[dateGroup] = []
      }
      acc[dateGroup].push(notif)
      return acc
    },
    {} as Record<string, Notification[]>,
  )

  const sortedDateGroups = Object.keys(groupedNotifications).sort((a, b) => {
    if (a === "今日") return -1
    if (b === "今日") return 1
    if (a === "昨日") return -1
    if (b === "昨日") return 1
    return new Date(b).getTime() - new Date(a).getTime()
  })

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className={`text-white/70 hover:text-white hover:bg-white/10 relative ${className}`}>
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md backdrop-blur-xl bg-slate-900/90 border border-white/20 text-white flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-300" />
              通知センター
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              すべて既読にする
            </Button>
          </SheetTitle>
          <SheetDescription className="text-white/70">あなたの趣味ライフに関する最新情報です。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          {notifications.length === 0 ? (
            <div className="text-center text-white/60 py-10">
              <Bell className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p>通知はありません。</p>
              <p className="text-sm">新しい情報が届くとここに表示されます。</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDateGroups.map((dateGroup) => (
                <div key={dateGroup}>
                  <h3 className="text-sm font-semibold text-white/80 mb-3 sticky top-0 bg-slate-900/90 backdrop-blur-sm py-2 -mx-4 px-4 z-10">
                    {dateGroup}
                    <Separator className="bg-white/10 mt-2" />
                  </h3>
                  <div className="space-y-3">
                    {groupedNotifications[dateGroup].map((notif) => {
                      const Icon = notificationIcons[notif.type]
                      return (
                        <div
                          key={notif.id}
                          className={`group relative p-4 rounded-xl transition-all duration-200 ${
                            notif.read
                              ? "bg-white/5 border border-white/10 text-white/70"
                              : "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {Icon && <Icon className="w-5 h-5 text-purple-300" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white/90">{notif.title}</h4>
                                <span className="text-xs text-white/50">
                                  {new Date(notif.timestamp).toLocaleTimeString("ja-JP", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-white/70 mt-1">{notif.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => deleteNotification(notif.id)}
                            aria-label="通知を削除"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}