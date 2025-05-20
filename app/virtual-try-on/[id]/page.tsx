"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Camera, ChevronLeft, Info, Loader2, ShoppingCart, Sliders } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { SimpleGlassesOverlay } from "@/components/simple-glasses-overlay"
import { Slider } from "@/components/ui/slider"

type Product = {
  id: number
  name: string
  price: number
  image_url: string
  category: string
  description: string
  colors: string[]
}

export default function ProductTryOnPage() {
  const { id } = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [modelScale, setModelScale] = useState(1.0)
  const [modelPosition, setModelPosition] = useState({ x: 0, y: 0 })
  const { toast } = useToast()

  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch product data
        const { data: productData, error: productError } = await supabaseClient
          .from("products")
          .select("*")
          .eq("id", id)
          .single()

        if (productError) throw productError

        setProduct(productData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router, toast])

  const startWebcam = async () => {
    try {
      setCameraError(null)
      console.log("Requesting webcam access...")

      // Check if video element exists
      if (!videoRef.current) {
        const errorMsg = "Video element not found. Please refresh the page and try again."
        console.error(errorMsg)
        setCameraError(errorMsg)
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      console.log("Webcam access granted, setting up video element...")

      // Set the stream to the video element
      videoRef.current.srcObject = mediaStream

      // Make sure we handle the video loading properly
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, playing video...")
        if (videoRef.current) {
          videoRef.current.play().catch((e) => {
            console.error("Error playing video:", e)
            setCameraError("Failed to play video stream: " + e.message)
          })
        }
      }

      setStream(mediaStream)
      setIsWebcamActive(true)

      console.log("Webcam setup complete")

      toast({
        title: "Camera activated",
        description: "Your webcam is now active. The glasses will appear on your face.",
      })
    } catch (error) {
      console.error("Error accessing webcam:", error)
      setCameraError(error instanceof Error ? error.message : "Unknown camera error")
      toast({
        title: "Webcam access denied",
        description: "Please allow camera access to use the virtual try-on feature.",
        variant: "destructive",
      })
    }
  }

  const stopWebcam = () => {
    console.log("Stopping webcam...")
    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind)
        track.stop()
      })
      setStream(null)
      setIsWebcamActive(false)

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      console.log("Webcam stopped")
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        console.log("Component unmounting, stopping webcam...")
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const handleModelScaleChange = (value: number[]) => {
    setModelScale(value[0])
  }

  const handleModelPositionChange = (axis: "x" | "y", value: number[]) => {
    setModelPosition((prev) => ({
      ...prev,
      [axis]: value[0],
    }))
  }

  if (loading) {
    return (
      <div className="container px-4 py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
        <p className="mt-4 text-muted-foreground">Loading virtual try-on experience...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or doesn't have a 3D model.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{product.name} - Virtual Try-On</h1>
          <p className="text-muted-foreground">
            Try on these glasses virtually using your webcam to see how they look on your face before you buy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="flex flex-col space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="relative aspect-video bg-black">
                  {/* The video element */}
                  <div id="video-container" className="w-full h-full">
                    <video
                      ref={videoRef}
                      id="webcam-video"
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-contain ${isWebcamActive ? "block" : "hidden"}`}
                      style={{ transform: "scaleX(-1)" }} /* Mirror the video */
                    />

                    {/* Glasses overlay when webcam is active */}
                    {isWebcamActive && (
                      <SimpleGlassesOverlay videoRef={videoRef} scale={modelScale} position={modelPosition} />
                    )}
                  </div>

                  {!isWebcamActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-muted">
                      <Camera className="h-12 w-12 mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Enable Your Camera</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        To use the virtual try-on feature, we need access to your camera. Your privacy is important to
                        us - we don't store any video data.
                      </p>
                      <Button onClick={startWebcam} size="lg">
                        Start Camera
                      </Button>

                      {cameraError && (
                        <div className="mt-4 text-red-500 bg-red-50 p-3 rounded-md text-sm">
                          <strong>Error:</strong> {cameraError}
                          <p className="mt-1">
                            Please make sure your camera is connected and you've granted permission in your browser.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Simple overlay to show the video is working */}
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Camera Active
                      </div>

                      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                        <Button
                          onClick={() => setShowControls(!showControls)}
                          variant="secondary"
                          size="sm"
                          className="bg-white/80 hover:bg-white"
                        >
                          <Sliders className="h-4 w-4 mr-1" />
                          Adjust Fit
                        </Button>
                        <Button onClick={stopWebcam} variant="destructive" size="sm">
                          Stop Camera
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model adjustment controls */}
            {isWebcamActive && showControls && (
              <Card className="p-4">
                <h3 className="font-medium mb-4">Adjust Glasses Fit</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm">Size</label>
                      <span className="text-sm text-muted-foreground">{modelScale.toFixed(2)}x</span>
                    </div>
                    <Slider
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      defaultValue={[modelScale]}
                      onValueChange={handleModelScaleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm">Horizontal Position</label>
                      <span className="text-sm text-muted-foreground">{modelPosition.x.toFixed(2)}</span>
                    </div>
                    <Slider
                      min={-0.5}
                      max={0.5}
                      step={0.01}
                      defaultValue={[modelPosition.x]}
                      onValueChange={(value) => handleModelPositionChange("x", value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm">Vertical Position</label>
                      <span className="text-sm text-muted-foreground">{modelPosition.y.toFixed(2)}</span>
                    </div>
                    <Slider
                      min={-0.5}
                      max={0.5}
                      step={0.01}
                      defaultValue={[modelPosition.y]}
                      onValueChange={(value) => handleModelPositionChange("y", value)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {isWebcamActive && (
              <div className="flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Info className="h-4 w-4" />
                        How does this work?
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Our virtual try-on uses your webcam to place glasses on your face. The glasses will follow your
                        head movements. You can adjust the size and position using the controls.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-6">
            <div className="bg-muted/40 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 rounded-md overflow-hidden">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=80&width=80"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{product.category}</p>
                  <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {product.description || "Classic design that complements any face shape and style."}
                </p>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Available Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div
                          className="h-4 w-4 rounded-full border"
                          style={{
                            backgroundColor:
                              color.toLowerCase() === "black"
                                ? "black"
                                : color.toLowerCase() === "gold"
                                  ? "gold"
                                  : color.toLowerCase() === "silver"
                                    ? "silver"
                                    : color.toLowerCase() === "tortoise"
                                      ? "#8B4513"
                                      : color.toLowerCase() === "blue"
                                        ? "blue"
                                        : color.toLowerCase() === "brown"
                                          ? "brown"
                                          : color.toLowerCase() === "green"
                                            ? "green"
                                            : color.toLowerCase() === "red"
                                              ? "red"
                                              : "gray",
                          }}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Button className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/products/${product.id}`}>View Details</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Virtual Try-On Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <span>Make sure your face is well-lit and centered in the camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <span>Move your head slowly to see how the glasses follow your movements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <span>Use the adjustment controls if needed for a perfect fit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
