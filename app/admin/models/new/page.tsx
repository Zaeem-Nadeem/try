"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Upload, CuboidIcon as CubeIcon, Loader2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Product = {
  id: number
  name: string
  category: string
  image_url: string
}

export default function NewModelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [fetchingProducts, setFetchingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get pre-selected product from URL if available
  useEffect(() => {
    const productId = searchParams.get("productId")
    if (productId) {
      setSelectedProduct(productId)
    }
  }, [searchParams])

  // Fetch products that don't have models yet
  useEffect(() => {
    async function loadProducts() {
      try {
        setFetchingProducts(true)

        // Get all products
        const { data: allProducts, error: productsError } = await supabaseClient
          .from("products")
          .select("id, name, category, image_url")

        if (productsError) throw productsError

        // Get products that already have models
        const { data: existingModels, error: modelsError } = await supabaseClient.from("models").select("product_id")

        if (modelsError) throw modelsError

        // Filter out products that already have models
        const productsWithoutModels =
          existingModels && existingModels.length > 0
            ? allProducts.filter((product) => !existingModels.some((model) => model.product_id === product.id))
            : allProducts

        setProducts(productsWithoutModels || [])
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFetchingProducts(false)
      }
    }

    loadProducts()
  }, [toast])

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (file.name.endsWith(".glb") || file.name.endsWith(".gltf")) {
      setModelFile(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a .glb or .gltf file for the 3D model.",
        variant: "destructive",
      })
      e.target.value = ""
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file for the thumbnail.",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    setThumbnailFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadFile = async (file: File, type: "model" | "thumbnail"): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const response = await fetch("/api/admin/upload-model", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload file")
    }

    const data = await response.json()
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!selectedProduct || !modelFile) {
        setError("Please select a product and upload a 3D model file.")
        return
      }

      setLoading(true)
      console.log("Starting 3D model upload process...")

      // Upload model file using our server-side API
      let modelUrl
      try {
        modelUrl = await uploadFile(modelFile, "model")
        console.log("3D model uploaded successfully:", modelUrl)
      } catch (uploadError) {
        console.error("Error uploading model:", uploadError)
        throw new Error(
          `Failed to upload 3D model: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`,
        )
      }

      // Upload thumbnail if available
      let thumbnailUrl = null
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadFile(thumbnailFile, "thumbnail")
          console.log("Thumbnail uploaded successfully:", thumbnailUrl)
        } catch (uploadError) {
          console.error("Error uploading thumbnail:", uploadError)
          throw new Error(
            `Failed to upload thumbnail: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`,
          )
        }
      }

      // Create model record in database
      console.log("Creating model record in database...")
      const { error: createModelError } = await supabaseClient.from("models").insert([
        {
          product_id: Number.parseInt(selectedProduct),
          model_url: modelUrl,
          thumbnail_url: thumbnailUrl,
        },
      ])

      if (createModelError) {
        console.error("Error creating model record:", createModelError)
        throw new Error(`Failed to create model record: ${createModelError.message}`)
      }

      console.log("3D model successfully added to product")

      toast({
        title: "3D model added",
        description: "The 3D model has been successfully uploaded and associated with the product.",
      })

      // Redirect to models list
      router.push("/admin/models")
    } catch (error) {
      console.error("Error uploading 3D model:", error)
      setError(error instanceof Error ? error.message : "Failed to upload 3D model. Please try again.")
      toast({
        title: "Error",
        description: "Failed to upload 3D model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Link
          href="/admin/models"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to 3D Models
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Upload New 3D Model</h1>
        <p className="text-muted-foreground mt-1">Add a 3D model for virtual try-on feature</p>
      </div>

      {/* Important notice about storage buckets */}
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Storage Setup Required</AlertTitle>
        <AlertDescription>
          <div>
            <p>
              This application requires Supabase storage buckets to be set up in advance. Make sure you have created the
              following buckets in your Supabase project:
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
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
              <CardDescription>Choose which product this 3D model belongs to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fetchingProducts ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : products.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No eligible products</AlertTitle>
                  <AlertDescription>
                    All products already have 3D models. Please create a new product first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProduct && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Selected Product</h3>
                  {products.map(
                    (product) =>
                      product.id.toString() === selectedProduct && (
                        <div key={product.id} className="flex items-center gap-4">
                          <div className="relative h-16 w-16 overflow-hidden rounded">
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Upload the 3D model file and optional thumbnail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="model" className="mb-2 block">
                  3D Model File (.glb or .gltf) *
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    id="model"
                    accept=".glb,.gltf"
                    onChange={handleModelFileChange}
                    className="hidden"
                  />

                  {modelFile ? (
                    <div className="flex flex-col items-center">
                      <CubeIcon className="h-12 w-12 text-violet-500 mb-2" />
                      <p className="font-medium">{modelFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(modelFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => document.getElementById("model")?.click()}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="model" className="flex flex-col items-center">
                      <CubeIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="font-medium">Click to upload 3D model</span>
                      <span className="text-sm text-muted-foreground mt-1">GLB or GLTF format (max 10MB)</span>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail" className="mb-2 block">
                  Thumbnail Image (optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />

                  {thumbnailPreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="max-h-32 max-w-full mb-4 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("thumbnail")?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="thumbnail" className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="font-medium">Click to upload thumbnail</span>
                      <span className="text-sm text-muted-foreground mt-1">PNG, JPG, or WebP (max 2MB)</span>
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={loading || fetchingProducts || products.length === 0} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload 3D Model
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
