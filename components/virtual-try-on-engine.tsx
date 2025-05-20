"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useToast } from "@/hooks/use-toast"
import { detectFace } from "@/lib/face-detection"
import { loadFaceApiModels } from "@/lib/download-face-models"

interface VirtualTryOnEngineProps {
  modelUrl: string
  onClose: () => void
  videoRef?: React.RefObject<HTMLVideoElement>
  scale?: number
  position?: { x: number; y: number; z: number }
}

export function VirtualTryOnEngine({
  modelUrl,
  onClose,
  videoRef: externalVideoRef,
  scale = 1.0,
  position = { x: 0, y: 0, z: 0 },
}: VirtualTryOnEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const videoRef = externalVideoRef || internalVideoRef
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [usingFallbackDetection, setUsingFallbackDetection] = useState(false)
  const { toast } = useToast()

  // Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const glassesRef = useRef<THREE.Object3D | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const clockRef = useRef<THREE.Clock | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Face tracking state
  const lastFacePositionRef = useRef({
    x: 0,
    y: 0,
    z: -0.5,
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  })
  const smoothingFactor = 0.3 // Higher = more responsive tracking
  const [detectionAttempts, setDetectionAttempts] = useState(0)

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await loadFaceApiModels()
      } catch (error) {
        console.error("Error loading face detection models:", error)
        setUsingFallbackDetection(true)
        toast({
          title: "Using simplified face tracking",
          description: "Advanced face tracking models couldn't be loaded. Using simplified tracking instead.",
        })
      }
    }

    loadModels()
  }, [toast])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return

    console.log("Initializing Three.js scene")

    // Create scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      videoRef.current.videoWidth / videoRef.current.videoHeight || 16 / 9,
      0.1,
      1000,
    )
    camera.position.z = 2
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    // Set initial size (will be updated when video loads)
    renderer.setSize(containerRef.current.clientWidth || 640, containerRef.current.clientHeight || 480)
    renderer.setClearColor(0x000000, 0) // Transparent background
    renderer.outputEncoding = THREE.sRGBEncoding
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 1, 1)
    scene.add(directionalLight)

    // Create clock for animations
    clockRef.current = new THREE.Clock()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current || !videoRef.current) return

      const width = videoRef.current.videoWidth || containerRef.current.clientWidth
      const height = videoRef.current.videoHeight || containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Update renderer size when video metadata is loaded
    const handleVideoMetadata = () => {
      if (!videoRef.current || !rendererRef.current || !cameraRef.current) return

      const width = videoRef.current.videoWidth
      const height = videoRef.current.videoHeight

      if (width && height) {
        rendererRef.current.setSize(width, height)
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()

        // Also update the container size to match video
        if (containerRef.current) {
          containerRef.current.style.width = `${width}px`
          containerRef.current.style.height = `${height}px`
        }
      }
    }

    if (videoRef.current.readyState >= 2) {
      // Video metadata already loaded
      handleVideoMetadata()
    } else {
      videoRef.current.addEventListener("loadedmetadata", handleVideoMetadata)
    }

    // Load 3D model
    loadModel()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadedmetadata", handleVideoMetadata)
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Update model position and scale when props change
  useEffect(() => {
    if (glassesRef.current) {
      glassesRef.current.scale.set(scale, scale, scale)
      glassesRef.current.position.x = position.x
      glassesRef.current.position.y = position.y
      glassesRef.current.position.z = position.z
    }
  }, [scale, position])

  // Set up face detection and animation loop
  useEffect(() => {
    if (!videoRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return

    let lastDetectionTime = 0
    const detectionInterval = 30 // ms - reduced for more responsive tracking

    const animate = async () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      const now = Date.now()

      // Run face detection at intervals
      if (now - lastDetectionTime > detectionInterval && videoRef.current && videoRef.current.readyState === 4) {
        lastDetectionTime = now

        try {
          // Try to detect face
          const faceData = await detectFace(videoRef.current)

          if (faceData && glassesRef.current) {
            // Face detected, position glasses
            setFaceDetected(true)

            // Get video dimensions
            const videoWidth = videoRef.current.videoWidth
            const videoHeight = videoRef.current.videoHeight

            // Convert face position to 3D space
            // For eye level, we use the specific eye level from face detection
            const eyeLevelNormalized = (faceData.eyeLevel / videoHeight) * 2 - 1

            // Use nose position for better horizontal alignment
            const noseXNormalized = (faceData.nosePosition.x / videoWidth) * 2 - 1

            // Calculate target position
            const targetX = noseXNormalized * 0.5 + position.x
            const targetY = -eyeLevelNormalized * 0.8 + position.y // Negative because Y is inverted in 3D space
            const targetZ = -0.5 + position.z

            // Apply smoothing to make movements less jittery
            const newX = lastFacePositionRef.current.x + (targetX - lastFacePositionRef.current.x) * smoothingFactor
            const newY = lastFacePositionRef.current.y + (targetY - lastFacePositionRef.current.y) * smoothingFactor
            const newZ = lastFacePositionRef.current.z + (targetZ - lastFacePositionRef.current.z) * smoothingFactor

            // Update position
            glassesRef.current.position.x = newX
            glassesRef.current.position.y = newY
            glassesRef.current.position.z = newZ

            // Apply rotation based on face orientation
            if (faceData.rotation) {
              // Apply roll (z-axis rotation)
              const targetRoll = faceData.rotation.roll || 0
              const newRoll =
                lastFacePositionRef.current.rotation.roll +
                (targetRoll - lastFacePositionRef.current.rotation.roll) * smoothingFactor
              glassesRef.current.rotation.z = newRoll

              // Apply yaw (y-axis rotation)
              const targetYaw = faceData.rotation.yaw || 0
              const newYaw =
                lastFacePositionRef.current.rotation.yaw +
                (targetYaw - lastFacePositionRef.current.rotation.yaw) * smoothingFactor
              glassesRef.current.rotation.y = newYaw

              // Apply pitch (x-axis rotation)
              const targetPitch = faceData.rotation.pitch || 0
              const newPitch =
                lastFacePositionRef.current.rotation.pitch +
                (targetPitch - lastFacePositionRef.current.rotation.pitch) * smoothingFactor
              glassesRef.current.rotation.x = newPitch

              // Store current rotation for next frame's smoothing
              lastFacePositionRef.current.rotation = {
                roll: newRoll,
                yaw: newYaw,
                pitch: newPitch,
              }
            }

            // Store current position for next frame's smoothing
            lastFacePositionRef.current.x = newX
            lastFacePositionRef.current.y = newY
            lastFacePositionRef.current.z = newZ

            // Scale glasses based on face width and user scale
            const baseScale = (faceData.width / videoWidth) * 2.0
            glassesRef.current.scale.set(baseScale * scale, baseScale * scale, baseScale * scale)
          }
        } catch (error) {
          console.error("Face detection error:", error)
          setUsingFallbackDetection(true)
        }
      }

      if (mixerRef.current && clockRef.current) {
        mixerRef.current.update(clockRef.current.getDelta())
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [position, scale])

  // Load the 3D model
  const loadModel = async () => {
    if (!sceneRef.current) return

    const loader = new GLTFLoader()

    try {
      setIsLoading(true)
      console.log("Loading 3D model from:", modelUrl)

      loader.load(
        modelUrl,
        (gltf) => {
          if (!sceneRef.current) return

          console.log("3D model loaded successfully")
          const model = gltf.scene

          // Center the model
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          model.position.sub(center)

          // Scale the model appropriately
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 1 / maxDim
          model.scale.set(scale, scale, scale)

          // Position slightly in front of the camera
          model.position.z = -0.5
          lastFacePositionRef.current.z = -0.5

          // Add model to scene
          sceneRef.current.add(model)
          glassesRef.current = model

          // Handle animations if present
          if (gltf.animations.length) {
            mixerRef.current = new THREE.AnimationMixer(model)
            const action = mixerRef.current.clipAction(gltf.animations[0])
            action.play()
          }

          setModelLoaded(true)
          setIsLoading(false)

          toast({
            title: "Model loaded",
            description: "3D glasses model loaded successfully. You can now try them on!",
          })
        },
        (progress) => {
          // Loading progress
          const percentComplete = Math.round((progress.loaded / progress.total) * 100)
          console.log(`Loading model: ${percentComplete}%`)
        },
        (error) => {
          console.error("Error loading model:", error)
          setIsLoading(false)
          toast({
            title: "Error loading model",
            description: "There was a problem loading the 3D model. Please try again.",
            variant: "destructive",
          })
        },
      )
    } catch (error) {
      console.error("Error in model loading process:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to initialize 3D viewer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 z-10" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading 3D model...</p>
          </div>
        </div>
      )}

      {!faceDetected && modelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white z-20">
          <div className="text-center bg-black/70 p-4 rounded-lg max-w-xs">
            <p>Position your face in the center of the camera</p>
          </div>
        </div>
      )}

      {usingFallbackDetection && modelLoaded && faceDetected && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs z-20">
          Using simplified face tracking
        </div>
      )}
    </div>
  )
}
