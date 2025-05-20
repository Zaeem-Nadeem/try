import { supabaseClient } from "./supabase-client"

export async function uploadFile(file: File, bucket: string, folder = ""): Promise<string | null> {
  try {
    const timestamp = new Date().getTime()
    const fileExt = file.name.split(".").pop()
    const filePath = folder ? `${folder}/${timestamp}_${file.name}` : `${timestamp}_${file.name}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(bucket).getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}
