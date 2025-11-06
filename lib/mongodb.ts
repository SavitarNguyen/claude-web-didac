import { createServerClient } from "./supabase-server"

// This is a compatibility layer to provide the same interface as the MongoDB client
// but using Supabase instead

const clientPromise = {
  // This is a mock object that provides the same interface as the MongoDB client
  // but uses Supabase under the hood
  db: () => {
    const supabase = createServerClient()

    return {
      collection: (collectionName: string) => {
        return {
          find: (query: any = {}) => {
            // Convert MongoDB query to Supabase query
            const supabaseQuery = supabase.from(collectionName).select("*")

            // Apply filters if they exist
            Object.entries(query).forEach(([key, value]) => {
              if (key === "_id") {
                supabaseQuery.eq("id", value)
              } else {
                supabaseQuery.eq(key, value)
              }
            })

            return {
              limit: (limit: number) => {
                return {
                  sort: (sort: any) => {
                    // Apply sorting
                    if (sort.createdAt === -1) {
                      supabaseQuery.order("created_at", { ascending: false })
                    }

                    return {
                      toArray: async () => {
                        const { data, error } = await supabaseQuery.limit(limit)
                        if (error) throw error
                        return data || []
                      },
                    }
                  },
                }
              },
            }
          },
          findOne: async (query: any = {}) => {
            // Convert MongoDB query to Supabase query
            const supabaseQuery = supabase.from(collectionName).select("*")

            // Apply filters if they exist
            Object.entries(query).forEach(([key, value]) => {
              if (key === "_id") {
                supabaseQuery.eq("id", value)
              } else {
                supabaseQuery.eq(key, value)
              }
            })

            const { data, error } = await supabaseQuery.single()
            if (error && error.code !== "PGRST116") throw error
            return data
          },
          insertOne: async (doc: any) => {
            // Convert MongoDB document to Supabase document
            const supabaseDoc = { ...doc }

            // Convert _id to id if it exists
            if (supabaseDoc._id) {
              supabaseDoc.id = supabaseDoc._id
              delete supabaseDoc._id
            }

            // Convert createdAt and updatedAt to created_at and updated_at
            if (supabaseDoc.createdAt) {
              supabaseDoc.created_at = supabaseDoc.createdAt
              delete supabaseDoc.createdAt
            }

            if (supabaseDoc.updatedAt) {
              supabaseDoc.updated_at = supabaseDoc.updatedAt
              delete supabaseDoc.updatedAt
            }

            // Convert userId to user_id
            if (supabaseDoc.userId) {
              supabaseDoc.user_id = supabaseDoc.userId
              delete supabaseDoc.userId
            }

            const { data, error } = await supabase.from(collectionName).insert(supabaseDoc).select()
            if (error) throw error

            return {
              insertedId: data?.[0]?.id,
            }
          },
          updateOne: async (query: any, update: any) => {
            // Convert MongoDB query to Supabase query
            const supabaseQuery = supabase.from(collectionName)

            // Apply filters if they exist
            Object.entries(query).forEach(([key, value]) => {
              if (key === "_id") {
                supabaseQuery.eq("id", value)
              } else {
                supabaseQuery.eq(key, value)
              }
            })

            // Convert MongoDB update to Supabase update
            const supabaseUpdate = { ...update.$set }

            // Convert createdAt and updatedAt to created_at and updated_at
            if (supabaseUpdate.createdAt) {
              supabaseUpdate.created_at = supabaseUpdate.createdAt
              delete supabaseUpdate.createdAt
            }

            if (supabaseUpdate.updatedAt) {
              supabaseUpdate.updated_at = supabaseUpdate.updatedAt
              delete supabaseUpdate.updatedAt
            }

            // Convert userId to user_id
            if (supabaseUpdate.userId) {
              supabaseUpdate.user_id = supabaseUpdate.userId
              delete supabaseUpdate.userId
            }

            const { data, error } = await supabaseQuery.update(supabaseUpdate)
            if (error) throw error

            return {
              modifiedCount: data ? 1 : 0,
            }
          },
          deleteOne: async (query: any) => {
            // Convert MongoDB query to Supabase query
            const supabaseQuery = supabase.from(collectionName)

            // Apply filters if they exist
            Object.entries(query).forEach(([key, value]) => {
              if (key === "_id") {
                supabaseQuery.eq("id", value)
              } else {
                supabaseQuery.eq(key, value)
              }
            })

            const { error } = await supabaseQuery.delete()
            if (error) throw error

            return {
              deletedCount: 1,
            }
          },
        }
      },
    }
  },
}

export default clientPromise

