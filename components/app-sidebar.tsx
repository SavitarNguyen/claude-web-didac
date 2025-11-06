"use client"

import { BookOpen, Home, Pencil, Mic, BarChart, Settings, LogOut, Moon, Sun, Shield, Smartphone, FileText, Library } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  // Fix for hydration issues and to ensure the sidebar renders properly on all browsers
  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Flashcards",
      icon: BookOpen,
      href: "/flashcards",
    },
    {
      title: "Essay Writing",
      icon: Pencil,
      href: "/essay",
    },
    {
      title: "IELTS Essay",
      icon: FileText,
      href: "/ielts-essay",
    },
    {
      title: "My Essays",
      icon: Library,
      href: "/my-essays",
    },
    {
      title: "Speaking Practice",
      icon: Mic,
      href: "/speaking",
    },
    {
      title: "Progress",
      icon: BarChart,
      href: "/progress",
    },
    {
      title: "Mobile Apps",
      icon: Smartphone,
      href: "/mobile",
    },
  ]

  // Admin menu item
  if (session?.user?.role === "admin" || session?.user?.role === "teacher") {
    menuItems.push(
      {
        title: "Admin",
        icon: Shield,
        href: "/admin",
      },
      {
        title: "Content Management",
        icon: BookOpen,
        href: "/admin/content",
      },
    )
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  return (
    <Sidebar
      variant={isMobile ? "floating" : "sidebar"}
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="z-50" // Ensure sidebar has a high z-index
    >
      <SidebarHeader className="flex flex-col items-center justify-center py-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">CuteVocabLMS</h1>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <a href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={session?.user?.image || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{session?.user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.role || "student"}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full active:scale-95 transition-transform"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full active:scale-95 transition-transform">
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full active:scale-95 transition-transform"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

