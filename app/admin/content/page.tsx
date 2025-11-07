"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Search, Users, CheckCircle, XCircle } from "lucide-react"
import { importVocabulary } from "@/app/actions/vocabulary-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ContentManagementPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [importFormat, setImportFormat] = useState<"tab" | "dash" | "semicolon" | "newline">("tab")
  const [importContent, setImportContent] = useState("")
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin" && session?.user?.role !== "teacher") {
        redirect("/")
      }
      loadStudents()
    } else if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status, session])

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/admin/students")
      const data = await response.json()

      // Handle error response
      if (data.error || !Array.isArray(data)) {
        console.error("Error loading students:", data.error || "Invalid response")
        setStudents([])
        return
      }

      setStudents(data)
    } catch (error) {
      console.error("Error loading students:", error)
      setStudents([])
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    try {
      setIsLoading(true)
      const result = await importVocabulary(importContent, importFormat)
      toast({
        title: "Success",
        description: `Imported ${result.count} vocabulary items`,
      })
      setImportContent("")
    } catch (error) {
      console.error("Error importing vocabulary:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import vocabulary",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Create and manage learning materials</p>
        </div>
      </div>

      <Tabs defaultValue="vocabulary" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4">
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="speaking">Speaking</TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Import Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Import Format</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="formatTab"
                        name="format"
                        checked={importFormat === "tab"}
                        onChange={() => setImportFormat("tab")}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="formatTab">Tab Separated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="formatDash"
                        name="format"
                        checked={importFormat === "dash"}
                        onChange={() => setImportFormat("dash")}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="formatDash">Word - Definition</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="formatSemicolon"
                        name="format"
                        checked={importFormat === "semicolon"}
                        onChange={() => setImportFormat("semicolon")}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="formatSemicolon">Semicolon Separated</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Paste Vocabulary</Label>
                  <Textarea
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                    placeholder={
                      importFormat === "tab"
                        ? "word\tdefinition\texample"
                        : importFormat === "dash"
                          ? "word - definition\nexample;\nword - definition\nexample"
                          : importFormat === "semicolon"
                            ? "word\ndefinition\nexample;\nword\ndefinition\nexample"
                            : "word\ndefinition\nexample"
                    }
                    className="min-h-[200px] font-mono"
                  />
                </div>

                <Button onClick={handleImport} disabled={isLoading || !importContent.trim()} className="w-full">
                  {isLoading ? "Importing..." : "Import Vocabulary"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {students.map((student) => (
                      <Button
                        key={student.id}
                        variant="ghost"
                        className={`w-full justify-start ${selectedStudent?.id === student.id ? "bg-primary/10" : ""}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                            {student.name[0]}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-sm font-medium mb-2">Vocabulary Progress</div>
                        <div className="text-2xl font-bold mb-1">{selectedStudent.progress.wordsLearned}</div>
                        <div className="text-xs text-muted-foreground">Words mastered</div>
                      </div>
                      <div className="p-4 bg-secondary/10 rounded-lg">
                        <div className="text-sm font-medium mb-2">Study Time</div>
                        <div className="text-2xl font-bold mb-1">
                          {formatTime(selectedStudent.progress.studyTimeMinutes)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total study time</div>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-lg">
                        <div className="text-sm font-medium mb-2">Study Streak</div>
                        <div className="text-2xl font-bold mb-1">{selectedStudent.progress.streak}</div>
                        <div className="text-xs text-muted-foreground">Days in a row</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedStudent.recentActivity.map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell>{activity.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {activity.status === "completed" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                  )}
                                  <span className="capitalize">{activity.status}</span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(activity.date)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a student to view their progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="essays" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Essay Prompts</CardTitle>
            </CardHeader>
            <CardContent>{/* Essay management content */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speaking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Speaking Materials</CardTitle>
            </CardHeader>
            <CardContent>{/* Speaking materials management content */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

