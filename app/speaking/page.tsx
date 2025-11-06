"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Play, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function SpeakingPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<null | {
    score: number
    pronunciation: string[]
    fluency: string[]
    intonation: string[]
  }>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // In a real app, this would use the Web Audio API to record audio
  }

  const stopRecording = () => {
    setIsRecording(false)

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // In a real app, this would stop recording and get the audio blob
    // For now, we'll simulate having an audio recording
    setAudioBlob(new Blob())
  }

  const analyzeRecording = () => {
    if (!audioBlob) return

    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      setFeedback({
        score: 78,
        pronunciation: [
          "Good pronunciation of most words",
          "Work on the 'th' sound in 'think' and 'through'",
          "The 'r' sound needs more emphasis",
        ],
        fluency: [
          "Good pace overall",
          "Some hesitation between sentences",
          "Try to reduce filler words like 'um' and 'uh'",
        ],
        intonation: [
          "Good variation in tone",
          "Questions should rise in pitch at the end",
          "Emphasize important words more clearly",
        ],
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
          <p className="text-muted-foreground">Improve your pronunciation and fluency with AI feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle>Practice Speaking</CardTitle>
              <CardDescription>
                Record yourself speaking the provided text and get AI feedback on your pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Practice Text:</h3>
                <p className="text-muted-foreground">
                  "The quick brown fox jumps over the lazy dog. Peter Piper picked a peck of pickled peppers. How much
                  wood would a woodchuck chuck if a woodchuck could chuck wood?"
                </p>
              </div>

              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <button
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                      isRecording ? "bg-red-500 text-white animate-pulse-soft" : "bg-primary text-primary-foreground"
                    }`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                  </button>
                </div>

                <div className="text-center">
                  {isRecording ? (
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-bold text-red-500 mb-1">Recording...</div>
                      <div className="text-sm">{formatTime(recordingTime)}</div>
                    </div>
                  ) : audioBlob ? (
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-medium mb-1">Recording Complete</div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          Play
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <RefreshCw className="h-4 w-4" />
                          Re-record
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Press the microphone to start recording</div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={analyzeRecording} disabled={!audioBlob || isAnalyzing} className="px-8">
                  {isAnalyzing ? "Analyzing..." : "Analyze My Speech"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {feedback && (
            <Card className="mt-6 bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">AI Feedback</CardTitle>
                <div className="flex items-center">
                  <span className="text-lg font-bold mr-2">Score: {feedback.score}/100</span>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">{feedback.score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pronunciation">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
                    <TabsTrigger value="fluency">Fluency</TabsTrigger>
                    <TabsTrigger value="intonation">Intonation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pronunciation" className="mt-4">
                    <ul className="space-y-2">
                      {feedback.pronunciation.map((item, index) => (
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

                  <TabsContent value="fluency" className="mt-4">
                    <ul className="space-y-2">
                      {feedback.fluency.map((item, index) => (
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

                  <TabsContent value="intonation" className="mt-4">
                    <ul className="space-y-2">
                      {feedback.intonation.map((item, index) => (
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
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Practice Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors">
                  <h3 className="font-medium mb-1">Tongue Twisters</h3>
                  <p className="text-sm text-muted-foreground">Practice difficult sound combinations</p>
                </div>
                <div className="p-3 rounded-md bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors">
                  <h3 className="font-medium mb-1">Common Phrases</h3>
                  <p className="text-sm text-muted-foreground">Everyday expressions and idioms</p>
                </div>
                <div className="p-3 rounded-md bg-accent/10 cursor-pointer hover:bg-accent/20 transition-colors">
                  <h3 className="font-medium mb-1">Pronunciation Pairs</h3>
                  <p className="text-sm text-muted-foreground">Similar-sounding words that are often confused</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Browse More Exercises
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pronunciation</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fluency</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Intonation</span>
                    <span>80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall</span>
                    <span>74%</span>
                  </div>
                  <Progress value={74} className="h-2" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-2">Recent Achievements</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-accent" />
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

