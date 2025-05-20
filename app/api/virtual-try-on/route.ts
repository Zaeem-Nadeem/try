import { NextResponse } from "next/server"

// This would be connected to your database in a real implementation
const virtualModels = [
  {
    id: 1,
    name: "Aviator Classic Model",
    productId: 1,
    modelUrl: "/models/aviator.glb",
    thumbnail: "/placeholder.svg?height=200&width=200",
    createdAt: "2023-05-12T10:30:00Z",
  },
  {
    id: 2,
    name: "Retro Round Model",
    productId: 2,
    modelUrl: "/models/retro-round.glb",
    thumbnail: "/placeholder.svg?height=200&width=200",
    createdAt: "2023-06-15T14:45:00Z",
  },
  {
    id: 3,
    name: "Modern Square Model",
    productId: 3,
    modelUrl: "/models/modern-square.glb",
    thumbnail: "/placeholder.svg?height=200&width=200",
    createdAt: "2023-07-20T09:15:00Z",
  },
  {
    id: 4,
    name: "Cat Eye Vintage Model",
    productId: 4,
    modelUrl: "/models/cat-eye.glb",
    thumbnail: "/placeholder.svg?height=200&width=200",
    createdAt: "2023-08-05T16:30:00Z",
  },
]

export async function GET() {
  try {
    // In a real implementation, you would fetch this from your database
    return NextResponse.json(virtualModels)
  } catch (error) {
    console.error("Error fetching virtual models:", error)
    return NextResponse.json({ error: "Failed to fetch virtual models" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "productId", "modelUrl", "thumbnail"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // In a real implementation, you would save this to your database
    const newModel = {
      id: virtualModels.length + 1,
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newModel, { status: 201 })
  } catch (error) {
    console.error("Error creating virtual model:", error)
    return NextResponse.json({ error: "Failed to create virtual model" }, { status: 500 })
  }
}
