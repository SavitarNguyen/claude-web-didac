"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Pencil, Mic, Award, TrendingUp } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { getUserProgress, getRecentActivity } from "./actions/progress-actions"

export default function Dashboard() {
  const { data: session } = useSession()
  const [progress, setProgress] = useState({
    wordsLearned: 0,
    essaysCompleted: 0,
    speakingCompleted: 0,
    studyTimeMinutes: 0,
    streak: 0,
    lastStudyDate: new Date(),
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch data if the user is logged in
    if (session?.user) {
      fetchData()
    } else {
      // Set loading to false for guest users
      setLoading(false)
    }
  }, [session])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [progressData, activityData] = await Promise.all([getUserProgress(), getRecentActivity()])

      setProgress(progressData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Format date to display
  const formatDate = (date) => {
    const now = new Date()
    const diffDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else {
      return `${diffDays} days ago`
    }
  }

  // Calculate vocabulary progress percentage
  const vocabProgress = Math.min(100, Math.round((progress.wordsLearned / 500) * 100))

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name || "Student"}!</h1>
          <p className="text-muted-foreground">Continue your learning journey today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Image
            src="/placeholder.svg?height=120&width=120"
            alt="Cute mascot"
            width={120}
            height={120}
            className="animate-float"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vocabulary Words</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.wordsLearned}/500</div>
            <p className="text-xs text-muted-foreground">{vocabProgress}% complete</p>
            <Progress value={vocabProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-secondary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Essays Written</CardTitle>
            <Pencil className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.essaysCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {progress.essaysCompleted > 0
                ? `Last essay: ${formatDate(progress.lastStudyDate)}`
                : "No essays written yet"}
            </p>
            <Progress value={Math.min(100, progress.essaysCompleted * 5)} className="h-2 mt-2 bg-secondary/20" />
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-accent/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Speaking Practice</CardTitle>
            <Mic className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.speakingCompleted} sessions</div>
            <p className="text-xs text-muted-foreground">{Math.floor(progress.studyTimeMinutes / 60)} hours total</p>
            <Progress value={Math.min(100, progress.speakingCompleted * 10)} className="h-2 mt-2 bg-accent/20" />
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.streak} days</div>
            <p className="text-xs text-muted-foreground">
              {progress.streak > 0 ? "Keep it up!" : "Start your streak today!"}
            </p>
            <Progress value={Math.min(100, progress.streak * 10)} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning activities from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="h-16 bg-muted/50 animate-pulse rounded-md"></div>
                <div className="h-16 bg-muted/50 animate-pulse rounded-md"></div>
                <div className="h-16 bg-muted/50 animate-pulse rounded-md"></div>
              </div>
            ) : session?.user ? (
              recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 
                        ${
                          activity.type === "flashcard"
                            ? "bg-primary/20"
                            : activity.type === "essay"
                              ? "bg-secondary/20"
                              : "bg-accent/20"
                        }`}
                      >
                        {activity.type === "flashcard" ? (
                          <BookOpen className="h-5 w-5 text-primary" />
                        ) : activity.type === "essay" ? (
                          <Pencil className="h-5 w-5 text-secondary" />
                        ) : (
                          <Mic className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.date)} at{" "}
                          {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 active:scale-95 transition-transform"
                        onClick={() => (window.location.href = activity.url)}
                      >
                        {activity.action}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity found.</p>
                  <p className="text-sm mt-2">Start learning to see your activity here!</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Sign in to track your learning activity.</p>
                <Button
                  className="mt-4 active:scale-95 transition-transform"
                  onClick={() => (window.location.href = "/auth/signin")}
                >
                  Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Recommended Next</CardTitle>
            <CardDescription>Based on your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Vocabulary Practice</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Continue with "Business Terms" flashcards</p>
                <Button
                  size="sm"
                  className="w-full active:scale-95 transition-transform"
                  onClick={() => (window.location.href = "/flashcards")}
                >
                  Start Learning
                </Button>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-secondary mr-2" />
                  <h3 className="font-medium">Weekly Goal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">3 more activities to reach your goal</p>
                <Progress value={70} className="h-2 mb-3 bg-secondary/20" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full active:scale-95 transition-transform"
                  onClick={() => (window.location.href = "/progress")}
                >
                  View Goals
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

