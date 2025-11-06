"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, MoreHorizontal, Upload } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock flashcard data
const mockFlashcards = [
  {
    id: "1",
    word: "Ephemeral",
    definition: "Lasting for a very short time",
    category: "Academic",
    tags: ["adjective", "time"],
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    category: "Academic",
    tags: ["adjective", "space"],
    createdAt: "2023-02-20",
  },
  {
    id: "3",
    word: "Serendipity",
    definition: "The occurrence of events by chance in a happy or beneficial way",
    category: "General",
    tags: ["noun", "event"],
    createdAt: "2022-12-10",
  },
  {
    id: "4",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    category: "Academic",
    tags: ["adjective", "communication"],
    createdAt: "2023-03-05",
  },
  {
    id: "5",
    word: "Resilient",
    definition: "Able to withstand or recover quickly from difficult conditions",
    category: "General",
    tags: ["adjective", "character"],
    createdAt: "2023-04-12",
  },
]

export function AdminFlashcards() {
  const [searchTerm, setSearchTerm] = useState("")
  const [flashcards, setFlashcards] = useState(mockFlashcards)

  const filteredFlashcards = flashcards.filter(
    (flashcard) =>
      flashcard.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flashcard.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flashcard.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flashcards..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button className="flex-1 md:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Add Flashcard
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlashcards.map((flashcard) => (
                <TableRow key={flashcard.id}>
                  <TableCell className="font-medium">{flashcard.word}</TableCell>
                  <TableCell>
                    {flashcard.definition.length > 50
                      ? `${flashcard.definition.substring(0, 50)}...`
                      : flashcard.definition}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{flashcard.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {flashcard.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{flashcard.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

