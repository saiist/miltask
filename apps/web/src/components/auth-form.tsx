import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AuthMode = "login" | "signup" | "reset"

interface FormErrors {
  email?: string
  password?: string
  username?: string
  confirmPassword?: string
  general?: string
}

interface FormValues {
  email: string
  password: string
  username: string
  confirmPassword: string
}

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
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  })

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "弱い",
    checks: {
      length: false,
      uppercase: false,
      number: false,
      symbol: false,
    },
  })

  // パスワード強度チェック
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length
    let label = "弱い"

    if (score >= 4) label = "強い"
    else if (score >= 3) label = "中"
    else if (score >= 2) label = "やや弱い"

    return { score, label, checks }
  }

  // リアルタイムバリデーション
  const validateField = (field: keyof FormValues, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value) {
          newErrors.email = "メールアドレスを入力してください"
        } else if (!emailRegex.test(value) || value.length > 100) {
          newErrors.email = "有効なメールアドレスを入力してください"
        } else {
          delete newErrors.email
        }
        break

      case "password":
        if (!value) {
          newErrors.password = "パスワードを入力してください"
        } else if (value.length < 8 || value.length > 100) {
          newErrors.password = "パスワードは8文字以上100文字以下で入力してください"
        } else {
          delete newErrors.password
        }
        break

      case "username":
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!value) {
          newErrors.username = "ユーザー名を入力してください"
        } else if (!usernameRegex.test(value)) {
          newErrors.username = "3-20文字の英数字と_が使用できます"
        } else {
          delete newErrors.username
        }
        break

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "パスワード（確認）を入力してください"
        } else if (value !== values.password) {
          newErrors.confirmPassword = "パスワードが一致しません"
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
  }

  // 入力値の更新
  const handleInputChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))

    if (field === "password") {
      setPasswordStrength(checkPasswordStrength(value))
    }

    // 2回目以降はリアルタイムバリデーション
    if (errors[field]) {
      validateField(field, value)
    }
  }

  // フィールドのblur時バリデーション
  const handleFieldBlur = (field: keyof FormValues) => {
    validateField(field, values[field])
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // 全フィールドのバリデーション
    Object.keys(values).forEach((key) => {
      const field = key as keyof FormValues
      if (mode === "login" && (field === "username" || field === "confirmPassword")) return
      if (mode === "reset" && field !== "email") return
      validateField(field, values[field])
    })

    // サインアップ時の利用規約チェック
    if (mode === "signup" && !agreeToTerms) {
      setErrors((prev) => ({ ...prev, general: "利用規約に同意してください" }))
      setIsLoading(false)
      return
    }

    // 模擬API呼び出し
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (mode === "reset") {
        setErrors({ general: "リセット用のリンクをメールに送信しました" })
      } else {
        // 成功時の処理（実際のアプリではリダイレクト）
        console.log(`${mode} successful`, values)
      }
    } catch (error) {
      setErrors({ general: "エラーが発生しました。しばらく時間をおいて再度お試しください。" })
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
        return "新しいアカウントを作成します"
      case "reset":
        return "登録メールアドレスにリセット用のリンクを送信します"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">{getTitle()}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{getDescription()}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* エラーメッセージ */}
            {errors.general && (
              <Alert variant={errors.general.includes("送信しました") ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* ユーザー名（サインアップ時のみ） */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  ユーザー名
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="otaku_taro"
                    value={values.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    onBlur={() => handleFieldBlur("username")}
                    className={`pl-10 ${errors.username ? "border-red-500 focus:border-red-500" : ""}`}
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? "username-error" : "username-hint"}
                  />
                </div>
                {errors.username ? (
                  <p id="username-error" className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username}
                  </p>
                ) : (
                  <p id="username-hint" className="text-xs text-muted-foreground">
                    3-20文字の英数字と_が使用可能
                  </p>
                )}
              </div>
            )}

            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={values.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleFieldBlur("email")}
                  className={`pl-10 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* パスワード（リセット時は非表示） */}
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  パスワード
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={values.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleFieldBlur("password")}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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

                {/* パスワード強度インジケーター（サインアップ時のみ） */}
                {mode === "signup" && values.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 4
                              ? "bg-green-500"
                              : passwordStrength.score >= 3
                                ? "bg-yellow-500"
                                : passwordStrength.score >= 2
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">強度: {passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.length ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        8文字以上
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.uppercase ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        大文字を含む
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.number ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        数字を含む
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.symbol ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.symbol ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        記号を含む
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* パスワード確認（サインアップ時のみ） */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  パスワード（確認）
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={values.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleFieldBlur("confirmPassword")}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
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
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* チェックボックス */}
            {mode === "login" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ログイン状態を保持する
                </Label>
              </div>
            )}

            {mode === "signup" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <button type="button" className="text-blue-600 hover:underline">
                    利用規約
                  </button>
                  に同意する
                </Label>
              </div>
            )}

            {/* 送信ボタン */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "login" ? "ログイン中..." : mode === "signup" ? "アカウント作成中..." : "送信中..."}
                </>
              ) : mode === "login" ? (
                "ログイン"
              ) : mode === "signup" ? (
                "アカウント作成"
              ) : (
                "リセットリンクを送信"
              )}
            </Button>

            {/* リンク */}
            <div className="space-y-2 text-center text-sm">
              {mode === "login" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-blue-600 hover:underline block w-full"
                  >
                    パスワードを忘れた方
                  </button>
                  <div>
                    アカウントをお持ちでない方{" "}
                    <button type="button" onClick={() => setMode("signup")} className="text-blue-600 hover:underline">
                      新規登録はこちら
                    </button>
                  </div>
                </>
              )}

              {mode === "signup" && (
                <div>
                  既にアカウントをお持ちの方{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-blue-600 hover:underline">
                    ログインはこちら
                  </button>
                </div>
              )}

              {mode === "reset" && (
                <button type="button" onClick={() => setMode("login")} className="text-blue-600 hover:underline">
                  ログイン画面に戻る
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
