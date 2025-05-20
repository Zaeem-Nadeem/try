import * as faceapi from "face-api.js"

// Define the models we need
const MODEL_URL = "/models"

// Track loading status
let modelsLoaded = false
let loadingPromise: Promise<void> | null = null

// Function to load models
export async function loadFaceApiModels(): Promise<void> {
  // If models are already loaded, return immediately
  if (modelsLoaded) {
    return
  }

  // If models are currently loading, wait for that promise
  if (loadingPromise) {
    return loadingPromise
  }

  // Start loading models
  loadingPromise = (async () => {
    try {
      console.log("Loading face-api.js models from", MODEL_URL)

      // Load all required models
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)

      console.log("Face-api.js models loaded successfully")
      modelsLoaded = true
    } catch (error) {
      console.error("Error loading face-api.js models:", error)
      // Reset loading promise so we can try again
      loadingPromise = null
      throw error
    }
  })()

  return loadingPromise
}

// Check if models are loaded
export function areFaceModelsLoaded(): boolean {
  return modelsLoaded
}
