"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw, Volume2, Check, X, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface FlashcardCard {
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
  progress: {
    status: "new" | "learning" | "known" | "difficult"
    review_count: number
  }
}

interface FlashcardProps {
  cards: FlashcardCard[]
  onWordClick: (word: string) => void
  onUpdateStatus: (cardId: string, status: "new" | "learning" | "known" | "difficult") => void
}

export function FlashcardDeck({ cards, onWordClick, onUpdateStatus }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [animation, setAnimation] = useState("")
  const [showControls, setShowControls] = useState(false)
  const [studyProgress, setStudyProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Reset state when cards change
    setCurrentIndex(0)
    setFlipped(false)
    setShowControls(false)
    setAnimation("")
  }, [cards])

  useEffect(() => {
    // Update progress when current index changes
    if (cards.length > 0) {
      setStudyProgress(Math.round(((currentIndex + 1) / cards.length) * 100))
    }
  }, [currentIndex, cards.length])

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setAnimation("slide-out-left")
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setFlipped(false)
        setShowControls(false)
        setAnimation("slide-in-right")
        setTimeout(() => setAnimation(""), 300)
      }, 300)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setAnimation("slide-out-right")
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1)
        setFlipped(false)
        setShowControls(false)
        setAnimation("slide-in-left")
        setTimeout(() => setAnimation(""), 300)
      }, 300)
    }
  }

  const handleFlip = () => {
    setFlipped(!flipped)
    if (!flipped) {
      setShowControls(true)
    }
  }

  const handleUpdateStatus = async (status: "new" | "learning" | "known" | "difficult") => {
    await onUpdateStatus(currentCard.id, status)
    // Only move to next card if there is one
    if (currentIndex < cards.length - 1) {
      handleNext()
    }
  }

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isPlaying) return

    setIsPlaying(true)

    try {
      // Try to use the Dictionary API for pronunciation
      const word = currentCard.word.toLowerCase().trim()
      const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`

      // Check if the audio file exists
      const response = await fetch(audioUrl, { method: "HEAD" })

      if (response.ok) {
        const audio = new Audio(audioUrl)

        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
          // Fallback to speech synthesis if audio file doesn't play
          fallbackSpeech(currentCard.word)
        }

        await audio.play()
      } else {
        // Fallback to speech synthesis if audio file doesn't exist
        fallbackSpeech(currentCard.word)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      fallbackSpeech(currentCard.word)
    }
  }

  const fallbackSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => {
      setIsPlaying(false)
      toast({
        title: "Error",
        description: "Failed to speak text",
        variant: "destructive",
      })
    }

    window.speechSynthesis.speak(utterance)
  }

  if (cards.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center h-64">
        <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No cards to study</h3>
        <p className="text-muted-foreground">Try selecting a different study mode or flashcard set</p>
      </Card>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="flex items-center">
            <span
              className={cn("h-2 w-2 rounded-full mr-1", {
                "bg-green-500": currentCard.progress.status === "known",
                "bg-yellow-500": currentCard.progress.status === "learning",
                "bg-red-500": currentCard.progress.status === "difficult",
                "bg-blue-500": currentCard.progress.status === "new",
              })}
            />
            <span className="capitalize">{currentCard.progress.status}</span>
            {currentCard.progress.review_count > 0 && (
              <span className="ml-2">· Reviewed {currentCard.progress.review_count} times</span>
            )}
          </span>
        </div>

        <Progress value={studyProgress} className="h-1 mb-2" />

        <div
          className={cn("flashcard relative h-64 w-full cursor-pointer", flipped && "flipped", animation)}
          onClick={handleFlip}
        >
          <Card className="flashcard-front flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={handlePlayAudio}
                disabled={isPlaying}
              >
                <Volume2 className={cn("h-4 w-4", isPlaying && "text-primary animate-pulse")} />
              </Button>
            </div>
            <h2
              className="text-3xl font-bold text-center mb-2 text-primary-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onWordClick(currentCard.word)
              }}
            >
              {currentCard.word}
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-4">Click to see definition</p>
          </Card>

          <Card className="flashcard-back flex flex-col p-6 bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
            {/* Word Type */}
            {currentCard.word_type && (
              <p className="text-sm text-muted-foreground mb-2">({currentCard.word_type})</p>
            )}
            
            {/* English Definition */}
            <h3 className="text-lg font-semibold mb-2 text-primary-foreground">Definition:</h3>
            <p className="mb-4 font-medium">{currentCard.definition}</p>
            
            {/* Vietnamese Translation */}
            {currentCard.vietnamese_translation && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-primary-foreground">Vietnamese:</h3>
                <p className="text-muted-foreground">{currentCard.vietnamese_translation}</p>
              </div>
            )}
            
            {/* Usage Collocations in Red */}
            {currentCard.usage_collocations && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-sm font-medium text-red-700 mb-1">Usage / Collocations:</h3>
                <p className="text-sm text-red-600">{currentCard.usage_collocations}</p>
              </div>
            )}
            
                    {/* Examples */}
        {currentCard.example && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-primary-foreground">Example:</h3>
            <div className="italic text-muted-foreground whitespace-pre-line">{currentCard.example}</div>
          </div>
        )}

            {showControls && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateStatus("difficult")
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Difficult
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateStatus("learning")
                  }}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Learning
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateStatus("known")
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Known
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="transition-transform active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setFlipped(!flipped)}
          className="transition-transform active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="transition-transform active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

