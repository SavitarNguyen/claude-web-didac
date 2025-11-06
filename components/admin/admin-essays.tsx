"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Flag, CheckCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock essay data
const mockEssays = [
  {
    id: "1",
    title: "The Impact of Technology",
    user: "John Doe",
    score: 85,
    status: "graded",
    isFlagged: false,
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    title: "Climate Change Solutions",
    user: "Jane Smith",
    score: 92,
    status: "graded",
    isFlagged: false,
    createdAt: "2023-02-20",
  },
  {
    id: "3",
    title: "The Future of Education",
    user: "Sarah Johnson",
    score: null,
    status: "pending",
    isFlagged: true,
    createdAt: "2023-03-05",
  },
  {
    id: "4",
    title: "Artificial Intelligence Ethics",
    user: "Michael Brown",
    score: 78,
    status: "graded",
    isFlagged: false,
    createdAt: "2023-04-12",
  },
  {
    id: "5",
    title: "Global Economic Challenges",
    user: "Emily Wilson",
    score: 88,
    status: "graded",
    isFlagged: true,
    createdAt: "2023-05-18",
  },
]

export function AdminEssays() {
  const [searchTerm, setSearchTerm] = useState("")
  const [essays, setEssays] = useState(mockEssays)

  const filteredEssays = essays.filter(
    (essay) =>
      essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      essay.user.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search essays..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full md:w-auto">
          <Flag className="mr-2 h-4 w-4" />
          View Flagged Essays
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Essays</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEssays.map((essay) => (
                <TableRow key={essay.id}>
                  <TableCell className="font-medium">
                    {essay.title}
                    {essay.isFlagged && (
                      <Badge variant="destructive" className="ml-2">
                        Flagged
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{essay.user}</TableCell>
                  <TableCell>{essay.score !== null ? `${essay.score}/100` : "Pending"}</TableCell>
                  <TableCell>
                    <Badge variant={essay.status === "graded" ? "success" : "outline"}>{essay.status}</Badge>
                  </TableCell>
                  <TableCell>{essay.createdAt}</TableCell>
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Essay
                        </DropdownMenuItem>
                        {essay.status === "pending" && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Grade Manually
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Flag className="mr-2 h-4 w-4" />
                          {essay.isFlagged ? "Remove Flag" : "Flag Essay"}
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

