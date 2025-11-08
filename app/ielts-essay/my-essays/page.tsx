"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, Calendar, TrendingUp, History, RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EssayHistory {
  _id: string
  title: string
  content: string
  correctedContent?: string
  score?: number
  feedback?: any
  createdAt: Date
  updatedAt: Date
}

interface Draft {
  id: string
  title: string
  content: string
  version: number
  is_current: boolean
  created_at: string
  updated_at: string
  essay_topics?: { id: string; name: string }
  essay_prompts?: { id: string; title: string }
}

interface DraftVersion {
  id: string
  content: string
  version: number
  created_at: string
  is_current: boolean
}

export default function MyEssaysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [essays, setEssays] = useState<EssayHistory[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [draftVersions, setDraftVersions] = useState<DraftVersion[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/")
      return
    }

    fetchEssays()
    fetchDrafts()
  }, [session, status, router])

  const fetchEssays = async () => {
    try {
      const response = await fetch("/api/essays")
      if (!response.ok) {
        throw new Error("Failed to fetch essays")
      }
      const data = await response.json()
      setEssays(data)
    } catch (error) {
      console.error("Error fetching essays:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/essay-drafts?current_only=true")
      if (!response.ok) {
        throw new Error("Failed to fetch drafts")
      }
      const data = await response.json()
      setDrafts(data)
    } catch (error) {
      console.error("Error fetching drafts:", error)
    }
  }

  const fetchVersionHistory = async (draftId: string) => {
    try {
      const response = await fetch(`/api/essay-drafts/versions?draft_id=${draftId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch version history")
      }
      const data = await response.json()
      setDraftVersions(data)
      setShowVersionHistory(true)
    } catch (error) {
      console.error("Error fetching version history:", error)
    }
  }

  const revertToVersion = async (versionId: string) => {
    try {
      const response = await fetch("/api/essay-drafts/versions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version_id: versionId }),
      })

      if (!response.ok) {
        throw new Error("Failed to revert version")
      }

      setShowVersionHistory(false)
      fetchDrafts()
    } catch (error) {
      console.error("Error reverting version:", error)
    }
  }

  const handleViewEssay = (essayId: string) => {
    router.push(`/ielts-essay/my-essays/${essayId}`)
  }

  const handleEditDraft = (draft: Draft) => {
    // Navigate to IELTS Essay page and load this draft
    router.push(`/ielts-essay?draft=${draft.id}`)
  }

  if (loading || status === "loading") {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Essays</h1>
            <p className="text-muted-foreground mt-2">
              Review your essay submissions and track your progress
            </p>
          </div>
        </div>

        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="completed">Completed Essays</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="mt-6">
            {essays.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't submitted any essays yet
                  </p>
                  <Button onClick={() => router.push("/ielts-essay")}>
                    Write Your First Essay
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {essays.map((essay) => (
                  <Card
                    key={essay._id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewEssay(essay._id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{essay.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(essay.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {essay.score !== undefined && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-semibold">Band Score: {essay.score}</span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {essay.content.substring(0, 150)}...
                      </p>

                      {essay.correctedContent && (
                        <div className="pt-2">
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                            ✓ Corrected version available
                          </span>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewEssay(essay._id)
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            {drafts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any saved drafts
                  </p>
                  <Button onClick={() => router.push("/ielts-essay")}>
                    Start Writing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{draft.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {draft.essay_topics && (
                        <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded inline-block">
                          {draft.essay_topics.name}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {draft.content.substring(0, 150)}...
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <History className="h-3 w-3" />
                        <span>Version {draft.version}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditDraft(draft)}
                        >
                          Continue Writing
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedDraft(draft)
                            fetchVersionHistory(draft.id)
                          }}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and revert to previous versions of this draft
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {draftVersions.map((version) => (
              <Card key={version.id} className={version.is_current ? "border-primary" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Version {version.version}</span>
                        {version.is_current && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-sm line-clamp-3">{version.content.substring(0, 200)}...</p>
                    </div>
                    {!version.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revertToVersion(version.id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Revert
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
