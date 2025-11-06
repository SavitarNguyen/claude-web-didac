"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, X, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WordDefinition {
  word: string
  phonetic?: string
  meanings: {
    partOfSpeech: string
    definitions: {
      definition: string
      example?: string
    }[]
  }[]
  phonetics?: {
    text?: string
    audio?: string
  }[]
}

export function WordTranslationMenu() {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedWord, setSelectedWord] = useState("")
  const [definition, setDefinition] = useState<WordDefinition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Only process if the target is a text node or element with text
      const target = e.target as HTMLElement
      if (!target || !target.textContent?.trim()) return

      // Get the selected text
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim()

      // If there's selected text, show the menu
      if (selectedText) {
        e.preventDefault()

        // Set the position of the menu
        const x = e.clientX
        const y = e.clientY

        // Adjust position to keep menu in viewport
        const menuWidth = 300
        const menuHeight = 300
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        const adjustedX = Math.min(x, viewportWidth - menuWidth - 10)
        const adjustedY = Math.min(y, viewportHeight - menuHeight - 10)

        setPosition({ x: adjustedX, y: adjustedY })
        setSelectedWord(selectedText)
        setIsVisible(true)
        setDefinition(null)
        setError(null)

        // Fetch the definition
        fetchDefinition(selectedText)
      }
    }

    const handleClick = (e: MouseEvent) => {
      // Close the menu if clicking outside
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsVisible(false)
      }
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("click", handleClick)

    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  const fetchDefinition = async (word: string) => {
    if (!word) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError(`No definition found for "${word}"`)
        } else {
          setError("Failed to fetch definition")
        }
        return
      }

      const data = await response.json()

      if (data && data.length > 0) {
        setDefinition(data[0])
      } else {
        setError(`No definition found for "${word}"`)
      }
    } catch (err) {
      console.error("Error fetching definition:", err)
      setError("Failed to fetch definition")
    } finally {
      setLoading(false)
    }
  }

  const playAudio = () => {
    if (!definition?.phonetics) return

    // Find the first audio file
    const audioFile = definition.phonetics.find((p) => p.audio)?.audio

    if (audioFile) {
      const audio = new Audio(audioFile)
      audio.play().catch((err) => {
        console.error("Error playing audio:", err)
        toast({
          title: "Error",
          description: "Failed to play pronunciation",
          variant: "destructive",
        })
      })
    } else {
      toast({
        title: "Info",
        description: "No pronunciation available",
      })
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 shadow-lg"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: "300px",
        maxHeight: "400px",
      }}
    >
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h3 className="font-bold text-lg mr-2">{selectedWord}</h3>
              {definition?.phonetic && <span className="text-sm text-muted-foreground">{definition.phonetic}</span>}
            </div>
            <div className="flex gap-1">
              {definition?.phonetics?.some((p) => p.audio) && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playAudio}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="flex space-x-2 items-center">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-muted-foreground">{error}</div>
            ) : definition ? (
              <div className="space-y-3">
                {definition.meanings.map((meaning, index) => (
                  <div key={index}>
                    <div className="font-medium text-sm text-primary">{meaning.partOfSpeech}</div>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {meaning.definitions.slice(0, 3).map((def, i) => (
                        <li key={i} className="text-sm">
                          <span>{def.definition}</span>
                          {def.example && (
                            <p className="text-xs text-muted-foreground italic ml-5 mt-1">"{def.example}"</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="text-xs text-right pt-2">
                  <a
                    href={`https://www.dictionary.com/browse/${encodeURIComponent(selectedWord)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-end text-primary hover:underline"
                  >
                    More details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

