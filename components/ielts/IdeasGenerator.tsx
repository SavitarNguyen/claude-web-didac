"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Lightbulb, RefreshCw, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from 'react-markdown'

interface IdeasGeneratorProps {
  essayPrompt: string
  level: '5.0_or_below' | '5.5_to_6.5' | '7.0_or_above'
  disabled?: boolean
}

export function IdeasGenerator({ essayPrompt, level, disabled = false }: IdeasGeneratorProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<'generate' | 'refine' | null>(null)
  const [userIdeas, setUserIdeas] = useState("")
  const [generatedIdeas, setGeneratedIdeas] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Word count for user ideas
  const wordCount = userIdeas.trim().split(/\s+/).filter(Boolean).length
  const maxWords = 70

  // Generate hash for localStorage key
  const getStorageKey = () => {
    const hash = essayPrompt.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0).toString()
    return `essay-ideas-${hash}`
  }

  // Load from localStorage on mount
  useEffect(() => {
    if (essayPrompt) {
      const storageKey = getStorageKey()
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          // Check if it's for the same prompt (using timestamp to expire after 24h)
          if (data.generatedIdeas && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            setGeneratedIdeas(data.generatedIdeas)
            setMode(data.mode || 'generate')
          } else {
            localStorage.removeItem(storageKey)
          }
        } catch (e) {
          console.error("Error loading from localStorage:", e)
        }
      }
    }
  }, [essayPrompt])

  // Save to localStorage when ideas are generated
  useEffect(() => {
    if (generatedIdeas && essayPrompt) {
      const storageKey = getStorageKey()
      const data = {
        generatedIdeas,
        mode,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    }
  }, [generatedIdeas, mode, essayPrompt])

  const handleGenerate = async (currentMode: 'generate' | 'refine') => {
    if (!essayPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please select an essay prompt first",
        variant: "destructive",
      })
      return
    }

    if (currentMode === 'refine' && !userIdeas.trim()) {
      toast({
        title: "Error",
        description: "Please enter your brief ideas first",
        variant: "destructive",
      })
      return
    }

    if (currentMode === 'refine' && wordCount > maxWords) {
      toast({
        title: "Error",
        description: `Your ideas exceed ${maxWords} words. Please shorten them.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setMode(currentMode)

    try {
      const response = await fetch("/api/ielts/generate-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essayPrompt,
          level,
          userIdeas: currentMode === 'refine' ? userIdeas : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate ideas")
      }

      const data = await response.json()
      setGeneratedIdeas(data.ideas)

      toast({
        title: "Success",
        description: "Essay ideas generated successfully!",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedIdeas)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Ideas copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleGenerateDifferent = () => {
    if (mode) {
      handleGenerate(mode)
    }
  }

  const handleReset = () => {
    setGeneratedIdeas("")
    setUserIdeas("")
    setMode(null)
    setError(null)
    if (essayPrompt) {
      localStorage.removeItem(getStorageKey())
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <Label className="text-base font-semibold">Ideas Generator</Label>
      </div>

      {/* Mode selection buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleGenerate('generate')}
          disabled={isLoading || disabled || !essayPrompt.trim()}
          variant="outline"
          className="w-full"
        >
          {isLoading && mode === 'generate' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>

        <Button
          onClick={() => {
            if (mode === 'refine') {
              // If already in refine mode, just generate
              handleGenerate('refine')
            } else {
              // Switch to refine mode (show input)
              setMode('refine')
            }
          }}
          disabled={isLoading || disabled || !essayPrompt.trim()}
          variant="outline"
          className="w-full"
        >
          {isLoading && mode === 'refine' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refining...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refine Your Ideas
            </>
          )}
        </Button>
      </div>

      {/* Refine mode input */}
      {mode === 'refine' && !generatedIdeas && (
        <div className="space-y-2">
          <Label htmlFor="user-ideas">Your Brief Ideas ({wordCount}/{maxWords} words)</Label>
          <Textarea
            id="user-ideas"
            placeholder="Enter your brief essay ideas here (max 70 words)..."
            value={userIdeas}
            onChange={(e) => setUserIdeas(e.target.value)}
            disabled={isLoading}
            className="min-h-[100px]"
          />
          {wordCount > maxWords && (
            <p className="text-xs text-destructive">
              Exceeds maximum word count by {wordCount - maxWords} words
            </p>
          )}
          <Button
            onClick={() => handleGenerate('refine')}
            disabled={isLoading || !userIdeas.trim() || wordCount > maxWords}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refining Ideas...
              </>
            ) : (
              'Refine Ideas'
            )}
          </Button>
        </div>
      )}

      {/* Display generated ideas */}
      {generatedIdeas && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4 max-h-[500px] overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{generatedIdeas}</ReactMarkdown>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerateDifferent}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Different Version
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && !generatedIdeas && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Helper text */}
      {!generatedIdeas && !error && (
        <p className="text-xs text-muted-foreground">
          Select an essay prompt above, then click "Generate Ideas" to get AI-powered essay brainstorming using CTA, TCA, and CBA frameworks.
        </p>
      )}
    </div>
  )
}