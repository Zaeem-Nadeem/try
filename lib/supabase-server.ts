import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for server-side usage
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
