import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Star, Heart, Play, Clock, CheckCircle2, Pause, X as XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { GamePlatform } from "@otaku-secretary/shared"

const gameFormSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内で入力してください"),
  platform: z.array(z.enum([
    "PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", 
    "Nintendo Switch", "Steam Deck", "Mobile"
  ] as const)).min(1, "プラットフォームを選択してください"),
  genre: z.array(z.string()).default([]),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  metacriticScore: z.number().int().min(0).max(100).optional(),
  userStatus: z.object({
    status: z.enum(["playing", "completed", "on_hold", "dropped", "plan_to_play"] as const),
    score: z.number().min(1).max(10).optional(),
    hoursPlayed: z.number().min(0).optional(),
    notes: z.string().optional(),
    isFavorite: z.boolean().default(false),
  }),
})

type GameFormValues = z.infer<typeof gameFormSchema>

interface AddGameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (game: GameFormValues) => Promise<void>
}

const platformOptions = [
  { value: "PC", label: "PC", icon: "💻" },
  { value: "PlayStation 5", label: "PlayStation 5", icon: "🎮" },
  { value: "PlayStation 4", label: "PlayStation 4", icon: "🎮" },
  { value: "Xbox Series X/S", label: "Xbox Series X/S", icon: "🎮" },
  { value: "Xbox One", label: "Xbox One", icon: "🎮" },
  { value: "Nintendo Switch", label: "Nintendo Switch", icon: "🎮" },
  { value: "Steam Deck", label: "Steam Deck", icon: "🎮" },
  { value: "Mobile", label: "モバイル", icon: "📱" },
] as const

const playStatusOptions = [
  { value: "playing", label: "プレイ中", icon: Play, color: "from-green-400 to-emerald-400" },
  { value: "completed", label: "クリア済み", icon: CheckCircle2, color: "from-blue-400 to-cyan-400" },
  { value: "on_hold", label: "一時停止", icon: Pause, color: "from-yellow-400 to-orange-400" },
  { value: "dropped", label: "プレイ中断", icon: XIcon, color: "from-red-400 to-pink-400" },
  { value: "plan_to_play", label: "プレイ予定", icon: Clock, color: "from-purple-400 to-indigo-400" },
] as const

const commonGenres = [
  "アクション", "アドベンチャー", "RPG", "シミュレーション", "ストラテジー", "パズル",
  "スポーツ", "レーシング", "シューティング", "ファイティング", "プラットフォーマー",
  "サンドボックス", "サバイバル", "ホラー", "ビジュアルノベル", "リズムゲーム", "MMORPG"
]

export default function AddGameModal({ open, onOpenChange, onSubmit }: AddGameModalProps) {
  const [genreInput, setGenreInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: "",
      platform: [],
      genre: [],
      developer: "",
      publisher: "",
      description: "",
      imageUrl: "",
      userStatus: {
        status: "plan_to_play",
        isFavorite: false,
      },
    },
  })

  const genres = form.watch("genre")
  const platforms = form.watch("platform")

  const handleSubmit = async (data: GameFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Game creation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      form.setValue("genre", [...genres, genre])
      setGenreInput("")
    }
  }

  const removeGenre = (genreToRemove: string) => {
    form.setValue("genre", genres.filter(genre => genre !== genreToRemove))
  }

  const togglePlatform = (platform: GamePlatform) => {
    if (platforms.includes(platform)) {
      form.setValue("platform", platforms.filter(p => p !== platform))
    } else {
      form.setValue("platform", [...platforms, platform])
    }
  }

  const handleGenreKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addGenre(genreInput)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* ガラスモーフィズム効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl" />
        
        <DialogHeader className="relative space-y-4 text-center pt-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full flex items-center justify-center text-xl shadow-inner">
                🎮
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white drop-shadow-lg">
            <div className="flex items-center justify-center gap-2">
              ゲームを追加 <Star className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">
                      ゲームタイトル
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ゲームのタイトルを入力..."
                        className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="developer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        開発者 (オプション)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="開発会社名..."
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        パブリッシャー (オプション)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="販売会社名..."
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              {/* プラットフォーム選択 */}
              <div className="space-y-3">
                <FormLabel className="text-sm font-medium text-white/90">
                  プラットフォーム
                </FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {platformOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => togglePlatform(option.value as GamePlatform)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-300 border",
                        platforms.includes(option.value as GamePlatform)
                          ? "bg-blue-500/30 border-blue-300/50 text-white shadow-lg"
                          : "backdrop-blur-sm bg-white/10 border-white/30 text-white/80 hover:bg-white/20 hover:border-blue-300/50"
                      )}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
                {form.formState.errors.platform && (
                  <p className="text-red-300 text-sm">{form.formState.errors.platform.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userStatus.status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        プレイ状況
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/30 text-white rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-xl bg-slate-900/90 border-white/20 rounded-xl">
                          {playStatusOptions.map((option) => {
                            const IconComponent = option.icon
                            return (
                              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metacriticScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        Metacritic スコア
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="85"
                          min="0"
                          max="100"
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userStatus.hoursPlayed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        プレイ時間 (時間)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          min="0"
                          step="0.5"
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userStatus.score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        評価 (1-10)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="9"
                          min="1"
                          max="10"
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              {/* ジャンル */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/90">
                  ジャンル
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="ジャンルを入力またはクリックで追加..."
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyPress={handleGenreKeyPress}
                    className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    onClick={() => addGenre(genreInput)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {commonGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => addGenre(genre)}
                      className="text-xs px-2 py-1 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 rounded-lg transition-all duration-200"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="backdrop-blur-sm bg-blue-500/20 text-white border border-blue-300/30 rounded-lg px-2 py-1 text-xs"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeGenre(genre)}
                          className="ml-1 text-white/70 hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">
                      説明 (オプション)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ゲームの説明を入力..."
                        className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-blue-300 transition-all duration-300 resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userStatus.isFavorite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 backdrop-blur-sm bg-white/5 rounded-xl">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-white/90 cursor-pointer flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-300" />
                        お気に入りに追加
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-blue-300 rounded-xl transition-all duration-300"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      追加中...
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      追加 <Plus className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}