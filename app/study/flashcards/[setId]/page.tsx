"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, AlertCircle, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AIChatbot } from "@/components/ai-chatbot"

interface Flashcard {
  id: string
  word: string
  definition: string
  example: string
  topic?: string
  vietnamese_translation?: string
  pronunciation?: string
  word_type?: string
  usage_collocations?: string
  related_words?: string
  sample_ielts_usage?: string
}

interface FlashcardSet {
  id: string
  title: string
  description: string
  flashcards: Flashcard[]
  card_count?: number
  created_at?: string
  updated_at?: string
}

export default function FlashcardStudyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [set, setSet] = useState<FlashcardSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false)

  const setId = params.setId as string

  useEffect(() => {
    const fetchSet = async () => {
      try {
        setLoading(true)

        // Try the more robust endpoint that handles both slugs and IDs
        const response = await fetch(`/api/flashcards/sets/${setId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch flashcard set: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setSet(data)
      } catch (err) {
        console.error("Error fetching set:", err)
        setError("Failed to load flashcard set. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load flashcard set",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (setId) {
      fetchSet()
    }

    // Clean up any ongoing speech when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [setId, toast])

  const handleNext = () => {
    if (set && currentCardIndex < set.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setFlipped(false)
    }
  }

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const speakText = async (text: string, isWord = false) => {
    try {
      setIsSpeaking(true)

      if (isWord) {
        // Try to use the Dictionary API for pronunciation
        const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${text.toLowerCase()}-us.mp3`

        // Check if the audio file exists
        const response = await fetch(audioUrl, { method: "HEAD" })

        if (response.ok) {
          const audio = new Audio(audioUrl)
          audio.onended = () => setIsSpeaking(false)
          audio.onerror = () => {
            // Fallback to speech synthesis if audio file doesn't play
            fallbackSpeech(text)
          }
          await audio.play()
          return
        } else {
          // Fallback to speech synthesis if audio file doesn't exist
          fallbackSpeech(text)
        }
      } else {
        // Use speech synthesis for non-word text (like examples)
        fallbackSpeech(text)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      setIsSpeaking(false)
      fallbackSpeech(text)
    }
  }

  const fallbackSpeech = (text: string) => {
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
      toast({
        title: "Error",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      })
      setIsSpeaking(false)
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Add an event listener for when speech ends
    utterance.onend = () => {
      setIsSpeaking(false)
    }

    // Add an event listener for errors
    utterance.onerror = () => {
      setIsSpeaking(false)
      toast({
        title: "Error",
        description: "Failed to speak text",
        variant: "destructive",
      })
    }

    // Speak the text
    window.speechSynthesis.speak(utterance)
  }

  const handleSpeakWord = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card from flipping
    if (set && !isSpeaking) {
      speakText(set.flashcards[currentCardIndex].word, true)
    }
  }

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card from flipping
    if (set && !isSpeaking && set.flashcards[currentCardIndex].example) {
      speakText(set.flashcards[currentCardIndex].example)
    }
  }

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot)
    setIsChatbotMinimized(false)
  }

  const toggleMinimizeChatbot = () => {
    setIsChatbotMinimized(!isChatbotMinimized)
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl h-80">
            <CardContent className="flex items-center justify-center h-full">
              <Skeleton className="h-32 w-3/4" />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center mt-6 gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!set || !set.flashcards || set.flashcards.length === 0) {
    return (
      <div className="container py-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">This flashcard set is empty.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/flashcards")}>
            Browse Other Sets
          </Button>
        </div>
      </div>
    )
  }

  const currentCard = set.flashcards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / set.flashcards.length) * 100

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sets
        </Button>
        <div className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {set.flashcards.length}
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold">{set.title}</h1>
        <p className="text-muted-foreground">{set.description}</p>
      </div>

      <div className="w-full bg-muted h-1 mb-6 rounded-full overflow-hidden">
        <div className="bg-primary h-1 transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex justify-center mb-6">
            <Card
              className="w-full max-w-2xl min-h-[320px] cursor-pointer transition-all duration-300 ease-in-out transform hover:shadow-lg relative"
              onClick={handleFlip}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 h-full">
                {flipped ? (
                  <div className="w-full">
                    {/* Word Type */}
                    {currentCard.word_type && (
                      <p className="text-sm text-muted-foreground mb-2 text-center">({currentCard.word_type})</p>
                    )}
                    
                    {/* English Definition */}
                    <p className="text-lg mb-4 font-medium text-center">{currentCard.definition}</p>
                    
                    {/* Vietnamese Translation */}
                    {currentCard.vietnamese_translation && (
                      <p className="text-base mb-4 text-muted-foreground text-center">({currentCard.vietnamese_translation})</p>
                    )}
                    
                    {/* Usage Collocations in Red */}
                    {currentCard.usage_collocations && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm font-medium text-red-700 mb-1">Usage / Collocations:</p>
                        <p className="text-sm text-red-600">{currentCard.usage_collocations}</p>
                      </div>
                    )}
                    
                    {/* Examples */}
                    {currentCard.example && (
                      <div className="mt-4 p-4 bg-muted rounded-md relative">
                        <div className="italic text-muted-foreground pr-8 whitespace-pre-line">{currentCard.example}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={handleSpeakExample}
                          disabled={isSpeaking}
                        >
                          <Volume2 className={`h-4 w-4 ${isSpeaking ? "text-primary animate-pulse" : ""}`} />
                          <span className="sr-only">Pronounce example</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center relative w-full">
                    <h2 className="text-3xl font-bold mb-2">{currentCard.word}</h2>
                    <p className="text-sm text-muted-foreground">(Click to reveal definition)</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-10 w-10 rounded-full"
                      onClick={handleSpeakWord}
                      disabled={isSpeaking}
                    >
                      <Volume2 className={`h-5 w-5 ${isSpeaking ? "text-primary animate-pulse" : ""}`} />
                      <span className="sr-only">Pronounce word</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentCardIndex === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleFlip}>{flipped ? "Show Word" : "Show Definition"}</Button>
            <Button variant="outline" onClick={handleNext} disabled={currentCardIndex === set.flashcards.length - 1}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={toggleChatbot}>
              {showChatbot ? "Hide Assistant" : "Show AI Assistant"}
            </Button>
          </div>
        </div>

        {showChatbot && (
          <div className="lg:w-[350px]">
            <AIChatbot
              initialContext={`The user is studying flashcards about "${set.title}". The current word is "${currentCard.word}" which means "${currentCard.definition}".`}
              onClose={toggleChatbot}
              onMinimize={toggleMinimizeChatbot}
              isMinimized={isChatbotMinimized}
            />
          </div>
        )}
      </div>
    </div>
  )
}

