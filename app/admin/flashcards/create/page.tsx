"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Save, Trash2, ArrowLeft, BookOpen, Upload, Table, FileText } from "lucide-react"
import { generateSlug } from "@/lib/utils"

interface FlashcardSet {
  id: string
  title: string
  description: string
  slug: string
}

interface Flashcard {
  id?: string
  word: string
  definition: string
  example: string
}

export default function CreateFlashcardsPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Set creation state
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [loadingSets, setLoadingSets] = useState(true)
  const [newSetTitle, setNewSetTitle] = useState("")
  const [newSetDescription, setNewSetDescription] = useState("")

  // Flashcard creation state
  const [selectedSetId, setSelectedSetId] = useState<string>("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard>({
    word: "",
    definition: "",
    example: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bulk import state
  const [bulkImportText, setBulkImportText] = useState("")
  const [importFormat, setImportFormat] = useState<"tab" | "csv" | "excel">("tab")

  // Fetch existing sets
  useEffect(() => {
    const fetchSets = async () => {
      try {
        setLoadingSets(true)
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
        setLoadingSets(false)
      }
    }

    fetchSets()
  }, [toast])

  // Create a new set
  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSetTitle.trim()) {
      toast({
        title: "Error",
        description: "Set title is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/flashcards/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newSetTitle,
          description: newSetDescription,
          slug: generateSlug(newSetTitle),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create set")
      }

      const newSet = await response.json()

      toast({
        title: "Success",
        description: "Flashcard set created successfully",
      })

      // Update sets list and select the new set
      setSets([...sets, newSet])
      setSelectedSetId(newSet.id)

      // Clear form
      setNewSetTitle("")
      setNewSetDescription("")
    } catch (error) {
      console.error("Error creating set:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create flashcard set",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a flashcard to the current list
  const handleAddFlashcard = () => {
    if (!currentFlashcard.word.trim() || !currentFlashcard.definition.trim()) {
      toast({
        title: "Error",
        description: "Word and definition are required",
        variant: "destructive",
      })
      return
    }

    setFlashcards([...flashcards, { ...currentFlashcard }])
    setCurrentFlashcard({
      word: "",
      definition: "",
      example: "",
    })
  }

  // Remove a flashcard from the current list
  const handleRemoveFlashcard = (index: number) => {
    const updatedFlashcards = [...flashcards]
    updatedFlashcards.splice(index, 1)
    setFlashcards(updatedFlashcards)
  }

  // Process bulk import text
  const handleBulkImport = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some data to import",
        variant: "destructive",
      })
      return
    }

    try {
      let importedFlashcards: Flashcard[] = []

      if (importFormat === "tab") {
        // Process tab-delimited text (word\tdefinition\texample)
        const lines = bulkImportText.split("\n").filter((line) => line.trim())

        importedFlashcards = lines.map((line) => {
          const [word, definition, example] = line.split("\t").map((item) => item?.trim() || "")
          return { word, definition, example }
        })
      } else if (importFormat === "csv") {
        // Process CSV text (word,definition,example)
        const lines = bulkImportText.split("\n").filter((line) => line.trim())

        importedFlashcards = lines.map((line) => {
          const [word, definition, example] = line.split(",").map((item) => item?.trim() || "")
          return { word, definition, example }
        })
      } else if (importFormat === "excel") {
        // Process Excel-style paste (columns separated by tabs)
        const lines = bulkImportText.split("\n").filter((line) => line.trim())

        // Skip header row if it exists
        const dataLines =
          lines[0].toLowerCase().includes("word") && lines[0].toLowerCase().includes("definition")
            ? lines.slice(1)
            : lines

        importedFlashcards = dataLines.map((line) => {
          const [word, definition, example] = line.split("\t").map((item) => item?.trim() || "")
          return { word, definition, example }
        })
      }

      // Filter out invalid entries
      const validFlashcards = importedFlashcards.filter((card) => card.word && card.definition)

      if (validFlashcards.length === 0) {
        toast({
          title: "Error",
          description: "No valid flashcards found in the imported data",
          variant: "destructive",
        })
        return
      }

      // Add to existing flashcards
      setFlashcards([...flashcards, ...validFlashcards])

      toast({
        title: "Success",
        description: `Imported ${validFlashcards.length} flashcards`,
      })

      // Clear the import text
      setBulkImportText("")
    } catch (error) {
      console.error("Error processing bulk import:", error)
      toast({
        title: "Error",
        description: "Failed to process the imported data",
        variant: "destructive",
      })
    }
  }

  // Save all flashcards to the selected set
  const handleSaveFlashcards = async () => {
    if (!selectedSetId) {
      toast({
        title: "Error",
        description: "Please select a flashcard set",
        variant: "destructive",
      })
      return
    }

    if (flashcards.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one flashcard",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      console.log(`Saving ${flashcards.length} flashcards to set ${selectedSetId}`)

      // Save flashcards one by one to better track errors
      const savedFlashcards = []
      const failedFlashcards = []

      for (const flashcard of flashcards) {
        try {
          // Create a minimal payload with only the required fields
          const payload = {
            setId: selectedSetId,
            word: flashcard.word,
            definition: flashcard.definition,
            example: flashcard.example || "",
          }

          console.log("Saving flashcard:", payload)

          const response = await fetch("/api/flashcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("Error response:", errorData)
            failedFlashcards.push({
              flashcard,
              error: errorData.message || "Unknown error",
            })
          } else {
            const responseData = await response.json()
            console.log("Saved flashcard response:", responseData)
            savedFlashcards.push(responseData)
          }
        } catch (error) {
          console.error("Error saving individual flashcard:", error)
          failedFlashcards.push({
            flashcard,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      // Always finish the saving process, even if there are errors
      setIsSubmitting(false)

      if (failedFlashcards.length > 0) {
        console.error(`Failed to save ${failedFlashcards.length} flashcards:`, failedFlashcards)
        toast({
          title: "Partial Success",
          description: `Saved ${savedFlashcards.length} flashcards, but ${failedFlashcards.length} failed.`,
          variant: "destructive",
        })
      } else if (savedFlashcards.length > 0) {
        console.log(`Successfully saved all ${savedFlashcards.length} flashcards`)
        toast({
          title: "Success",
          description: `${savedFlashcards.length} flashcards saved successfully`,
        })

        // Only clear the list if all were saved successfully
        setFlashcards([])

        // Refresh the page after a short delay to show the updated card count
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          title: "Error",
          description: "No flashcards were saved",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in save operation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save flashcards",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Flashcards</h1>
      </div>

      <Tabs defaultValue="create-set" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="create-set">Create Set</TabsTrigger>
          <TabsTrigger value="add-flashcards">Add Flashcards</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="create-set" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Flashcard Set</CardTitle>
                <CardDescription>Create a new set to organize your flashcards</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSet} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Set Title</Label>
                    <Input
                      id="title"
                      value={newSetTitle}
                      onChange={(e) => setNewSetTitle(e.target.value)}
                      placeholder="e.g., Technology Vocabulary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSetDescription}
                      onChange={(e) => setNewSetDescription(e.target.value)}
                      placeholder="Describe what this set contains"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Set"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Sets</CardTitle>
                <CardDescription>Select a set to add flashcards to</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSets ? (
                  <p>Loading sets...</p>
                ) : sets.length === 0 ? (
                  <p className="text-muted-foreground">No flashcard sets found. Create one to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSetId === set.id ? "bg-primary/20" : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => setSelectedSetId(set.id)}
                      >
                        <div className="font-medium">{set.title}</div>
                        {set.description && <div className="text-sm text-muted-foreground">{set.description}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-flashcards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Add Flashcard</CardTitle>
                <CardDescription>Create a new flashcard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="word">Word</Label>
                    <Input
                      id="word"
                      value={currentFlashcard.word}
                      onChange={(e) => setCurrentFlashcard({ ...currentFlashcard, word: e.target.value })}
                      placeholder="Enter word or term"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="definition">Definition</Label>
                    <Textarea
                      id="definition"
                      value={currentFlashcard.definition}
                      onChange={(e) => setCurrentFlashcard({ ...currentFlashcard, definition: e.target.value })}
                      placeholder="Enter definition"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="example">Example (Optional)</Label>
                    <Textarea
                      id="example"
                      value={currentFlashcard.example}
                      onChange={(e) => setCurrentFlashcard({ ...currentFlashcard, example: e.target.value })}
                      placeholder="Enter an example sentence"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleAddFlashcard}
                    disabled={!currentFlashcard.word.trim() || !currentFlashcard.definition.trim()}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to List
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Flashcards to Add</CardTitle>
                <CardDescription>
                  {selectedSetId
                    ? `Adding to: ${sets.find((s) => s.id === selectedSetId)?.title || "Selected Set"}`
                    : "Select a set on the Create Set tab"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flashcards.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No flashcards added yet. Add some using the form.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {flashcards.map((card, index) => (
                      <div key={index} className="p-4 border rounded-md relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveFlashcard(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="font-medium mb-2">{card.word}</div>
                        <div className="text-sm mb-2">{card.definition}</div>
                        {card.example && <div className="text-sm italic text-muted-foreground">{card.example}</div>}
                      </div>
                    ))}

                    <Button
                      onClick={handleSaveFlashcards}
                      disabled={isSubmitting || flashcards.length === 0 || !selectedSetId}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Save All Flashcards"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk-import" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Table className="h-5 w-5 mr-2" />
                  Bulk Import Flashcards
                </CardTitle>
                <CardDescription>Paste data from Excel, CSV, or any tabular format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Import Format</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="format-tab"
                          name="format"
                          checked={importFormat === "tab"}
                          onChange={() => setImportFormat("tab")}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="format-tab">Tab Separated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="format-csv"
                          name="format"
                          checked={importFormat === "csv"}
                          onChange={() => setImportFormat("csv")}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="format-csv">CSV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="format-excel"
                          name="format"
                          checked={importFormat === "excel"}
                          onChange={() => setImportFormat("excel")}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="format-excel">Excel Paste</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-import">Paste your data here</Label>
                    <Textarea
                      id="bulk-import"
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                      placeholder={
                        importFormat === "tab"
                          ? "word\tdefinition\texample"
                          : importFormat === "csv"
                            ? "word,definition,example"
                            : "Word\tDefinition\tExample\nterm1\tmeaning1\texample1"
                      }
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Format Instructions</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Each row should contain a single flashcard</p>
                      <p>• Columns should be: Word, Definition, Example (optional)</p>
                      <p>• You can copy and paste directly from Excel or Google Sheets</p>
                      <p>• Headers will be automatically detected and skipped</p>
                    </div>
                  </div>

                  <Button onClick={handleBulkImport} disabled={!bulkImportText.trim()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Process Import
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Preview</CardTitle>
                <CardDescription>
                  {selectedSetId
                    ? `Adding to: ${sets.find((s) => s.id === selectedSetId)?.title || "Selected Set"}`
                    : "Select a set on the Create Set tab"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flashcards.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No flashcards added yet. Import some using the form.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">Word</th>
                            <th className="px-4 py-2 text-left">Definition</th>
                            <th className="px-4 py-2 text-left">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          {flashcards.slice(0, 5).map((card, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{card.word}</td>
                              <td className="px-4 py-2">{card.definition}</td>
                              <td className="px-4 py-2 italic text-muted-foreground">{card.example || "-"}</td>
                            </tr>
                          ))}
                          {flashcards.length > 5 && (
                            <tr className="border-t">
                              <td colSpan={3} className="px-4 py-2 text-center text-muted-foreground">
                                +{flashcards.length - 5} more flashcards
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Button
                      onClick={handleSaveFlashcards}
                      disabled={isSubmitting || flashcards.length === 0 || !selectedSetId}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Saving..." : `Save ${flashcards.length} Flashcards`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

