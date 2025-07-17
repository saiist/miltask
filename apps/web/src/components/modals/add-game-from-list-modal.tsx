import { useState } from "react"
import { Gamepad2, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Game } from "@otaku-secretary/api-client"

interface AddGameFromListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  games: Game[]
  onSelectGame: (gameId: string) => Promise<void>
  isLoading?: boolean
}

export default function AddGameFromListModal({
  open,
  onOpenChange,
  games,
  onSelectGame,
  isLoading = false,
}: AddGameFromListModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddGame = async () => {
    if (selectedGameId && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onSelectGame(selectedGameId)
        setSelectedGameId(null)
        setSearchQuery("")
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to add game:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-500" />
            ゲームを追加
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ゲームを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* ゲームリスト */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">読み込み中...</p>
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "該当するゲームが見つかりません" : "利用可能なゲームがありません"}
                  </p>
                </div>
              ) : (
                filteredGames.map((game) => (
                  <Card
                    key={game.id}
                    className={`cursor-pointer transition-all ${
                      selectedGameId === game.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedGameId(game.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{game.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {game.platform}
                            </Badge>
                            {game.dailyTasks && game.dailyTasks.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {game.dailyTasks.length}個のデイリータスク
                              </span>
                            )}
                          </div>
                        </div>
                        {game.iconUrl && (
                          <img
                            src={game.iconUrl}
                            alt={game.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* アクションボタン */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleAddGame}
              disabled={!selectedGameId || isLoading || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  追加中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}