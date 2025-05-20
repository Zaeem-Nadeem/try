"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Camera, ChevronLeft, Info, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// This would come from your database in a real app
const glasses = [
  {
    id: 1,
    name: "Aviator Classic",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    modelImage: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 2,
    name: "Retro Round",
    price: 99.99,
    image: "/placeholder.svg?height=300&width=300",
    modelImage: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 3,
    name: "Modern Square",
    price: 149.99,
    image: "/placeholder.svg?height=300&width=300",
    modelImage: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 4,
    name: "Cat Eye Vintage",
    price: 119.99,
    image: "/placeholder.svg?height=300&width=300",
    modelImage: "/placeholder.svg?height=400&width=400",
  },
]

export default function VirtualTryOnPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [selectedGlasses, setSelectedGlasses] = useState(glasses[0])
  const [faceDetected, setFaceDetected] = useState(false)
  const { toast } = useToast()

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsWebcamActive(true)

        // Simulate face detection after a delay
        setTimeout(() => {
          setFaceDetected(true)
          toast({
            title: "Face detected",
            description: "We've detected your face. Try on different glasses!",
          })
        }, 2000)
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
      toast({
        title: "Webcam access denied",
        description: "Please allow camera access to use the virtual try-on feature.",
        variant: "destructive",
      })
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsWebcamActive(false)
      setFaceDetected(false)
    }
  }

  const handleGlassesSelect = (glasses) => {
    setSelectedGlasses(glasses)
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
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Virtual Try-On</h1>
          <p className="text-muted-foreground">
            Try on glasses virtually using your webcam to see how they look on your face before you buy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="flex flex-col space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                {!isWebcamActive ? (
                  <div className="aspect-video bg-muted flex flex-col items-center justify-center p-8 text-center">
                    <Camera className="h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Enable Your Camera</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      To use the virtual try-on feature, we need access to your camera. Your privacy is important to us
                      - we don't store any video data.
                    </p>
                    <Button onClick={startWebcam} size="lg">
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                    {faceDetected && (
                      <div className="absolute inset-0 pointer-events-none">
                        <Image
                          src={selectedGlasses.modelImage || "/placeholder.svg"}
                          alt={selectedGlasses.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4">
                      <Button onClick={stopWebcam} variant="destructive" size="sm">
                        Stop Camera
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                        Our virtual try-on uses face detection technology to place glasses on your face in real-time.
                        Move your head slightly to see how the glasses look from different angles.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Glasses</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {glasses.map((item) => (
                    <CarouselItem key={item.id} className="basis-1/2 md:basis-1/3 lg:basis-1/2">
                      <div className="p-1">
                        <Card
                          className={`overflow-hidden cursor-pointer transition-all ${selectedGlasses.id === item.id ? "border-2 border-violet-500" : ""}`}
                          onClick={() => handleGlassesSelect(item)}
                        >
                          <CardContent className="p-0">
                            <div className="aspect-square relative">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium text-sm">{item.name}</h3>
                              <p className="text-sm font-semibold mt-1">${item.price}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            <div className="bg-muted/40 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 rounded-md overflow-hidden">
                  <Image
                    src={selectedGlasses.image || "/placeholder.svg"}
                    alt={selectedGlasses.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedGlasses.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">Perfect fit for any occasion</p>
                  <p className="font-semibold text-lg">${selectedGlasses.price}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/products/${selectedGlasses.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
