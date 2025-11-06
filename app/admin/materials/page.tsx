"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Upload, BookOpen, Pencil, Save } from "lucide-react"

export default function MaterialsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Flashcard state
  const [flashcardWord, setFlashcardWord] = useState("")
  const [flashcardDefinition, setFlashcardDefinition] = useState("")
  const [flashcardExample, setFlashcardExample] = useState("")
  const [flashcardCategory, setFlashcardCategory] = useState("")
  const [flashcardTags, setFlashcardTags] = useState("")

  // Essay assignment state
  const [essayTitle, setEssayTitle] = useState("")
  const [essayPrompt, setEssayPrompt] = useState("")
  const [essayDueDate, setEssayDueDate] = useState("")
  const [essayInstructions, setEssayInstructions] = useState("")

  const handleFlashcardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: flashcardWord,
          definition: flashcardDefinition,
          example: flashcardExample,
          category: flashcardCategory,
          tags: flashcardTags.split(",").map((tag) => tag.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create flashcard")
      }

      toast({
        title: "Success",
        description: "Flashcard created successfully",
      })

      // Reset form
      setFlashcardWord("")
      setFlashcardDefinition("")
      setFlashcardExample("")
      setFlashcardCategory("")
      setFlashcardTags("")
    } catch (error) {
      console.error("Error creating flashcard:", error)
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEssayAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: essayTitle,
          prompt: essayPrompt,
          dueDate: essayDueDate,
          instructions: essayInstructions,
          type: "essay",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create essay assignment")
      }

      toast({
        title: "Success",
        description: "Essay assignment created successfully",
      })

      // Reset form
      setEssayTitle("")
      setEssayPrompt("")
      setEssayDueDate("")
      setEssayInstructions("")
    } catch (error) {
      console.error("Error creating essay assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create essay assignment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teaching Materials</h1>
          <p className="text-muted-foreground">Create and manage learning materials for your students</p>
        </div>
      </div>

      <Tabs defaultValue="flashcards" className="mb-8">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="essays">Essay Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Create New Flashcard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFlashcardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="word">Word or Phrase</Label>
                      <Input
                        id="word"
                        value={flashcardWord}
                        onChange={(e) => setFlashcardWord(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="definition">Definition</Label>
                      <Textarea
                        id="definition"
                        value={flashcardDefinition}
                        onChange={(e) => setFlashcardDefinition(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="example">Example Sentence</Label>
                      <Textarea
                        id="example"
                        value={flashcardExample}
                        onChange={(e) => setFlashcardExample(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={flashcardCategory}
                          onChange={(e) => setFlashcardCategory(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          value={flashcardTags}
                          onChange={(e) => setFlashcardTags(e.target.value)}
                          placeholder="e.g. noun, academic, business"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="active:scale-95 transition-transform" disabled={isSubmitting}>
                        <Plus className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Creating..." : "Create Flashcard"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Upload</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Upload multiple flashcards at once using a CSV file.</p>

                  <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Drop your CSV file here</p>
                    <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                    <Input type="file" className="hidden" id="csv-upload" accept=".csv" />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("csv-upload")?.click()}
                      className="active:scale-95 transition-transform"
                    >
                      Select File
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">CSV Format</h3>
                    <p className="text-xs text-muted-foreground">
                      Your CSV should have the following columns: word, definition, example, category, tags
                    </p>
                  </div>

                  <Button variant="outline" className="w-full active:scale-95 transition-transform">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Process
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="essays" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pencil className="mr-2 h-5 w-5" />
                    Create Essay Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEssayAssignmentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="essay-title">Assignment Title</Label>
                      <Input
                        id="essay-title"
                        value={essayTitle}
                        onChange={(e) => setEssayTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="essay-prompt">Essay Prompt</Label>
                      <Textarea
                        id="essay-prompt"
                        value={essayPrompt}
                        onChange={(e) => setEssayPrompt(e.target.value)}
                        required
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="essay-instructions">Additional Instructions</Label>
                      <Textarea
                        id="essay-instructions"
                        value={essayInstructions}
                        onChange={(e) => setEssayInstructions(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={essayDueDate}
                        onChange={(e) => setEssayDueDate(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="active:scale-95 transition-transform" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Creating..." : "Create Assignment"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Effective Essay Prompts</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Be clear and specific about the task</li>
                      <li>Provide context for the topic</li>
                      <li>Indicate the expected length</li>
                      <li>Specify any required sources or research</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">IELTS-Style Prompts</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Present a clear statement or question</li>
                      <li>Ask for opinions supported by examples</li>
                      <li>Request discussion of advantages/disadvantages</li>
                      <li>Suggest a word count of 250-300 words</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

