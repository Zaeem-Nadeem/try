import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

// This is a server-side API route that can use the service role key
// to perform privileged operations like creating storage buckets

export async function POST() {
  try {
    // Check if the buckets already exist
    const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const bucketsToCreate = [
      {
        name: "glasses-store",
        public: true,
        bucketExists: buckets?.some((bucket) => bucket.name === "glasses-store") || false,
      },
      {
        name: "3d-models",
        public: true,
        bucketExists: buckets?.some((bucket) => bucket.name === "3d-models") || false,
      },
    ]

    const results = await Promise.all(
      bucketsToCreate.map(async (bucket) => {
        if (bucket.bucketExists) {
          return { name: bucket.name, status: "already_exists" }
        }

        // Create the bucket
        const { error } = await supabaseServer.storage.createBucket(bucket.name, {
          public: bucket.public,
        })

        if (error) {
          return { name: bucket.name, status: "error", message: error.message }
        }

        // Set up RLS policies for the bucket to allow public read access
        // This is needed for the client to be able to access the files
        try {
          await supabaseServer.storage.from(bucket.name).getPublicUrl("test.txt")
        } catch (e) {
          console.log(`Error testing public URL for ${bucket.name}:`, e)
        }

        return { name: bucket.name, status: "created" }
      }),
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error setting up storage buckets:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
