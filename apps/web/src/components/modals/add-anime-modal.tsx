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

const animeFormSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内で入力してください"),
  titleEnglish: z.string().optional(),
  titleJapanese: z.string().optional(),
  type: z.enum(["TV", "Movie", "OVA", "ONA", "Special"] as const),
  episodes: z.number().int().positive().optional(),
  synopsis: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  genres: z.array(z.string()).default([]),
  studios: z.array(z.string()).default([]),
  userStatus: z.object({
    status: z.enum(["watching", "completed", "on_hold", "dropped", "plan_to_watch"] as const),
    score: z.number().min(1).max(10).optional(),
    episodesWatched: z.number().int().min(0).default(0),
    notes: z.string().optional(),
    isFavorite: z.boolean().default(false),
  }),
})

type AnimeFormValues = z.infer<typeof animeFormSchema>

interface AddAnimeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (anime: AnimeFormValues) => Promise<void>
}

const animeTypeOptions = [
  { value: "TV", label: "TVシリーズ", icon: "📺" },
  { value: "Movie", label: "映画", icon: "🎬" },
  { value: "OVA", label: "OVA", icon: "💿" },
  { value: "ONA", label: "ONA", icon: "🌐" },
  { value: "Special", label: "スペシャル", icon: "✨" },
] as const

const watchStatusOptions = [
  { value: "watching", label: "視聴中", icon: Play, color: "from-green-400 to-emerald-400" },
  { value: "completed", label: "視聴完了", icon: CheckCircle2, color: "from-blue-400 to-cyan-400" },
  { value: "on_hold", label: "一時停止", icon: Pause, color: "from-yellow-400 to-orange-400" },
  { value: "dropped", label: "視聴中断", icon: XIcon, color: "from-red-400 to-pink-400" },
  { value: "plan_to_watch", label: "視聴予定", icon: Clock, color: "from-purple-400 to-indigo-400" },
] as const

const commonGenres = [
  "アクション", "アドベンチャー", "コメディ", "ドラマ", "ファンタジー", "ホラー", 
  "魔法", "メカ", "音楽", "ミステリー", "心理学", "ロマンス", "SF", "スライス・オブ・ライフ",
  "スポーツ", "超自然", "スリラー", "日常系", "青春", "学園", "異世界"
]

export default function AddAnimeModal({ open, onOpenChange, onSubmit }: AddAnimeModalProps) {
  const [genreInput, setGenreInput] = useState("")
  const [studioInput, setStudioInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AnimeFormValues>({
    resolver: zodResolver(animeFormSchema),
    defaultValues: {
      title: "",
      titleEnglish: "",
      titleJapanese: "",
      type: "TV",
      synopsis: "",
      imageUrl: "",
      genres: [],
      studios: [],
      userStatus: {
        status: "plan_to_watch",
        episodesWatched: 0,
        isFavorite: false,
      },
    },
  })

  const genres = form.watch("genres")
  const studios = form.watch("studios")

  const handleSubmit = async (data: AnimeFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Anime creation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      form.setValue("genres", [...genres, genre])
      setGenreInput("")
    }
  }

  const removeGenre = (genreToRemove: string) => {
    form.setValue("genres", genres.filter(genre => genre !== genreToRemove))
  }

  const addStudio = () => {
    if (studioInput.trim() && !studios.includes(studioInput.trim())) {
      form.setValue("studios", [...studios, studioInput.trim()])
      setStudioInput("")
    }
  }

  const removeStudio = (studioToRemove: string) => {
    form.setValue("studios", studios.filter(studio => studio !== studioToRemove))
  }

  const handleGenreKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addGenre(genreInput)
    }
  }

  const handleStudioKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addStudio()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* ガラスモーフィズム効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl" />
        
        <DialogHeader className="relative space-y-4 text-center pt-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full flex items-center justify-center text-xl shadow-inner">
                📺
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white drop-shadow-lg">
            <div className="flex items-center justify-center gap-2">
              アニメを追加 <Star className="w-5 h-5 text-pink-300 animate-pulse" />
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
                      タイトル
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="アニメのタイトルを入力..."
                        className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
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
                  name="titleEnglish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        英語タイトル (オプション)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="English title..."
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="titleJapanese"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        日本語タイトル (オプション)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="日本語タイトル..."
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        タイプ
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/30 text-white rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-xl bg-slate-900/90 border-white/20 rounded-xl">
                          {animeTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                              {option.icon} {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="episodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        話数
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="12"
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userStatus.status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        視聴状況
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/30 text-white rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-xl bg-slate-900/90 border-white/20 rounded-xl">
                          {watchStatusOptions.map((option) => {
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userStatus.episodesWatched"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        視聴済み話数
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                          placeholder="8"
                          min="1"
                          max="10"
                          className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
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
                    className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    onClick={() => addGenre(genreInput)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-xl"
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
                        className="backdrop-blur-sm bg-pink-500/20 text-white border border-pink-300/30 rounded-lg px-2 py-1 text-xs"
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

              {/* スタジオ */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/90">
                  スタジオ
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="制作スタジオを入力..."
                    value={studioInput}
                    onChange={(e) => setStudioInput(e.target.value)}
                    onKeyPress={handleStudioKeyPress}
                    className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    onClick={addStudio}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {studios.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {studios.map((studio) => (
                      <Badge
                        key={studio}
                        variant="secondary"
                        className="backdrop-blur-sm bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 text-xs"
                      >
                        {studio}
                        <button
                          type="button"
                          onClick={() => removeStudio(studio)}
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
                name="synopsis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">
                      あらすじ (オプション)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="アニメのあらすじを入力..."
                        className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300 resize-none"
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
                        className="border-white/30 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-white/90 cursor-pointer flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-300" />
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
                  className="flex-1 backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-pink-300 rounded-xl transition-all duration-300"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
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