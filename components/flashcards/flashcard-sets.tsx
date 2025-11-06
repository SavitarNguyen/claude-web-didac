"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Clock, ArrowRight, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Update the FlashcardSet interface to include a direct card_count field
interface FlashcardSet {
  id: string
  title: string
  description: string
  slug: string
  card_count: number
  created_at: string
}

export function FlashcardSets() {
  const { toast } = useToast()
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSets = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/flashcards/sets")

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle authentication error gracefully
        if (response.status === 401 && errorData.requiresAuth) {
          setError("Please log in to view flashcard sets")
          return
        }
        
        throw new Error(`Failed to fetch flashcard sets: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setSets(data)
    } catch (err) {
      console.error("Error fetching sets:", err)
      setError("Failed to load flashcard sets. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to load flashcard sets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSets()
  }, [toast])

  // Replace the getCardCount function with a simpler version that handles the direct card_count field
  const getCardCount = (set: FlashcardSet): number => {
    // If card_count is directly available as a number, use it
    if (typeof set.card_count === "number") {
      return set.card_count
    }
    // Fallback to 0 if no count is available
    return 0
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        {error === "Please log in to view flashcard sets" ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">You need to be logged in to view and study flashcards.</p>
            <Link href="/auth/signin">
              <Button>
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <Button variant="outline" onClick={fetchSets}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (sets.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center h-64">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No flashcard sets found</h3>
        <p className="text-muted-foreground">Check back later for new content</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sets.map((set) => (
        <Card key={set.id} className="overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>{set.title}</CardTitle>
            <CardDescription>{set.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4 mr-1" />
              {/* Update the span element to display the card count */}
              <span>
                {getCardCount(set)} {getCardCount(set) === 1 ? "card" : "cards"}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Added {new Date(set.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/study/flashcards/${set.slug || set.id}`} className="w-full">
              <Button className="w-full">
                Study Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

