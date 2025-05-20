"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleWebcamPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startWebcam = async () => {
    try {
      setError(null)
      console.log("Requesting webcam access...")

      // Check if video element exists
      if (!videoRef.current) {
        const errorMsg = "Video element not found. Please refresh the page and try again."
        console.error(errorMsg)
        setError(errorMsg)
        return
      }

      console.log("Video element found, requesting media stream...")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })

      console.log("Webcam access granted, setting up video element...")

      videoRef.current.srcObject = mediaStream

      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, playing video...")
        if (videoRef.current) {
          videoRef.current.play().catch((e) => {
            console.error("Error playing video:", e)
            setError("Failed to play video stream: " + e.message)
          })
        }
      }

      setStream(mediaStream)
      setIsWebcamActive(true)
      console.log("Webcam setup complete")
    } catch (error) {
      console.error("Error accessing webcam:", error)
      setError(error instanceof Error ? error.message : "Unknown camera error")
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsWebcamActive(false)

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Simple Webcam Test</h1>
        <p className="text-muted-foreground mt-1">
          A simplified page to test webcam functionality without any extra features.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Webcam Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            <video
              ref={videoRef}
              id="webcam-video"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />

            {!isWebcamActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                <p>Click "Start Camera" to activate your webcam</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-4">
            {!isWebcamActive ? (
              <Button onClick={startWebcam} size="lg">
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopWebcam} variant="destructive" size="lg">
                Stop Camera
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
              <h3 className="font-bold">Error:</h3>
              <p>{error}</p>
              <p className="mt-2 text-sm">Browser information: {navigator.userAgent}</p>
            </div>
          )}

          <div className="mt-6 bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Video element ID: webcam-video</li>
              <li>Video element ref exists: {videoRef.current ? "Yes" : "No"}</li>
              <li>Webcam active: {isWebcamActive ? "Yes" : "No"}</li>
              <li>Stream exists: {stream ? "Yes" : "No"}</li>
              <li>
                Stream tracks:{" "}
                {stream
                  ? stream
                      .getTracks()
                      .map((t) => t.kind)
                      .join(", ")
                  : "None"}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
