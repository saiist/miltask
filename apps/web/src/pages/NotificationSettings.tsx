import { useState, useEffect } from "react"
import { Bell, Settings, Clock, Smartphone, Save, AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router"

export default function NotificationSettings() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  const [reminders, setReminders] = useState({
    oneHourBefore: true,
    threeHoursBefore: false,
    oneDayBefore: true,
  })
  const [dailyTaskTime, setDailyTaskTime] = useState("09:00")

  const [contentNotifications, setContentNotifications] = useState({
    animeBroadcast: true,
    gameDailyReset: true,
    newBookRelease: true,
    taskCompletionReminder: true,
  })

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === "granted") {
        setBrowserNotificationsEnabled(true)
      }
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === "granted") {
        setBrowserNotificationsEnabled(true)
        toast({
          title: "通知が許可されました",
          description: "ブラウザ通知が有効になりました。",
        })
      } else {
        setBrowserNotificationsEnabled(false)
        toast({
          title: "通知が拒否されました",
          description: "ブラウザ通知を有効にするには、ブラウザの設定から許可してください。",
          variant: "destructive",
        })
      }
    }
  }

  const handleSaveSettings = () => {
    // ここで設定を保存するAPI呼び出しなどをシミュレート
    console.log("通知設定を保存:", {
      browserNotificationsEnabled,
      reminders,
      dailyTaskTime,
      contentNotifications,
    })
    toast({
      title: "設定を保存しました",
      description: "通知設定が更新されました。",
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 幻想的な背景 - ダッシュボードと同じ */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950" />
      <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent" />

      {/* ヘッダー */}
      <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-sm">
                👩‍💼
              </div>
              <h1 className="text-xl font-bold text-white">オタク秘書</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto relative z-10 space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-purple-300" />
            通知設定
          </h2>
          <p className="text-white/70">通知の受け取り方や内容をカスタマイズできます。</p>
        </div>

        {/* ブラウザ通知 */}
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl hover:translate-y-[-2px] transition-transform duration-200">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-300" />
              ブラウザ通知
            </CardTitle>
            <CardDescription className="text-white/60">デスクトップ通知の有効/無効を設定します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-notifications" className="text-white/90">
                デスクトップ通知を有効にする
              </Label>
              <Switch
                id="browser-notifications"
                checked={browserNotificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked && notificationPermission !== "granted") {
                    requestNotificationPermission()
                  } else {
                    setBrowserNotificationsEnabled(checked)
                  }
                }}
                className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-white/30 focus-visible:outline-purple-500 focus-visible:outline-offset-2 transition-colors duration-300"
              />
            </div>
            {notificationPermission === "denied" && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>ブラウザの通知が拒否されています。設定から許可してください。</span>
              </div>
            )}
            {notificationPermission === "default" && browserNotificationsEnabled && (
              <div className="flex items-center gap-2 text-yellow-300 text-sm bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>ブラウザの通知許可が必要です。</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="ml-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  通知を許可する
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* リマインダー設定 */}
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl hover:translate-y-[-2px] transition-transform duration-200">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-300" />
              リマインダー設定
            </CardTitle>
            <CardDescription className="text-white/60">
              タスク期限やデイリータスクのリマインダーを設定します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-white/90">タスク期限前の通知</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-1h" className="text-white/80">
                    1時間前
                  </Label>
                  <Switch
                    id="reminder-1h"
                    checked={reminders.oneHourBefore}
                    onCheckedChange={(checked) => setReminders((prev) => ({ ...prev, oneHourBefore: checked }))}
                    className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-white/30 focus-visible:outline-purple-500 focus-visible:outline-offset-2 transition-colors duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-3h" className="text-white/80">
                    3時間前
                  </Label>
                  <Switch
                    id="reminder-3h"
                    checked={reminders.threeHoursBefore}
                    onCheckedChange={(checked) => setReminders((prev) => ({ ...prev, threeHoursBefore: checked }))}
                    className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-white/30 focus-visible:outline-purple-500 focus-visible:outline-offset-2 transition-colors duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-1d" className="text-white/80">
                    1日前
                  </Label>
                  <Switch
                    id="reminder-1d"
                    checked={reminders.oneDayBefore}
                    onCheckedChange={(checked) => setReminders((prev) => ({ ...prev, oneDayBefore: checked }))}
                    className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-white/30 focus-visible:outline-purple-500 focus-visible:outline-offset-2 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-task-time" className="text-white/90">
                デイリータスクの通知時刻
              </Label>
              <Select value={dailyTaskTime} onValueChange={setDailyTaskTime}>
                <SelectTrigger id="daily-task-time" className="bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder="時刻を選択" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = i.toString().padStart(2, "0")
                    return (
                      <SelectItem key={hour} value={`${hour}:00`} className="text-white hover:bg-white/10">
                        {`${hour}:00`}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 通知する内容 */}
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl hover:translate-y-[-2px] transition-transform duration-200">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-300" />
              通知する内容
            </CardTitle>
            <CardDescription className="text-white/60">受け取りたい通知の種類を選択します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notify-anime"
                checked={contentNotifications.animeBroadcast}
                onCheckedChange={(checked) =>
                  setContentNotifications((prev) => ({ ...prev, animeBroadcast: checked as boolean }))
                }
                className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label htmlFor="notify-anime" className="text-white/90 cursor-pointer">
                アニメ放送開始
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notify-game"
                checked={contentNotifications.gameDailyReset}
                onCheckedChange={(checked) =>
                  setContentNotifications((prev) => ({ ...prev, gameDailyReset: checked as boolean }))
                }
                className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label htmlFor="notify-game" className="text-white/90 cursor-pointer">
                ゲームデイリーリセット
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notify-book"
                checked={contentNotifications.newBookRelease}
                onCheckedChange={(checked) =>
                  setContentNotifications((prev) => ({ ...prev, newBookRelease: checked as boolean }))
                }
                className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label htmlFor="notify-book" className="text-white/90 cursor-pointer">
                新刊発売日
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notify-task-completion"
                checked={contentNotifications.taskCompletionReminder}
                onCheckedChange={(checked) =>
                  setContentNotifications((prev) => ({ ...prev, taskCompletionReminder: checked as boolean }))
                }
                className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label htmlFor="notify-task-completion" className="text-white/90 cursor-pointer">
                タスク完了リマインダー
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-0 px-8 py-3"
          >
            <Save className="w-4 h-4 mr-2" />
            変更を保存
          </Button>
        </div>
      </div>
    </div>
  )
}