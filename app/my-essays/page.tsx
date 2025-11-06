"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Calendar, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

export default function MyEssaysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [essays, setEssays] = useState<EssayHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/")
      return
    }

    fetchEssays()
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

  const handleViewEssay = (essayId: string) => {
    router.push(`/my-essays/${essayId}`)
  }

  if (loading || status === "loading") {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Essays</h1>
          <p className="text-muted-foreground mt-2">
            Review your essay submissions and track your progress
          </p>
        </div>
      </div>

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
            <Card key={essay._id} className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewEssay(essay._id)}>
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
                    <span className="font-semibold">
                      Band Score: {essay.score}
                    </span>
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
    </div>
  )
}
