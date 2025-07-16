import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Plus, Star, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

const taskFormSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(200, "タイトルは200文字以内で入力してください"),
  description: z.string().optional(),
  type: z.enum(["anime", "game-daily", "book-release"] as const),
  priority: z.enum(["low", "medium", "high"] as const),
  deadline: z.date().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: TaskFormValues) => Promise<void>
}

const typeOptions = [
  { value: "anime", label: "アニメ", icon: "📺" },
  { value: "game-daily", label: "ゲームデイリー", icon: "🎮" },
  { value: "book-release", label: "新刊チェック", icon: "📚" },
] as const

const priorityOptions = [
  { value: "low", label: "低", icon: CheckCircle2, color: "from-green-400 to-emerald-400" },
  { value: "medium", label: "中", icon: Clock, color: "from-yellow-400 to-orange-400" },
  { value: "high", label: "高", icon: AlertTriangle, color: "from-orange-400 to-red-400" },
] as const

export default function AddTaskModal({ open, onOpenChange, onSubmit }: AddTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "anime",
      priority: "medium",
    },
  })

  const handleSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Task creation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
        {/* ガラスモーフィズム効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl" />
        
        <DialogHeader className="relative space-y-4 text-center pt-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full flex items-center justify-center text-xl shadow-inner">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white drop-shadow-lg">
            <div className="flex items-center justify-center gap-2">
              新しいタスク <Star className="w-5 h-5 text-pink-300 animate-pulse" />
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
                        placeholder="タスクのタイトルを入力..."
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">
                      説明 (オプション)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="詳細な説明があれば入力..."
                        className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300 resize-none"
                        rows={3}
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
                          {typeOptions.map((option) => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-white/90">
                        優先度
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/30 text-white rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="backdrop-blur-xl bg-slate-900/90 border-white/20 rounded-xl">
                          {priorityOptions.map((option) => {
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

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">
                      期限日 (オプション)
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal backdrop-blur-sm bg-white/10 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-pink-300 transition-all duration-300",
                              !field.value && "text-white/50"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ja })
                            ) : (
                              <span>日付を選択</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 backdrop-blur-xl bg-slate-900/90 border-white/20 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-300" />
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
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      作成中...
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      作成 <Plus className="w-4 h-4" />
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