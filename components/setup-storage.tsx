"use client"

import { useState } from "react"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function SetupStorage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const setupStorage = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/setup-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up storage buckets")
      }

      setSuccess(true)
      toast({
        title: "Storage buckets created",
        description: "Storage buckets have been successfully set up.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to set up storage buckets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Alert className="mb-6" variant={error ? "destructive" : success ? "default" : "warning"}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Storage Setup Required</AlertTitle>
      <AlertDescription className="space-y-4">
        <div>
          <p>
            This application requires Supabase storage buckets to be set up in advance. The following buckets are
            needed:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              <strong>glasses-store</strong> - for product images
            </li>
            <li>
              <strong>3d-models</strong> - for 3D model files
            </li>
          </ul>
        </div>

        {error && <p className="text-red-500">Error: {error}</p>}

        {success ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span>Storage buckets created successfully! You can now upload products and 3D models.</span>
          </div>
        ) : (
          <Button onClick={setupStorage} disabled={loading} className="mt-2">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up storage...
              </>
            ) : (
              "Setup Storage Buckets"
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
