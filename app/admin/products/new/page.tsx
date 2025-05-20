"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Save, Loader2, ImagePlus, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    frame_shape: "",
    material: "",
    stock: "",
    colors: "",
    is_new: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/admin/upload-product-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload image")
    }

    const data = await response.json()
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)

      // Validate form
      if (!formData.name || !formData.price || !formData.category) {
        setError("Please fill out all required fields (name, price, category).")
        return
      }

      if (!imageFile) {
        setError("Please upload a product image.")
        return
      }

      console.log("Starting product creation process...")

      // Upload image using our server-side API
      let imageUrl
      try {
        imageUrl = await uploadImage(imageFile)
        console.log("Image uploaded successfully:", imageUrl)
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        throw new Error(
          `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`,
        )
      }

      // Parse colors as array
      const colorsArray = formData.colors
        .split(",")
        .map((color) => color.trim())
        .filter((color) => color)

      // Create product in database
      console.log("Creating product in database...")
      const { data: product, error: productError } = await supabaseClient
        .from("products")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            category: formData.category,
            frame_shape: formData.frame_shape,
            material: formData.material,
            stock: Number.parseInt(formData.stock || "0"),
            colors: colorsArray,
            is_new: formData.is_new,
            image_url: imageUrl,
          },
        ])
        .select()

      if (productError) {
        console.error("Error creating product:", productError)
        throw new Error(`Failed to create product: ${productError.message}`)
      }

      console.log("Product created successfully:", product)

      toast({
        title: "Product created",
        description: "Your product has been successfully created. Now you can add a 3D model for it.",
      })

      // Redirect to model upload page with the new product ID
      if (product && product.length > 0) {
        router.push(`/admin/models/new?productId=${product[0].id}`)
      } else {
        // Fallback to product list
        router.push("/admin/products")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      setError(error instanceof Error ? error.message : "Failed to create product. Please try again.")
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
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
          href="/admin/products"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground mt-1">Create a new glasses product</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic information about the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Aviator Classic"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the product..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 99.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Specific details and attributes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleSelectChange("category", value)} value={formData.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunglasses">Sunglasses</SelectItem>
                    <SelectItem value="Optical">Optical</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frame_shape">Frame Shape</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("frame_shape", value)}
                  value={formData.frame_shape}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a frame shape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aviator">Aviator</SelectItem>
                    <SelectItem value="Round">Round</SelectItem>
                    <SelectItem value="Square">Square</SelectItem>
                    <SelectItem value="Rectangle">Rectangle</SelectItem>
                    <SelectItem value="Cat Eye">Cat Eye</SelectItem>
                    <SelectItem value="Oval">Oval</SelectItem>
                    <SelectItem value="Wrap">Wrap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Select onValueChange={(value) => handleSelectChange("material", value)} value={formData.material}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Metal">Metal</SelectItem>
                    <SelectItem value="Acetate">Acetate</SelectItem>
                    <SelectItem value="Plastic">Plastic</SelectItem>
                    <SelectItem value="Titanium">Titanium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Available Colors (comma-separated)</Label>
                <Input
                  id="colors"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  placeholder="e.g., Black, Gold, Silver"
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="is_new"
                  checked={formData.is_new}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_new: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-violet-600"
                />
                <Label htmlFor="is_new">Mark as New Product</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>Upload the main product image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />

                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Product preview"
                      className="max-h-64 max-w-full mb-4 rounded-lg"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="image" className="flex flex-col items-center">
                    <ImagePlus className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="font-medium">Click to upload image</span>
                    <span className="text-sm text-muted-foreground mt-1">PNG, JPG, or WebP (max 5MB)</span>
                  </label>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Product
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
