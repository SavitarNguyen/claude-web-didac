export const appConfig = {
  name: "didac",
  description: "An intelligent learning management system",
  url: "https://didac.com",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.didac.com",
  mobileAppLinks: {
    android: "https://play.google.com/store/apps/details?id=com.didac",
    ios: "https://apps.apple.com/app/didac/id1234567890",
  },
  features: {
    flashcards: true,
    essays: true,
    speaking: true,
    progress: true,
    admin: true,
    dictionary: true,
  },
  version: "1.0.0",
}

