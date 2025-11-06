import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { appConfig } from "@/app.config"
import Image from "next/image"

export default function MobilePage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Get CuteVocabLMS on Your Mobile Device</h1>
        <p className="text-muted-foreground max-w-2xl">
          Take your vocabulary learning on the go with our native mobile apps for iOS and Android. Study flashcards,
          practice speaking, and track your progress anywhere, anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 mr-2 text-primary" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.52 1.54-1.19 3.05-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              iOS App
            </CardTitle>
            <CardDescription>Download from the App Store for iPhone and iPad</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-full h-64 mb-6">
              <Image
                src="/placeholder.svg?height=256&width=128"
                alt="iOS App Screenshot"
                fill
                className="object-contain"
              />
            </div>
            <Button asChild size="lg" className="w-full">
              <a href={appConfig.mobileAppLinks.ios} target="_blank" rel="noopener noreferrer">
                Download for iOS
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 mr-2 text-primary" fill="currentColor">
                <path d="M17.523 15.34l-.748-1.28.003-.003c1.133-2.068 1.806-4.813 1.806-7.544 0-.92-.088-1.632-.23-2.085-.144-.46-.332-.734-.484-.833-.15-.1-.371-.147-.526-.147-1.041 0-2.291.443-3.585 1.058-1.244.59-2.485 1.33-3.225 1.883-.74-.554-1.982-1.293-3.225-1.883C6.289 3.743 5.04 3.3 4 3.3c-.155 0-.376.047-.526.147-.152.099-.34.373-.484.833-.142.453-.23 1.164-.23 2.085 0 2.731.673 5.476 1.806 7.544l.003.003-.748 1.28c-.112.191-.247.43-.306.649-.067.25-.199.895.057 1.535.285.71 1.001 1.516 2.448 1.618 1.597.112 2.958-.749 4.07-1.519.593-.411 1.193-.826 1.63-1.087l.65.003.65-.003c.437.261 1.037.676 1.63 1.087 1.111.77 2.473 1.63 4.07 1.519 1.447-.102 2.163-.908 2.448-1.618.256-.64.124-1.285.057-1.535-.059-.219-.194-.458-.306-.649z" />
              </svg>
              Android App
            </CardTitle>
            <CardDescription>Download from the Google Play Store for Android devices</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-full h-64 mb-6">
              <Image
                src="/placeholder.svg?height=256&width=128"
                alt="Android App Screenshot"
                fill
                className="object-contain"
              />
            </div>
            <Button asChild size="lg" className="w-full">
              <a href={appConfig.mobileAppLinks.android} target="_blank" rel="noopener noreferrer">
                Download for Android
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Study Anywhere</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access your flashcards and learning materials offline. Study on the go, even without an internet
              connection.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get reminders for your study sessions and notifications about your progress to stay motivated.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Sync Across Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your progress syncs automatically between web and mobile. Start on one device and continue on another.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

