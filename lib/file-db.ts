import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define the base directory for our file-based database
const DB_DIR = path.join(process.cwd(), "db")

// Ensure the DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Create collections if they don't exist
const collections = ["users", "flashcards", "essays", "speakingPractices", "progress"]

collections.forEach((collection) => {
  const collectionPath = path.join(DB_DIR, `${collection}.json`)
  if (!fs.existsSync(collectionPath)) {
    fs.writeFileSync(collectionPath, JSON.stringify([]))
  }
})

// Generic function to get all items from a collection
export async function getAll(collection: string) {
  const filePath = path.join(DB_DIR, `${collection}.json`)
  const data = fs.readFileSync(filePath, "utf8")
  return JSON.parse(data)
}

// Generic function to get an item by ID
export async function getById(collection: string, id: string) {
  const items = await getAll(collection)
  return items.find((item: any) => item.id === id)
}

// Generic function to get items by a field value
export async function getByField(collection: string, field: string, value: any) {
  const items = await getAll(collection)
  return items.filter((item: any) => item[field] === value)
}

// Generic function to create an item
export async function create(collection: string, data: any) {
  const items = await getAll(collection)
  const id = uuidv4()
  const now = new Date()

  const newItem = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  items.push(newItem)

  const filePath = path.join(DB_DIR, `${collection}.json`)
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2))

  return newItem
}

// Generic function to update an item
export async function update(collection: string, id: string, data: any) {
  const items = await getAll(collection)
  const index = items.findIndex((item: any) => item.id === id)

  if (index === -1) {
    return null
  }

  const now = new Date()
  items[index] = {
    ...items[index],
    ...data,
    updatedAt: now,
  }

  const filePath = path.join(DB_DIR, `${collection}.json`)
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2))

  return items[index]
}

// Generic function to delete an item
export async function remove(collection: string, id: string) {
  const items = await getAll(collection)
  const filteredItems = items.filter((item: any) => item.id !== id)

  const filePath = path.join(DB_DIR, `${collection}.json`)
  fs.writeFileSync(filePath, JSON.stringify(filteredItems, null, 2))

  return { success: true }
}

