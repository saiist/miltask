# ミルタス (MilTask)

## 概要

ミルタスは、アニメ・ゲーム・読書を愛する人のための生産性向上アプリケーションです。「見る」活動とタスク管理を融合し、あなたの趣味ライフを効率的にサポートします。

## 主な機能

### 🎬 アニメ管理
- 視聴中/視聴予定/完了したアニメの管理
- エピソード進捗の追跡
- 評価とメモ機能

### 🎮 ゲーム管理
- プレイ中のゲームの管理
- デイリータスクの自動生成
- プレイ時間の記録

### 📚 読書管理
- 新刊発売リマインダー
- 読書進捗の管理

### ✅ タスク管理
- アニメ・ゲーム・読書関連のタスク管理
- 優先度設定とデッドライン管理
- 完了率の統計表示

## 技術スタック

### フロントエンド
- **React 19** - UIフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **Radix UI** - UIコンポーネント
- **React Router v7** - ルーティング
- **TanStack Query** - データ取得・キャッシュ
- **Zustand** - 状態管理
- **Vite** - ビルドツール

### バックエンド
- **Cloudflare Workers** - サーバーレス実行環境
- **Hono** - Webフレームワーク
- **Drizzle ORM** - データベースORM
- **Cloudflare D1** - SQLiteデータベース
- **Lucia Auth v3** - 認証システム

### 開発環境
- **Turborepo** - モノレポ管理
- **pnpm** - パッケージマネージャー
- **ESLint** - コード品質
- **Prettier** - コードフォーマット
- **Vitest** - テスト
- **Storybook** - UIコンポーネント開発

## プロジェクト構成

```
miltask/
├── apps/
│   ├── api/                    # Cloudflare Workers API
│   ├── web/                    # React Webアプリ
│   ├── admin/                  # 管理画面（予定）
│   └── landing/                # ランディングページ（予定）
├── packages/
│   ├── shared/                 # 共通型・スキーマ
│   ├── ui/                     # UIコンポーネント
│   ├── database/               # データベーススキーマ
│   ├── api-client/             # APIクライアント
│   ├── config/                 # 設定ファイル
│   └── utils/                  # ユーティリティ
└── docs/                       # ドキュメント
```

## セットアップ

### 前提条件
- Node.js 22.x以上
- pnpm 8.x以上
- Cloudflare Workers アカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/miltask.git
cd miltask

# 依存関係をインストール
pnpm install

# データベースマイグレーション
pnpm db:migrate:local

# データベースシード
pnpm db:seed
```

### 開発環境の起動

```bash
# APIサーバーを起動（ポート8788）
pnpm dev --filter @otaku-secretary/api

# 別のターミナルでWebアプリを起動（ポート5173）
pnpm dev --filter @otaku-secretary/web
```

## 開発コマンド

### ビルド・テスト
```bash
# 全体をビルド
pnpm build

# 全体をテスト
pnpm test

# 型チェック
pnpm type-check

# コードフォーマット
pnpm format

# リント
pnpm lint
```

### データベース
```bash
# マイグレーション適用
pnpm db:migrate:local

# データベース初期化
pnpm db:seed

# Drizzle Studio起動
pnpm drizzle:studio
```

### 個別パッケージ
```bash
# APIのみ開発
pnpm dev --filter @miltask/api

# Webアプリのみ開発
pnpm dev --filter @miltask/web

# APIテスト実行
pnpm test --filter @miltask/api
```

## API仕様

### 認証
- **POST** `/auth/login` - ログイン
- **POST** `/auth/register` - ユーザー登録
- **POST** `/auth/logout` - ログアウト
- **GET** `/auth/me` - 現在のユーザー情報

### タスク管理
- **GET** `/api/tasks` - タスク一覧取得
- **POST** `/api/tasks` - タスク作成
- **PUT** `/api/tasks/:id` - タスク更新
- **DELETE** `/api/tasks/:id` - タスク削除
- **GET** `/api/tasks/today` - 今日のタスク取得

### 統計
- **GET** `/api/statistics` - 統計データ取得

### アニメ
- **GET** `/api/anime` - アニメ一覧取得
- **POST** `/api/anime` - アニメ追加
- **PUT** `/api/anime/:id` - アニメ更新
- **DELETE** `/api/anime/:id` - アニメ削除

### ゲーム
- **GET** `/api/games` - ゲーム一覧取得
- **POST** `/api/games/user` - ユーザーゲーム設定追加
- **GET** `/api/games/user` - ユーザーゲーム設定取得

## デプロイ

```bash
# 本番環境へデプロイ
pnpm deploy
```

## 貢献

1. Issueを作成または確認
2. ブランチを作成: `git checkout -b feature/new-feature`
3. 変更をコミット: `git commit -m 'Add new feature'`
4. ブランチにプッシュ: `git push origin feature/new-feature`
5. プルリクエストを作成

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 開発状況

### ✅ 完了済み機能
- 認証システム（Lucia Auth v3）
- ダッシュボード UI
- タスク管理（CRUD操作）
- ゲーム統合
- 通知センター
- 統計ダッシュボード
- 41のAPIテスト

### 🔄 進行中
- リアルタイム更新
- ブラウザ通知
- アニメ追跡機能
- 読書管理機能

### 📋 計画中
- モバイルアプリ対応
- データエクスポート機能
- 外部API統合（MyAnimeList等）
- ソーシャル機能