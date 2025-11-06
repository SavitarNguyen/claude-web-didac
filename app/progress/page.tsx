"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  LineChart,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  Pencil,
  Mic,
  Download,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

export default function ProgressPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Dashboard</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>
        <Button variant="outline" className="mt-4 md:mt-0 flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export Progress Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5 hours</div>
            <p className="text-xs text-muted-foreground">+2.3 hours this week</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-secondary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vocabulary Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127 words</div>
            <p className="text-xs text-muted-foreground">+15 words this week</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-accent/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Essays Completed</CardTitle>
            <Pencil className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 essays</div>
            <p className="text-xs text-muted-foreground">Average score: 85/100</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Speaking Sessions</CardTitle>
            <Mic className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 sessions</div>
            <p className="text-xs text-muted-foreground">Pronunciation: 72% accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 text-primary mr-2" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {/* This would be a chart in a real app */}
                  <div className="text-center text-muted-foreground">
                    <BarChart className="h-16 w-16 mx-auto mb-2 text-primary/50" />
                    <p>Weekly progress chart would appear here</p>
                    <p className="text-sm">Showing study time and performance metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Learn 500 vocabulary words</span>
                      <span>127/500</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Complete 20 essays</span>
                      <span>8/20</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>30 speaking practice sessions</span>
                      <span>12/30</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reach 85% pronunciation accuracy</span>
                      <span>72/85</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Study 100 hours total</span>
                      <span>24.5/100</span>
                    </div>
                    <Progress value={24.5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vocabulary" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>Vocabulary Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recently Mastered Words</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {["Ephemeral", "Ubiquitous", "Serendipity", "Eloquent", "Resilient", "Hypothesis"].map((word) => (
                        <div
                          key={word}
                          className="px-3 py-2 bg-primary/10 text-primary-foreground rounded-md text-sm flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Words Needing Review</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {["Ambiguous", "Pragmatic", "Paradigm", "Arbitrary"].map((word) => (
                        <div
                          key={word}
                          className="px-3 py-2 bg-amber-100 text-amber-800 rounded-md text-sm flex items-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2 text-amber-500" />
                          {word}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Vocabulary Categories</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Academic Words</span>
                          <span>45/100</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Business Terms</span>
                          <span>20/100</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Everyday Vocabulary</span>
                          <span>62/100</span>
                        </div>
                        <Progress value={62} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>Recommended Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-md bg-primary/10">
                    <h3 className="font-medium mb-1">Business Terms</h3>
                    <p className="text-sm text-muted-foreground mb-3">This category needs more practice</p>
                    <Button size="sm" className="w-full">
                      Practice Now
                    </Button>
                  </div>

                  <div className="p-3 rounded-md bg-secondary/10">
                    <h3 className="font-medium mb-1">Review Session</h3>
                    <p className="text-sm text-muted-foreground mb-3">4 words need review</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Start Review
                    </Button>
                  </div>

                  <div className="p-3 rounded-md bg-accent/10">
                    <h3 className="font-medium mb-1">New Words</h3>
                    <p className="text-sm text-muted-foreground mb-3">Suggested new vocabulary to learn</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Explore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Vocabulary Master",
                description: "Learned 100+ vocabulary words",
                date: "March 15, 2025",
                icon: BookOpen,
                color: "primary",
              },
              {
                title: "Essay Expert",
                description: "Completed 5+ essays with 80%+ score",
                date: "March 10, 2025",
                icon: Pencil,
                color: "secondary",
              },
              {
                title: "Pronunciation Pro",
                description: "Achieved 70%+ pronunciation accuracy",
                date: "March 5, 2025",
                icon: Mic,
                color: "accent",
              },
              {
                title: "Consistent Learner",
                description: "Studied for 7 consecutive days",
                date: "February 28, 2025",
                icon: Calendar,
                color: "primary",
              },
              {
                title: "Quick Learner",
                description: "Mastered 10 words in one day",
                date: "February 25, 2025",
                icon: TrendingUp,
                color: "secondary",
              },
              {
                title: "First Steps",
                description: "Completed your first lesson",
                date: "February 20, 2025",
                icon: Award,
                color: "accent",
              },
            ].map((achievement, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-${achievement.color}/20 flex items-center justify-center mr-4`}
                    >
                      <achievement.icon className={`h-6 w-6 text-${achievement.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

