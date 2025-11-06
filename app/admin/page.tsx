import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminFlashcards } from "@/components/admin/admin-flashcards"
import { AdminEssays } from "@/components/admin/admin-essays"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, content, and system settings</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <AdminUsers />
        </TabsContent>

        <TabsContent value="flashcards" className="mt-6">
          <AdminFlashcards />
        </TabsContent>

        <TabsContent value="essays" className="mt-6">
          <AdminEssays />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <div className="text-center py-8">
            <p>Materials management coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

