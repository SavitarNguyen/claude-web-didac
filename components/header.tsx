"use client"

import { useState } from "react"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { BookOpen, Bell } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AuthDialog } from "./auth-dialog"

export function Header() {
  const { data: session } = useSession()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MobileNav />
        <div className="mr-4 hidden md:flex">
          <a href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold">CuteVocabLMS</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ThemeToggle />
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || "/placeholder.svg?height=32&width=32"}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <a href="/profile" className="flex w-full">
                      Profile
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/settings" className="flex w-full">
                      Settings
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Authentication</DialogTitle>
                      <DialogDescription>Sign in to save your progress and access all features.</DialogDescription>
                    </DialogHeader>
                    <AuthDialog onClose={() => setAuthDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm">
                  Continue as Guest
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

