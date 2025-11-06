"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, RefreshCw, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface FlashcardSet {
  id: string
  title: string
  description: string
  slug: string
  card_count: number
}

export default function TestFlashcardCreationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [selectedSetId, setSelectedSetId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/flashcards/sets")
        const data = await response.json()
        setSets(data)
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

  const handleTestCreation = async () => {
    if (!selectedSetId) {
      toast({
        title: "Error",
        description: "Please select a flashcard set",
        variant: "destructive",
      })
      return
    }

    try {
      setTestLoading(true)
      setTestResult(null)

      const response = await fetch("/api/test/flashcard-creation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setId: selectedSetId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create test flashcard")
      }

      setTestResult(data)

      toast({
        title: "Success",
        description: data.message || "Test flashcard created successfully",
      })

      // Refresh the sets to update the card count
      const setsResponse = await fetch("/api/flashcards/sets")
      const setsData = await setsResponse.json()
      setSets(setsData)
    } catch (error) {
      console.error("Error creating test flashcard:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test flashcard",
        variant: "destructive",
      })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Test Flashcard Creation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Test Flashcard</CardTitle>
            <CardDescription>
              This will create a test flashcard in the selected set to verify the functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Flashcard Set</label>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="animate-spin h-4 w-4" />
                    <span>Loading sets...</span>
                  </div>
                ) : (
                  <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flashcard set" />
                    </SelectTrigger>
                    <SelectContent>
                      {sets.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.title} ({set.card_count || 0} cards)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button onClick={handleTestCreation} disabled={testLoading || !selectedSetId} className="w-full">
                {testLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Test Flashcard
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
            <CardDescription>The result of the test flashcard creation</CardDescription>
          </CardHeader>
          <CardContent>
            {testLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
                  <p>Creating test flashcard...</p>
                </div>
              </div>
            ) : testResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="font-medium text-green-700 dark:text-green-300">{testResult.message}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Created Flashcard:</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
                    {JSON.stringify(testResult.flashcard, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <p>No test has been run yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

