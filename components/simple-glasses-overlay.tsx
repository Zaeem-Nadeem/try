"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"

interface SimpleGlassesOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>
  scale?: number
  position?: { x: number; y: number }
}

export function SimpleGlassesOverlay({ videoRef, scale = 1.0, position = { x: 0, y: 0 } }: SimpleGlassesOverlayProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // Calculate glasses size based on video dimensions
  useEffect(() => {
    if (!videoRef.current) return

    const updateDimensions = () => {
      if (!videoRef.current) return

      const videoWidth = videoRef.current.videoWidth
      const videoHeight = videoRef.current.videoHeight

      if (videoWidth && videoHeight) {
        // Glasses width is approximately 70% of face width, which is about 40% of video width
        const glassesWidth = videoWidth * 0.4 * 0.7 * scale
        setDimensions({
          width: glassesWidth,
          height: glassesWidth * 0.3, // Typical aspect ratio for glasses
        })
      }
    }

    // Update dimensions when video metadata is loaded
    if (videoRef.current.readyState >= 2) {
      updateDimensions()
    } else {
      videoRef.current.addEventListener("loadedmetadata", updateDimensions)
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadedmetadata", updateDimensions)
      }
    }
  }, [videoRef, scale])

  // Simple face tracking based on video dimensions
  useEffect(() => {
    if (!videoRef.current || !overlayRef.current) return

    const trackFace = () => {
      if (!videoRef.current || !overlayRef.current) return

      const videoWidth = videoRef.current.videoWidth
      const videoHeight = videoRef.current.videoHeight

      if (videoWidth && videoHeight) {
        // Estimate face position (center of video with user adjustments)
        const centerX = videoWidth / 2
        const centerY = videoHeight * 0.4 // Slightly above center

        // Apply user position adjustments
        const adjustedX = centerX + (position.x * videoWidth) / 2
        const adjustedY = centerY + (position.y * videoHeight) / 2

        // Smooth transition for position changes
        setFacePosition((prev) => ({
          x: prev.x + (adjustedX - prev.x) * 0.1,
          y: prev.y + (adjustedY - prev.y) * 0.1,
        }))
      }

      animationRef.current = requestAnimationFrame(trackFace)
    }

    trackFace()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [videoRef, position])

  // Calculate position for the glasses overlay
  const overlayStyle = {
    position: "absolute",
    left: `${facePosition.x - dimensions.width / 2}px`,
    top: `${facePosition.y - dimensions.height / 2}px`,
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transform: "scaleX(-1)", // Mirror to match video
    pointerEvents: "none" as const,
  }

  // Create a simple glasses overlay using a div with border and background
  return (
    <div ref={overlayRef} style={overlayStyle} className="glasses-overlay">
      <div
        className="w-full h-full relative"
        style={{
          borderTop: "2px solid black",
          borderBottom: "none",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Left lens */}
        <div
          className="absolute rounded-full border-2 border-black bg-transparent"
          style={{
            width: `${dimensions.width * 0.45}px`,
            height: `${dimensions.height * 2}px`,
            left: "0",
            top: "-50%",
            transform: "translateY(25%)",
          }}
        />

        {/* Right lens */}
        <div
          className="absolute rounded-full border-2 border-black bg-transparent"
          style={{
            width: `${dimensions.width * 0.45}px`,
            height: `${dimensions.height * 2}px`,
            right: "0",
            top: "-50%",
            transform: "translateY(25%)",
          }}
        />

        {/* Temple arms (sides) */}
        <div
          className="absolute bg-black"
          style={{
            width: `${dimensions.width * 0.5}px`,
            height: "2px",
            left: "-45%",
            top: "0",
          }}
        />
        <div
          className="absolute bg-black"
          style={{
            width: `${dimensions.width * 0.5}px`,
            height: "2px",
            right: "-45%",
            top: "0",
          }}
        />
      </div>
    </div>
  )
}
