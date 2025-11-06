"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, BookOpen, Plus } from "lucide-react"
import { FlashcardSets } from "@/components/flashcards/flashcard-sets"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function FlashcardsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("browse")
  const { data: session } = useSession()

  // Check if user is admin or teacher
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "teacher"

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground">Learn and review vocabulary with interactive flashcards</p>
        </div>
        <div className="mt-4 md:mt-0 relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flashcard sets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="browse">Browse Sets</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <FlashcardSets />
        </TabsContent>

        <TabsContent value="study" className="mt-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center h-64">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a set to study</h3>
            <p className="text-muted-foreground mb-4">Choose a flashcard set from the Browse tab to start studying</p>
            <Button onClick={() => setActiveTab("browse")}>Browse Sets</Button>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center h-64">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Create your own flashcards</h3>
            {isAdmin ? (
              <>
                <p className="text-muted-foreground mb-4">Create custom flashcard sets for your students.</p>
                <Link href="/admin/flashcards/create">
                  <Button>Create Flashcards</Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  Coming soon! Create custom flashcard sets for your studies.
                </p>
                <Button disabled>Create Set</Button>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

