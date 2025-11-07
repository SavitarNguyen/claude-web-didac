"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, FileText, Calendar, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { FullScreenFeedbackView } from "@/components/ielts/FullScreenFeedbackView"
import type { IELTSFeedback } from "@/lib/types/ielts"

interface EssayDetail {
  _id: string
  title: string
  content: string
  correctedContent?: string
  score?: number
  feedback?: IELTSFeedback
  createdAt: Date
  updatedAt: Date
}

export default function EssayDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const essayId = params.id as string

  const [essay, setEssay] = useState<EssayDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullFeedback, setShowFullFeedback] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/")
      return
    }

    fetchEssay()
  }, [session, status, router, essayId])

  const fetchEssay = async () => {
    try {
      const response = await fetch(`/api/essays/${essayId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch essay")
      }
      const data = await response.json()
      setEssay(data)
    } catch (error) {
      console.error("Error fetching essay:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!essay) return

    const content = `
IELTS Essay Review
==================

Title: ${essay.title}
Band Score: ${essay.score}
Date: ${new Date(essay.createdAt).toLocaleDateString()}

ORIGINAL ESSAY
--------------
${essay.content}

${essay.correctedContent ? `
CORRECTED VERSION
-----------------
${essay.correctedContent}
` : ''}

${essay.feedback ? `
FEEDBACK
--------
${JSON.stringify(essay.feedback, null, 2)}
` : ''}
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${essay.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading || status === "loading") {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!essay) {
    return (
      <div className="container py-8 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">Essay not found</p>
            <Button onClick={() => router.push("/my-essays")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Essays
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {showFullFeedback && essay.feedback && (
        <FullScreenFeedbackView
          feedback={essay.feedback}
          onClose={() => setShowFullFeedback(false)}
          onDownload={handleDownload}
        />
      )}

      {!showFullFeedback && (
        <div className="container py-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.push("/my-essays")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Essays
            </Button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{essay.title}</CardTitle>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(essay.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {essay.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">Band Score: {essay.score}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {essay.feedback && (
                    <Button onClick={() => setShowFullFeedback(true)}>
                      View Full Feedback
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleDownload}>
                    Download Essay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Essay Content */}
            {essay.correctedContent ? (
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="corrected">Corrected</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="space-y-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Original Essay</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                          {essay.content}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Corrected Version</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-sm bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                          {essay.correctedContent}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="original">
                  <Card>
                    <CardHeader>
                      <CardTitle>Original Essay</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                        {essay.content}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="corrected">
                  <Card>
                    <CardHeader>
                      <CardTitle>Corrected Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                        {essay.correctedContent}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Essay Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                    {essay.content}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  )
}
