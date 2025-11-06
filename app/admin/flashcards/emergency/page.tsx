"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, RefreshCw, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface FlashcardSet {
  id: string
  title: string
}

export default function EmergencyFlashcardPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSetId, setSelectedSetId] = useState("")
  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/flashcards/sets")
        if (!response.ok) throw new Error("Failed to fetch sets")

        const data = await response.json()
        setSets(data)

        if (data.length > 0) {
          setSelectedSetId(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching sets:", error)
        toast({
          title: "Error",
          description: "Failed to load flashcard sets",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSets()
  }, [toast])

  const handleCreateFlashcard = async () => {
    if (!selectedSetId || !word.trim() || !definition.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      setResult(null)

      const response = await fetch("/api/flashcards/simple-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          setId: selectedSetId,
          word: word.trim(),
          definition: definition.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create flashcard")
      }

      setResult(data)

      toast({
        title: "Success",
        description: "Flashcard created successfully",
      })

      // Clear the form
      setWord("")
      setDefinition("")
    } catch (error) {
      console.error("Error creating flashcard:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create flashcard",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Emergency Flashcard Creation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Flashcard (Simplified)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="set">Flashcard Set</Label>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="animate-spin h-4 w-4" />
                    <span>Loading sets...</span>
                  </div>
                ) : (
                  <select
                    id="set"
                    value={selectedSetId}
                    onChange={(e) => setSelectedSetId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={sets.length === 0}
                  >
                    {sets.length === 0 ? (
                      <option value="">No sets available</option>
                    ) : (
                      sets.map((set) => (
                        <option key={set.id} value={set.id}>
                          {set.title}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="word">Word</Label>
                <Input
                  id="word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter word or term"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="definition">Definition</Label>
                <Textarea
                  id="definition"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  placeholder="Enter definition"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateFlashcard}
                disabled={creating || !selectedSetId || !word.trim() || !definition.trim()}
                className="w-full"
              >
                {creating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Flashcard
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="font-medium text-green-700 dark:text-green-300">Flashcard created successfully!</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Response:</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <p>Create a flashcard to see the result</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debugging Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Run the <code>emergency_flashcard_fix.sql</code> script in your Supabase SQL editor
            </li>
            <li>Try creating a flashcard using this simplified form</li>
            <li>If it succeeds, the issue was likely with the complex form or API endpoint</li>
            <li>If it fails, check the error message and console logs for details</li>
            <li>Verify that your user has the correct permissions in Supabase</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

