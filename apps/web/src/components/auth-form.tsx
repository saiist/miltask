import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, Sparkles, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"
import { authLoginSchema, authRegisterSchema } from "@otaku-secretary/shared"

type AuthMode = "login" | "signup" | "reset"

// パスワードリセット用のスキーマ
const resetPasswordSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
})

// パスワード確認付きの登録スキーマ
const signupFormSchema = z.object({
  email: authRegisterSchema.shape.email,
  password: authRegisterSchema.shape.password,
  username: authRegisterSchema.shape.username,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean()
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
}).refine(data => data.agreeToTerms === true, {
  message: '利用規約に同意してください',
  path: ['agreeToTerms']
})

type LoginFormValues = z.infer<typeof authLoginSchema>
type SignupFormValues = z.infer<typeof signupFormSchema>
type ResetFormValues = z.infer<typeof resetPasswordSchema>

interface PasswordStrength {
  score: number
  label: string
  checks: {
    length: boolean
    uppercase: boolean
    number: boolean
    symbol: boolean
  }
}

// 浮遊する星のコンポーネント
const FloatingStars = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([])

  useEffect(() => {
    const newStars = Array.from({ length: 20 }, (_, i) => ({
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
          <Star className="w-2 h-2 text-pink-300/60 fill-current animate-bounce" />
        </div>
      ))}
    </div>
  )
}

// オタク秘書アイコンコンポーネント
const OtakuSecretaryIcon = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full flex items-center justify-center text-2xl shadow-inner">
        👩‍💼
      </div>
      <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full animate-pulse" />
  </div>
)

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generalError, setGeneralError] = useState<string>("")

  const { login, register, isLoggingIn, isRegistering } = useAuth()

  // フォームの初期化（モードに応じて異なるスキーマを使用）
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
      agreeToTerms: false,
    }
  })

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    }
  })

  // パスワード強度チェック
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
    }
    const score = Object.values(checks).filter(Boolean).length
    let label = "弱い"
    if (score >= 4) label = "非常に強固"
    else if (score >= 3) label = "十分な強度"
    else if (score >= 2) label = "やや弱め"
    
    return { score, label, checks }
  }

  const passwordValue = mode === "signup" ? signupForm.watch("password") || "" : ""
  const passwordStrength = calculatePasswordStrength(passwordValue)

  // ログイン処理
  const onLoginSubmit = async (data: LoginFormValues) => {
    setGeneralError("")
    try {
      await login(data)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // サインアップ処理
  const onSignupSubmit = async (data: SignupFormValues) => {
    setGeneralError("")
    try {
      await register({
        email: data.email,
        password: data.password,
        username: data.username,
      })
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  // パスワードリセット処理
  const onResetSubmit = async (_data: ResetFormValues) => {
    setGeneralError("")
    try {
      // TODO: パスワードリセットAPIの実装
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setGeneralError("リセット用のリンクをメールに送信しました")
    } catch (error) {
      setGeneralError("エラーが発生しました。しばらく時間をおいて再度お試しください。")
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Welcome Back"
      case "signup":
        return "Join Our Community"
      case "reset":
        return "Password Recovery"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "login":
        return "オタク秘書があなたの帰りをお待ちしています"
      case "signup":
        return "新しい体験への第一歩を踏み出しましょう"
      case "reset":
        return "アカウントの復旧をサポートいたします"
    }
  }

  const currentIsLoading = mode === "login" ? isLoggingIn : mode === "signup" ? isRegistering : false

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 幻想的な背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950" />
      <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/60 via-purple-800/40 to-slate-900/60" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent" />

      {/* 浮遊する星 */}
      <FloatingStars />

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
          {/* ガラスモーフィズム効果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl" />

          <CardHeader className="relative space-y-4 text-center pt-8">
            {/* オタク秘書アイコン */}
            <div className="flex justify-center">
              <OtakuSecretaryIcon />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                {mode === "login" ? (
                  <div className="flex items-center justify-center gap-2">
                    オタク秘書 <Heart className="w-5 h-5 text-pink-300 animate-pulse" />
                  </div>
                ) : (
                  getTitle()
                )}
              </CardTitle>
              <CardDescription className="text-pink-100/90 text-sm font-medium">{getDescription()}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative p-6">
            {/* エラーメッセージ */}
            {generalError && (
              <Alert
                variant={generalError.includes("送信しました") ? "default" : "destructive"}
                className="backdrop-blur-sm bg-white/10 border-white/20 text-white mb-4"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white/90">{generalError}</AlertDescription>
              </Alert>
            )}

            {/* ログインフォーム */}
            {mode === "login" && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          メールアドレス
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          パスワード
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300 pr-12"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                    disabled={currentIsLoading}
                  >
                    {currentIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ログイン中...
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        ログイン <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <div className="space-y-3 text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-purple-300 hover:text-purple-200 block w-full py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                    >
                      パスワードをお忘れですか？
                    </button>
                    <div className="text-white/70">
                      アカウントをお持ちでない方は{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-purple-300 hover:text-purple-200 underline decoration-dotted"
                      >
                        こちらから登録
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {/* サインアップフォーム */}
            {mode === "signup" && (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
                  <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          ユーザーネーム
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="otaku_taro"
                            className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-pink-200/70">
                          3-20文字の英数字と_が使えます ✨
                        </FormDescription>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          メールアドレス
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          パスワード
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300 pr-12"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        
                        {/* パスワード強度インジケーター */}
                        {field.value && (
                          <div className="space-y-3 p-3 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    passwordStrength.score >= 4
                                      ? "bg-gradient-to-r from-green-400 to-emerald-400"
                                      : passwordStrength.score >= 3
                                        ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                        : passwordStrength.score >= 2
                                          ? "bg-gradient-to-r from-orange-400 to-red-400"
                                          : "bg-gradient-to-r from-red-400 to-pink-400"
                                  }`}
                                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-white/90 min-w-fit">{passwordStrength.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {[
                                { key: "length", label: "8文字以上" },
                                { key: "uppercase", label: "大文字を含む" },
                                { key: "number", label: "数字を含む" },
                                { key: "symbol", label: "記号を含む" },
                              ].map(({ key, label }) => (
                                <div
                                  key={key}
                                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                                    passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                                      ? "bg-emerald-500/20 text-emerald-200"
                                      : "bg-white/5 text-white/60"
                                  }`}
                                >
                                  {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3" />
                                  )}
                                  <span className="text-xs">{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          パスワード（確認）
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300 pr-12"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="agreeToTerms"
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
                          <FormLabel className="text-sm font-medium text-white/90 cursor-pointer">
                            <button type="button" className="text-purple-300 hover:text-purple-200 underline decoration-dotted">
                              利用規約
                            </button>
                            に同意する
                          </FormLabel>
                          <FormMessage className="text-red-300" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                    disabled={currentIsLoading}
                  >
                    {currentIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        アカウント作成中...
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        アカウント作成 <Star className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <div className="text-white/70">
                      既にアカウントをお持ちの方は{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-purple-300 hover:text-purple-200 underline decoration-dotted"
                      >
                        ログインページへ
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {/* パスワードリセットフォーム */}
            {mode === "reset" && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/90 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          メールアドレス
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="backdrop-blur-sm bg-white/10 border-white/30 text-white placeholder:text-white/50 rounded-xl focus:bg-white/20 focus:border-pink-300 transition-all duration-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 border-0"
                    disabled={currentIsLoading}
                  >
                    {currentIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        リセットリンクを送信 <Mail className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-purple-300 hover:text-purple-200 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                    >
                      ログインページに戻る
                    </button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}