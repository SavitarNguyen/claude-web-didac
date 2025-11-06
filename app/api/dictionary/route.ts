import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const word = searchParams.get("word")

    if (!word) {
      return NextResponse.json({ message: "Word parameter is required" }, { status: 400 })
    }

    // In a real app, this would call a dictionary API
    // For now, we'll return mock data
    const mockData = {
      word: word,
      phonetic: "/ɪˈfɛm(ə)r(ə)l/",
      meanings: [
        {
          partOfSpeech: "adjective",
          definitions: [
            {
              definition: "Lasting for a very short time.",
              example: `The ${word} beauty of cherry blossoms only lasts a few days.`,
              synonyms: ["fleeting", "transitory", "transient", "momentary"],
              antonyms: ["permanent", "enduring", "lasting"],
            },
            {
              definition: "Lasting or used for only one day.",
              example: `${word} creeks and waterholes can be found in the desert after rain.`,
              synonyms: ["daily", "diurnal"],
              antonyms: ["eternal", "everlasting"],
            },
          ],
        },
        {
          partOfSpeech: "noun",
          definitions: [
            {
              definition: `An ${word} plant.`,
              example: `Desert ${word}s are plants that complete their life cycle in a very short time.`,
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
      phonetics: [
        {
          text: "/ɪˈfɛm(ə)r(ə)l/",
          audio: "https://example.com/audio.mp3",
        },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching dictionary data:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

