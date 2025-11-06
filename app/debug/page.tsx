"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [sets, setSets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSets = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/flashcards/sets")
      const data = await response.json()

      setSets(data)
    } catch (err) {
      console.error("Error fetching sets:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSets()
  }, [])

  // Update any references to the moved API endpoint
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Flashcard Sets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-800 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          ) : (
            <div>
              <p className="mb-4">Found {sets.length} sets:</p>
              <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{JSON.stringify(sets, null, 2)}</pre>
              <Button onClick={fetchSets} className="mt-4">
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">By ID:</p>
              <a
                href="/study/flashcards/11111111-1111-1111-1111-111111111111"
                className="text-blue-600 hover:underline"
              >
                /study/flashcards/11111111-1111-1111-1111-111111111111
              </a>
            </div>
            <div>
              <p className="font-medium mb-2">By Slug:</p>
              <a href="/study/flashcards/technology-vocabulary" className="text-blue-600 hover:underline">
                /study/flashcards/technology-vocabulary
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

