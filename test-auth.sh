#!/bin/bash

# 認証システムテストスクリプト

API_URL="http://localhost:38301"
WEB_URL="http://localhost:5174"

echo "🧪 認証システムテスト"
echo "===================="

# APIサーバーのヘルスチェック
echo "1. APIサーバーのヘルスチェック..."
health_response=$(curl -s "$API_URL/health")
if [[ $? -eq 0 ]]; then
    echo "✅ APIサーバー正常: $health_response"
else
    echo "❌ APIサーバーに接続できません"
    exit 1
fi

# Webアプリケーションのチェック
echo "2. Webアプリケーションのチェック..."
web_response=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL")
if [[ "$web_response" == "200" ]]; then
    echo "✅ Webアプリケーション正常"
else
    echo "❌ Webアプリケーションに接続できません (HTTP: $web_response)"
fi

echo ""
echo "🌐 ブラウザでのテスト手順:"
echo "1. $WEB_URL にアクセス"
echo "2. 新規登録を試す"
echo "3. ログインを試す"
echo "4. ダッシュボードが表示されることを確認"
echo ""
echo "📝 追加された機能:"
echo "- ローカルマイグレーション: pnpm db:migrate:local"
echo "- ローカルDB実行: pnpm db:execute:local"