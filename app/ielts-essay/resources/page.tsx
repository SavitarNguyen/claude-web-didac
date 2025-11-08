"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">IELTS Essay Resources</h1>
        <p className="text-muted-foreground">
          Study materials, vocabulary guides, and essay writing tips
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FolderOpen className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            We're working on bringing you comprehensive IELTS essay resources including:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Topic-specific vocabulary lists</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Grammar structure guides</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Sample essays with analysis</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Writing tips and strategies</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Common mistakes to avoid</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
