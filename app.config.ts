export const appConfig = {
  name: "CuteVocabLMS",
  description: "A cute vocabulary learning management system",
  url: "https://cutevocablms.com",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.cutevocablms.com",
  mobileAppLinks: {
    android: "https://play.google.com/store/apps/details?id=com.cutevocablms",
    ios: "https://apps.apple.com/app/cutevocablms/id1234567890",
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

