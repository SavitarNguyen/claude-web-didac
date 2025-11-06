"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Save, FileText, Clock, CheckCircle, AlertCircle, BookOpen, BarChart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AuthDialog } from "@/components/auth-dialog"
import { gradeEssay } from "../actions/essay-actions"

export default function EssayPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [essayText, setEssayText] = useState("")
  const [essayTitle, setEssayTitle] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  // Update the feedback state type to match the new IELTS feedback structure
  const [feedback, setFeedback] = useState(null)

  const handleSubmit = async () => {
    if (!essayTitle.trim() || !essayText.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a title and content for your essay",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const result = await gradeEssay(essayTitle, essayText)

      if (!result) {
        throw new Error("No response from grading service")
      }

      setFeedback(result)

      // Show appropriate toast based on whether the essay was saved
      if (result.saved) {
        toast({
          title: "Success",
          description: "Your essay has been graded and saved to your account",
        })
      } else {
        toast({
          title: "Essay Graded",
          description: "Sign in to save your essay and track your progress",
        })
      }
    } catch (error) {
      console.error("Error submitting essay:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong while grading your essay",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveEssay = () => {
    if (!session) {
      setAuthDialogOpen(true)
      return
    }

    // If already saved, show a message
    if (feedback?.saved) {
      toast({
        title: "Already Saved",
        description: "This essay is already saved to your account",
      })
      return
    }

    // Otherwise, save the essay
    handleSubmit()
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Essay Writing</h1>
          <p className="text-muted-foreground">Write essays and get AI-powered feedback with Deepseek</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Write Your Essay</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Word count: {essayText.split(/\s+/).filter(Boolean).length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-2 mb-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Essay Title"
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                />
                <textarea
                  className="w-full h-64 p-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Start writing your essay here..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-between">
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1" onClick={handleSaveEssay}>
                      <Save className="h-4 w-4" />
                      Save Draft
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Authentication Required</DialogTitle>
                      <DialogDescription>Sign in to save your essay and track your progress.</DialogDescription>
                    </DialogHeader>
                    <AuthDialog onClose={() => setAuthDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={handleSubmit}
                  disabled={!essayText.trim() || !essayTitle.trim() || isAnalyzing}
                  className="flex items-center gap-1"
                >
                  {isAnalyzing ? "Analyzing..." : "Get Feedback"}
                  <Send className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {isAnalyzing ? (
            <Card className="mt-6 bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Analyzing your essay...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            feedback && (
              <Card className="mt-6 bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">AI Feedback</CardTitle>
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2">Score: {feedback.score}/9</span>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">{feedback.score}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Update the TabsContent section in the feedback card to display IELTS criteria */}
                  <Tabs defaultValue="task">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="task">Task Achievement</TabsTrigger>
                      <TabsTrigger value="coherence">Coherence</TabsTrigger>
                      <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                      <TabsTrigger value="grammar">Grammar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="task" className="mt-4">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-bold mr-2">
                          Score: {feedback.feedback.taskAchievement.score}/9
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {feedback.feedback.taskAchievement.score}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.feedback.taskAchievement.feedback.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {index === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="coherence" className="mt-4">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-bold mr-2">
                          Score: {feedback.feedback.coherenceCohesion.score}/9
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {feedback.feedback.coherenceCohesion.score}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.feedback.coherenceCohesion.feedback.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {index === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="vocabulary" className="mt-4">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-bold mr-2">Score: {feedback.feedback.vocabulary.score}/9</span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {feedback.feedback.vocabulary.score}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.feedback.vocabulary.feedback.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {index === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="grammar" className="mt-4">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-bold mr-2">Score: {feedback.feedback.grammar.score}/9</span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {feedback.feedback.grammar.score}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.feedback.grammar.feedback.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {index === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {feedback.feedback.improvements.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!feedback.saved && !session && (
                    <div className="mt-6 p-4 bg-primary/10 rounded-md">
                      <p className="text-sm mb-2">Sign in to save this essay and track your progress over time.</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Sign In to Save</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Authentication</DialogTitle>
                            <DialogDescription>Sign in to save your essay and track your progress.</DialogDescription>
                          </DialogHeader>
                          <AuthDialog onClose={() => {}} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Essay Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="p-3 rounded-md bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    setEssayTitle("The Impact of Technology")
                    setEssayText("Technology has dramatically transformed society in the past decade...")
                  }}
                >
                  <h3 className="font-medium mb-1">The Impact of Technology</h3>
                  <p className="text-sm text-muted-foreground">
                    Discuss how technology has changed society in the past decade.
                  </p>
                </div>
                <div
                  className="p-3 rounded-md bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors"
                  onClick={() => {
                    setEssayTitle("Climate Change Solutions")
                    setEssayText("Climate change presents one of the most pressing challenges of our time...")
                  }}
                >
                  <h3 className="font-medium mb-1">Climate Change Solutions</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore potential solutions to address climate change.
                  </p>
                </div>
                <div
                  className="p-3 rounded-md bg-accent/10 cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => {
                    setEssayTitle("Education in the Future")
                    setEssayText("The education system is poised for significant evolution in the coming decades...")
                  }}
                >
                  <h3 className="font-medium mb-1">Education in the Future</h3>
                  <p className="text-sm text-muted-foreground">
                    How might education systems evolve in the next 20 years?
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Browse More Topics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Writing Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Essay Structure Guide</h3>
                    <p className="text-xs text-muted-foreground">Learn the basics of essay organization</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Vocabulary Enhancer</h3>
                    <p className="text-xs text-muted-foreground">Improve your word choice</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                    <BarChart className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Common Mistakes</h3>
                    <p className="text-xs text-muted-foreground">Avoid these writing pitfalls</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

