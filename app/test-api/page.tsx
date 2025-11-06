"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestApiPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/test")
      const data = await response.json()

      setTestResult(data)
    } catch (err) {
      console.error("API test error:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Basic API</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testApi} disabled={loading}>
            {loading ? "Testing..." : "Test API"}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Environment variables:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set"}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set"}</li>
          </ul>

          <Button onClick={() => (window.location.href = "/api/flashcards/sets")}>Direct API Access</Button>
        </CardContent>
      </Card>
    </div>
  )
}

