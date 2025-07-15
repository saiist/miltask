import { z } from 'zod'

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.enum(['ja', 'en']).default('ja'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    taskReminders: z.boolean().default(true),
    weeklyReport: z.boolean().default(false),
    recommendations: z.boolean().default(true)
  }),
  defaultTaskCategory: z.string().optional(),
  timezone: z.string().default('Asia/Tokyo')
})

export const authLoginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください')
})

export const authRegisterSchema = authLoginSchema.extend({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字、ハイフン、アンダースコアのみ使用可能です')
})

export const userUpdateSchema = z.object({
  displayName: z.string().max(50, '表示名は50文字以内で入力してください').optional(),
  avatarUrl: z.string().url('正しいURLを入力してください').optional(),
  preferences: userPreferencesSchema.partial().optional()
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z.string().min(8, '新しいパスワードは8文字以上で入力してください'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
})

export type AuthLoginInput = z.infer<typeof authLoginSchema>
export type AuthRegisterInput = z.infer<typeof authRegisterSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>