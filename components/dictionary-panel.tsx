"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volume2, X, BookOpen, Bookmark, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface DictionaryPanelProps {
  word: string
  onClose: () => void
  onSave?: (word: string) => void
}

export function DictionaryPanel({ word, onClose, onSave }: DictionaryPanelProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSet, setSelectedSet] = useState("")
  const [flashcardSets, setFlashcardSets] = useState([
    { id: "set1", title: "My Vocabulary" },
    { id: "set2", title: "IELTS Words" },
    { id: "set3", title: "Academic Terms" },
  ])

  // Simulate API call
  useEffect(() => {
    setLoading(true)

    // In a real app, this would be an API call to a dictionary service
    const timer = setTimeout(() => {
      setData({
        word: word,
        phonetic: "/ɪˈfɛm(ə)r(ə)l/",
        meanings: [
          {
            partOfSpeech: "adjective",
            definitions: [
              {
                definition: "Lasting for a very short time.",
                example: `The ${word} beauty of cherry blossoms only lasts a few days.`,
                synonyms: ["fleeting", "transitory", "transient", "momentary"],
                antonyms: ["permanent", "enduring", "lasting"],
              },
              {
                definition: "Lasting or used for only one day.",
                example: `${word} creeks and waterholes can be found in the desert after rain.`,
                synonyms: ["daily", "diurnal"],
                antonyms: ["eternal", "everlasting"],
              },
            ],
          },
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: `An ${word} plant.`,
                example: `Desert ${word}s are plants that complete their life cycle in a very short time.`,
                synonyms: [],
                antonyms: [],
              },
            ],
          },
        ],
        phonetics: [
          {
            text: "/ɪˈfɛm(ə)r(ə)l/",
            audio: "https://example.com/audio.mp3",
          },
        ],
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [word])

  const handleSaveWord = () => {
    if (onSave) {
      onSave(word)
    }
    toast({
      title: "Word Saved",
      description: `"${word}" has been added to your saved words.`,
    })
  }

  const handleAddToFlashcards = () => {
    setShowAddDialog(true)
  }

  const handleCreateFlashcard = () => {
    toast({
      title: "Flashcard Created",
      description: `"${word}" has been added to ${selectedSet || "your flashcards"}.`,
    })
    setShowAddDialog(false)
  }

  const playAudio = () => {
    // In a real app, this would play the audio from the API
    const utterance = new SpeechSynthesisUtterance(word)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BookOpen className="h-5 w-5 text-primary mr-2" />
          Dictionary
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-primary-foreground">{data.word}</h3>
                <p className="text-sm text-muted-foreground">{data.phonetic}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={playAudio}>
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            <Tabs defaultValue="definitions" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="definitions">Definitions</TabsTrigger>
                <TabsTrigger value="synonyms">Synonyms</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="definitions" className="mt-4 space-y-4">
                {data.meanings.map((meaning, index) => (
                  <div key={index}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{meaning.partOfSpeech}</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {meaning.definitions.map((def, i) => (
                        <li key={i} className="text-sm">
                          {def.definition}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="synonyms" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {data.meanings.flatMap((meaning) =>
                    meaning.definitions.flatMap((def) =>
                      def.synonyms.map((synonym, i) => (
                        <div key={i} className="px-3 py-1 bg-primary/10 text-primary-foreground rounded-full text-sm">
                          {synonym}
                        </div>
                      )),
                    ),
                  )}
                  {data.meanings.flatMap((meaning) => meaning.definitions.flatMap((def) => def.synonyms)).length ===
                    0 && <p className="text-sm text-muted-foreground">No synonyms found for this word.</p>}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-4 space-y-3">
                {data.meanings.flatMap((meaning) =>
                  meaning.definitions.map((def, i) =>
                    def.example ? (
                      <div key={i} className="text-sm italic border-l-2 border-primary pl-3 py-1">
                        "{def.example}"
                      </div>
                    ) : null,
                  ),
                )}
                {data.meanings.flatMap((meaning) => meaning.definitions.filter((def) => def.example)).length === 0 && (
                  <p className="text-sm text-muted-foreground">No examples found for this word.</p>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleSaveWord}>
                <Bookmark className="h-4 w-4" />
                Save to Vocabulary
              </Button>
              <Button size="sm" className="flex items-center gap-1" onClick={handleAddToFlashcards}>
                <Plus className="h-4 w-4" />
                Add to Flashcards
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Dialog for adding to flashcards */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Flashcards</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Flashcard Set</Label>
              <select
                className="w-full p-2 border border-input rounded-md"
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
              >
                <option value="">Select a set...</option>
                {flashcardSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Word</Label>
              <Input value={word} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Definition</Label>
              <Textarea defaultValue={data?.meanings[0]?.definitions[0]?.definition || ""} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Example</Label>
              <Textarea defaultValue={data?.meanings[0]?.definitions[0]?.example || ""} rows={2} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFlashcard}>Add to Flashcards</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

