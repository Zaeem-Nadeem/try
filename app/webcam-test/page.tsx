"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WebcamTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [browserInfo, setBrowserInfo] = useState<string>("")

  useEffect(() => {
    // Get browser information
    const browser = navigator.userAgent
    setBrowserInfo(browser)

    // Check if video element is initialized
    if (!videoRef.current) {
      console.error("Video element not initialized in useEffect")
    } else {
      console.log("Video element initialized successfully")
    }
  }, [])

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
        <h1 className="text-3xl font-bold tracking-tight">Webcam Test Page</h1>
        <p className="text-muted-foreground mt-1">
          Use this page to test if your webcam is working properly with our application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Webcam Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              {/* Always render the video element but keep it hidden when not active */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isWebcamActive ? "block" : "hidden"}`}
                style={{ transform: "scaleX(-1)" }}
              />

              {!isWebcamActive && (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  <Camera className="h-12 w-12 opacity-50" />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center">
              {!isWebcamActive ? (
                <Button onClick={startWebcam}>Start Camera</Button>
              ) : (
                <Button onClick={stopWebcam} variant="destructive">
                  Stop Camera
                </Button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                <h3 className="font-bold">Error:</h3>
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Common Issues:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Browser permissions not granted for camera access</li>
                <li>Another application is using your camera</li>
                <li>Camera drivers need to be updated</li>
                <li>Hardware issues with your webcam</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Steps to Try:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Check your browser's permission settings for this site</li>
                <li>Close other applications that might be using your camera</li>
                <li>Try a different browser</li>
                <li>Restart your computer</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Your Browser Information:</h3>
              <div className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">
                <code>{browserInfo}</code>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
