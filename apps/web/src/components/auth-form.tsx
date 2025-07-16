import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
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

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login")
  const { login, register, isLoggingIn, isRegistering } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generalError, setGeneralError] = useState<string>("")

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
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    const score = Object.values(checks).filter(Boolean).length
    let label = "弱い"
    if (score >= 4) label = "強い"
    else if (score >= 2) label = "中"
    
    return { score, label, checks }
  }

  const passwordValue = mode === "signup" ? signupForm.watch("password") || "" : ""
  const passwordStrength = calculatePasswordStrength(passwordValue)

  // ログイン処理
  const onLoginSubmit = async (data: LoginFormValues) => {
    setGeneralError("")
    try {
      login(data)
    } catch (error) {
      // エラーはuseAuthフック内で処理される
      console.error('Login error:', error)
    }
  }

  // サインアップ処理
  const onSignupSubmit = async (data: SignupFormValues) => {
    setGeneralError("")
    try {
      register({
        email: data.email,
        password: data.password,
        username: data.username,
      })
    } catch (error) {
      // エラーはuseAuthフック内で処理される
      console.error('Signup error:', error)
    }
  }

  // パスワードリセット処理
  const onResetSubmit = async (_data: ResetFormValues) => {
    setGeneralError("")
    setIsLoading(true)
    try {
      // TODO: パスワードリセットAPIの実装
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setGeneralError("リセット用のリンクをメールに送信しました")
    } catch (error) {
      setGeneralError("エラーが発生しました。しばらく時間をおいて再度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "オタク秘書"
      case "signup":
        return "アカウント作成"
      case "reset":
        return "パスワードをリセット"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "login":
        return "アカウントにログインしてください"
      case "signup":
        return "新しいアカウントを作成してください"
      case "reset":
        return "パスワードリセット用のリンクをメールに送信します"
    }
  }

  const currentIsLoading = mode === "login" ? isLoggingIn : mode === "signup" ? isRegistering : isLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">{getTitle()}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* エラーメッセージ */}
          {generalError && (
            <Alert variant={generalError.includes("送信しました") ? "default" : "destructive"} className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {/* ログインフォーム */}
          {mode === "login" && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>パスワード</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={currentIsLoading}
                >
                  {currentIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    "ログイン"
                  )}
                </Button>

                <div className="text-center text-sm space-y-2">
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-primary hover:underline"
                  >
                    パスワードを忘れた方
                  </button>
                  <div>
                    <span className="text-muted-foreground">アカウントをお持ちでない方 </span>
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-primary hover:underline"
                    >
                      新規登録はこちら
                    </button>
                  </div>
                </div>
              </form>
            </Form>
          )}

          {/* サインアップフォーム */}
          {mode === "signup" && (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ユーザー名</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="otaku_taro"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        3-20文字の英数字、ハイフン、アンダースコアが使用可能
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>パスワード</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      
                      {/* パスワード強度インジケーター */}
                      {field.value && (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">強度:</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score >= 4 ? "text-green-600" : 
                              passwordStrength.score >= 2 ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {Array.from({ length: 4 }, (_, i) => (
                              <div
                                key={i}
                                className={`h-2 rounded-full ${
                                  i < passwordStrength.score
                                    ? passwordStrength.score >= 4 ? "bg-green-500" : 
                                      passwordStrength.score >= 2 ? "bg-yellow-500" : "bg-red-500"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}`}>
                              {passwordStrength.checks.length ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              8文字以上
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}`}>
                              {passwordStrength.checks.uppercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              大文字を含む
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}`}>
                              {passwordStrength.checks.number ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              数字を含む
                            </div>
                            <div className={`flex items-center gap-1 ${passwordStrength.checks.symbol ? "text-green-600" : "text-gray-400"}`}>
                              {passwordStrength.checks.symbol ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              記号を含む
                            </div>
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>パスワード（確認）</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          利用規約に同意する
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={currentIsLoading}
                >
                  {currentIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      アカウント作成中...
                    </>
                  ) : (
                    "アカウントを作成"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">既にアカウントをお持ちの方 </span>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline"
                  >
                    ログインはこちら
                  </button>
                </div>
              </form>
            </Form>
          )}

          {/* パスワードリセットフォーム */}
          {mode === "reset" && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={currentIsLoading}
                >
                  {currentIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "リセットリンクを送信"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline"
                  >
                    ログイン画面に戻る
                  </button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}