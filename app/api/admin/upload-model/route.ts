import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "model" or "thumbnail"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || (type !== "model" && type !== "thumbnail")) {
      return NextResponse.json({ error: "Invalid file type specified" }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = new Date().getTime()
    const filePath = type === "thumbnail" ? `thumbnails/${timestamp}_${file.name}` : `${timestamp}_${file.name}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload file to Supabase Storage using server-side client
    const { data, error } = await supabaseServer.storage.from("3d-models").upload(filePath, buffer, {
      contentType: file.type,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabaseServer.storage.from("3d-models").getPublicUrl(filePath)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
