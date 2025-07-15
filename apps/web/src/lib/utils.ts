import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSSのクラス名を安全に結合するユーティリティ関数
 * 
 * @param inputs - クラス名、条件付きクラス、配列、オブジェクトなど
 * @returns 結合・最適化されたクラス名文字列
 * 
 * @example
 * // 基本的な使用法
 * cn('text-white', 'bg-blue-500') 
 * // → 'text-white bg-blue-500'
 * 
 * @example
 * // 条件付きクラス
 * cn('base-class', isActive && 'active-class', isError && 'error-class')
 * // isActive=true, isError=false の場合 → 'base-class active-class'
 * 
 * @example
 * // Tailwindクラスの競合を自動解決
 * cn('p-2', 'p-4') // → 'p-4' (後の方が優先される)
 * cn('bg-red-500', 'bg-blue-500') // → 'bg-blue-500'
 * 
 * @example
 * // オブジェクト形式での条件付きクラス
 * cn('text-base', {
 *   'text-red-500': isError,
 *   'text-green-500': isSuccess,
 *   'font-bold': isImportant
 * })
 * 
 * @example
 * // コンポーネントでの典型的な使用例
 * function Button({ className, variant, size, ...props }) {
 *   return (
 *     <button
 *       className={cn(
 *         // 基本スタイル
 *         "px-4 py-2 rounded font-medium",
 *         // バリアントスタイル
 *         variant === 'primary' && "bg-blue-500 text-white",
 *         variant === 'secondary' && "bg-gray-200 text-gray-800",
 *         // サイズスタイル
 *         size === 'small' && "text-sm px-2 py-1",
 *         size === 'large' && "text-lg px-6 py-3",
 *         // 外部から渡されたカスタムクラス
 *         className
 *       )}
 *       {...props}
 *     />
 *   )
 * }
 * 
 * @example
 * // 配列やfalsy値も自動処理
 * cn(
 *   'base',
 *   ['array', 'of', 'classes'],
 *   undefined,  // 無視される
 *   null,       // 無視される
 *   false,      // 無視される
 *   'final'
 * )
 * // → 'base array of classes final'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
