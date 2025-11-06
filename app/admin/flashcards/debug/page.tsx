"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FlashcardDebugPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [debugData, setDebugData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/debug/flashcard-creation")

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      console.error("Error fetching debug data:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Flashcard System Debug</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDebugData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-300">
          <CardContent className="pt-6">
            <div className="text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {loading && !error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
            <p>Loading debug information...</p>
          </div>
        </div>
      ) : debugData ? (
        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schema">Database Schema</TabsTrigger>
            <TabsTrigger value="samples">Sample Data</TabsTrigger>
            <TabsTrigger value="test">Test Insert</TabsTrigger>
            <TabsTrigger value="session">Session Info</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Table Schema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[600px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Table</th>
                        <th className="border p-2 text-left">Column</th>
                        <th className="border p-2 text-left">Type</th>
                        <th className="border p-2 text-left">Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.schema.tables?.map((col: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="border p-2">{col.table_name}</td>
                          <td className="border p-2">{col.column_name}</td>
                          <td className="border p-2">{col.data_type}</td>
                          <td className="border p-2">{col.is_nullable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>RLS Policies</CardTitle>
              </CardHeader>
              <CardContent>
                {typeof debugData.schema.policies === "string" ? (
                  <div className="text-red-500">{debugData.schema.policies}</div>
                ) : (
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left">Table</th>
                          <th className="border p-2 text-left">Policy</th>
                          <th className="border p-2 text-left">Action</th>
                          <th className="border p-2 text-left">Roles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugData.schema.policies?.map((policy: any, i: number) => (
                          <tr key={i} className="border-b">
                            <td className="border p-2">{policy.table_name}</td>
                            <td className="border p-2">{policy.policy_name}</td>
                            <td className="border p-2">{policy.action}</td>
                            <td className="border p-2">{policy.roles}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="samples" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sample Flashcard Set</CardTitle>
                </CardHeader>
                <CardContent>
                  {debugData.samples.setError ? (
                    <div className="text-red-500">Error: {JSON.stringify(debugData.samples.setError)}</div>
                  ) : debugData.samples.set ? (
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                      {JSON.stringify(debugData.samples.set, null, 2)}
                    </pre>
                  ) : (
                    <div>No flashcard sets found</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sample Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  {debugData.samples.cardsError ? (
                    <div className="text-red-500">Error: {JSON.stringify(debugData.samples.cardsError)}</div>
                  ) : debugData.samples.cards && debugData.samples.cards.length > 0 ? (
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                      {JSON.stringify(debugData.samples.cards, null, 2)}
                    </pre>
                  ) : (
                    <div>No flashcards found</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Insert Result</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.testInsert.error ? (
                  <div>
                    <div className="text-red-500 font-bold mb-2">Error occurred during test insert:</div>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                      {JSON.stringify(debugData.testInsert.error, null, 2)}
                    </pre>
                  </div>
                ) : debugData.testInsert.result ? (
                  <div>
                    <div className="text-green-500 font-bold mb-2">Test insert successful!</div>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                      {JSON.stringify(debugData.testInsert.result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>No test insert was performed</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                  {JSON.stringify(debugData.session, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}

