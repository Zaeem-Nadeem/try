import * as faceapi from "face-api.js"
import { loadFaceApiModels, areFaceModelsLoaded } from "./download-face-models"

// Track if we've shown the warning about advanced face detection
let warnedAboutFallback = false

export async function detectFace(video: HTMLVideoElement): Promise<{
  x: number
  y: number
  width: number
  height: number
  eyeLevel: number
  nosePosition: { x: number; y: number }
  rotation: { pitch: number; yaw: number; roll: number }
} | null> {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight

  if (videoWidth === 0 || videoHeight === 0) {
    return null
  }

  try {
    // Try to load face-api.js models if not already loaded
    if (!areFaceModelsLoaded()) {
      await loadFaceApiModels()
    }

    // Use face-api.js for detection
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
    const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks()

    if (result) {
      // Get face box
      const box = result.detection.box
      const faceX = box.x
      const faceY = box.y
      const faceWidth = box.width
      const faceHeight = box.height

      // Get landmarks
      const landmarks = result.landmarks
      const positions = landmarks.positions

      // Get eye positions (average of left and right eye)
      const leftEye = landmarks.getLeftEye()
      const rightEye = landmarks.getRightEye()

      const leftEyeCenter = {
        x: leftEye.reduce((sum, pt) => sum + pt.x, 0) / leftEye.length,
        y: leftEye.reduce((sum, pt) => sum + pt.y, 0) / leftEye.length,
      }

      const rightEyeCenter = {
        x: rightEye.reduce((sum, pt) => sum + pt.x, 0) / rightEye.length,
        y: rightEye.reduce((sum, pt) => sum + pt.y, 0) / rightEye.length,
      }

      const eyeLevel = (leftEyeCenter.y + rightEyeCenter.y) / 2

      // Get nose position (tip of nose)
      const nose = landmarks.getNose()
      const nosePosition = {
        x: nose[3].x, // Tip of nose
        y: nose[3].y,
      }

      // Calculate head rotation
      // Yaw (left/right rotation) based on eye positions
      const eyeDistanceX = rightEyeCenter.x - leftEyeCenter.x
      const normalizedEyeDistance = eyeDistanceX / faceWidth
      const yaw = (normalizedEyeDistance - 0.3) * 2 // Adjust based on typical eye distance

      // Pitch (up/down rotation) based on eye-to-nose angle
      const eyeMidpointY = (leftEyeCenter.y + rightEyeCenter.y) / 2
      const eyeToNoseY = nosePosition.y - eyeMidpointY
      const normalizedEyeToNoseY = eyeToNoseY / faceHeight
      const pitch = (normalizedEyeToNoseY - 0.15) * 2 // Adjust based on typical eye-to-nose distance

      // Roll (tilt) based on eye angle
      const eyeAngle = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, rightEyeCenter.x - leftEyeCenter.x)
      const roll = eyeAngle

      return {
        x: faceX,
        y: faceY,
        width: faceWidth,
        height: faceHeight,
        eyeLevel: eyeLevel,
        nosePosition: nosePosition,
        rotation: { pitch, yaw, roll },
      }
    }

    // If face-api.js detection fails, use fallback
    return simpleFaceDetection(video)
  } catch (error) {
    console.error("Face detection error:", error)

    // Show fallback warning once
    if (!warnedAboutFallback) {
      console.log("Using simplified face detection fallback")
      warnedAboutFallback = true
    }

    return simpleFaceDetection(video)
  }
}

// Simple face detection based on video dimensions
export function simpleFaceDetection(video: HTMLVideoElement): {
  x: number
  y: number
  width: number
  height: number
  eyeLevel: number
  nosePosition: { x: number; y: number }
  rotation: { pitch: number; yaw: number; roll: number }
} | null {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight

  if (videoWidth === 0 || videoHeight === 0) {
    return null
  }

  // Estimate face position (center of video)
  const faceWidth = videoWidth * 0.4 // Assume face is about 40% of video width
  const faceHeight = faceWidth * 1.3 // Typical face aspect ratio

  const faceX = (videoWidth - faceWidth) / 2
  const faceY = (videoHeight - faceHeight) / 2.5 // Position slightly above center

  // Estimate eye level - typically around 40% from the top of the face
  const eyeLevel = faceY + faceHeight * 0.4

  // Estimate nose position
  const noseX = videoWidth / 2
  const noseY = faceY + faceHeight * 0.55

  return {
    x: faceX,
    y: faceY,
    width: faceWidth,
    height: faceHeight,
    eyeLevel: eyeLevel,
    nosePosition: { x: noseX, y: noseY },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
  }
}
