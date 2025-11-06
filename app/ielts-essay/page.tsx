"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { AuthDialog } from "@/components/auth-dialog"
import { FullScreenFeedbackView } from "@/components/ielts/FullScreenFeedbackView"
import type { IELTSFeedback } from "@/lib/types/ielts"

export default function IELTSEssayPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [essayText, setEssayText] = useState("")
  const [essayTitle, setEssayTitle] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<IELTSFeedback | null>(null)
  const [streamingText, setStreamingText] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = async () => {
    if (!essayText.trim()) {
      toast({
        title: "Error",
        description: "Please write your essay before submitting",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setFeedback(null)
    setStreamingText("")

    try {
      const response = await fetch("/api/ielts/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: essayText,
          instructionNames: ["ielts"],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get IELTS feedback")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response reader available")
      }

      let accumulatedText = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)

            if (data === "[DONE]") {
              // Parsing complete
              try {
                const parsedFeedback: IELTSFeedback = JSON.parse(accumulatedText)
                setFeedback(parsedFeedback)
                setShowFeedback(true)

                // Save to database if user is logged in
                if (session) {
                  // Extract corrected content from paragraph revisions
                  const correctedContent = parsedFeedback.paragraphs
                    .map((p) => p.revisedParagraph)
                    .join("\n\n")

                  await fetch("/api/essays", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: essayTitle || "Untitled IELTS Essay",
                      content: essayText,
                      correctedContent,
                      score: parsedFeedback.overallBand,
                      feedback: parsedFeedback,
                    }),
                  })
                }

                toast({
                  title: "Success",
                  description: session
                    ? "Your essay has been graded and saved"
                    : "Your essay has been graded. Sign in to save your progress.",
                })
              } catch (parseError) {
                console.error("Parse error:", parseError)
                toast({
                  title: "Error",
                  description: "Failed to parse feedback",
                  variant: "destructive",
                })
              }
              continue
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.chunk) {
                accumulatedText += parsed.chunk
                setStreamingText(accumulatedText)
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              console.error("Chunk parse error:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting IELTS feedback:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze essay",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      setStreamingText("")
    }
  }

  const handleDownload = () => {
    // Implement download functionality
    console.log("Download feedback")
  }

  return (
    <>
      {showFeedback && feedback && (
        <FullScreenFeedbackView
          feedback={feedback}
          onClose={() => setShowFeedback(false)}
          onDownload={handleDownload}
          isLoading={isAnalyzing}
        />
      )}

      {!showFeedback && (
        <div className="container py-8 max-w-7xl">
          <div className="flex flex-col gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">IELTS Essay Correction</h1>
              <p className="text-muted-foreground mt-2">
                Get comprehensive IELTS Task 2 feedback with band scores, detailed corrections, and improvement suggestions
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Essay Input */}
        <Card>
          <CardHeader>
            <CardTitle>Your Essay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Essay Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Technology and Education"
                value={essayTitle}
                onChange={(e) => setEssayTitle(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="essay">Essay Content *</Label>
              <Textarea
                id="essay"
                placeholder="Write your IELTS Task 2 essay here (minimum 250 words recommended)..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                disabled={isAnalyzing}
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Word count: {essayText.trim().split(/\s+/).filter(Boolean).length}
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isAnalyzing || !essayText.trim()}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Essay...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get IELTS Feedback
                </>
              )}
            </Button>

            {!session && (
              <p className="text-xs text-center text-muted-foreground">
                <button
                  onClick={() => setAuthDialogOpen(true)}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>{" "}
                to save your essays and track progress
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>IELTS Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                {streamingText && (
                  <div className="text-xs text-muted-foreground">
                    <p>Processing your essay...</p>
                    <div className="mt-2 max-h-32 overflow-auto">
                      <pre className="text-[10px] whitespace-pre-wrap">{streamingText}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isAnalyzing && !feedback && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  Your IELTS feedback will appear here after analysis
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll receive:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left">
                  <li>• Overall band score (0-9)</li>
                  <li>• Four criteria scores (TR, CC, LR, GRA)</li>
                  <li>• Sentence-level corrections</li>
                  <li>• Paragraph-level improvements</li>
                  <li>• Interactive error flashcards</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
        </div>
      )}
    </>
  )
}
