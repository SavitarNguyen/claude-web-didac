"use client"

import { BookOpen, Home, Pencil, Mic, BarChart, Settings, LogOut, Moon, Sun, Shield, Smartphone, FileText, Library, ChevronDown, PenTool, FolderOpen, BookMarked } from "lucide-react"
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

  const [ieltsExpanded, setIeltsExpanded] = useState(true)

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
      title: "My Vocabulary",
      icon: BookMarked,
      href: "/my-vocabulary",
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

  const ieltsEssayItems = [
    {
      title: "Write an Essay",
      icon: PenTool,
      href: "/ielts-essay",
    },
    {
      title: "My Essays",
      icon: Library,
      href: "/ielts-essay/my-essays",
    },
    {
      title: "Resources",
      icon: FolderOpen,
      href: "/ielts-essay/resources",
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
        <div className="flex items-center overflow-hidden h-20">
          <img src="/didac-logo.png" alt="didac" className="h-64 object-cover object-center" style={{ transform: 'scale(1.5)', transformOrigin: 'center' }} />
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

              {/* IELTS Essay Collapsible Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIeltsExpanded(!ieltsExpanded)}
                  tooltip="IELTS Essay"
                  className="w-full justify-between"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>IELTS Essay</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${ieltsExpanded ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
              </SidebarMenuItem>

              {ieltsExpanded && ieltsEssayItems.map((item) => (
                <SidebarMenuItem key={item.title} className="pl-4">
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
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

