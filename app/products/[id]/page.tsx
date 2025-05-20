"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Minus, Plus, ShoppingCart, Star, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"

type Product = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_new: boolean
  colors: string[]
  frame_shape: string
  material: string
  stock: number
  has_model: boolean
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)

        // Fetch product data
        const { data: productData, error: productError } = await supabaseClient
          .from("products")
          .select("*")
          .eq("id", id)
          .single()

        if (productError) throw productError

        // Check if product has a 3D model
        const { count, error: modelError } = await supabaseClient
          .from("models")
          .select("id", { count: "exact", head: true })
          .eq("product_id", id)

        if (modelError) throw modelError

        setProduct({
          ...productData,
          has_model: count ? count > 0 : false,
        })

        // Set default selected color
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0])
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, toast])

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const incrementQuantity = () => {
    // Don't allow more than stock
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedColor) return

    // Here you would typically add the item to cart
    // For now we'll just show a toast
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} (${selectedColor}) added to your cart.`,
    })
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="mb-6 text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          {product.is_new && <Badge className="absolute left-4 top-4 bg-violet-600">New</Badge>}
          {product.has_model && (
            <Button className="absolute right-4 bottom-4" onClick={() => router.push(`/virtual-try-on/${product.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Virtual Try-On
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">42 reviews</span>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="font-semibold text-2xl">${product.price.toFixed(2)}</h2>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-muted-foreground">
              {product.description || "Classic design that complements any face shape and style."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Frame Shape</h3>
              <Badge variant="outline">{product.frame_shape}</Badge>
            </div>

            <div>
              <h3 className="font-medium mb-2">Material</h3>
              <Badge variant="outline">{product.material}</Badge>
            </div>

            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors &&
                  product.colors.map((color) => (
                    <button
                      key={color}
                      className={`relative flex items-center gap-2 rounded-full px-3 py-1 text-sm border transition-colors hover:bg-accent ${selectedColor === color ? "border-violet-500 bg-violet-50" : "border-gray-200"}`}
                      onClick={() => setSelectedColor(color)}
                    >
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
                      {color}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Quantity</h3>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={product.stock <= quantity}
                  className="h-10 w-10 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !selectedColor}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>

              {product.has_model && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => router.push(`/virtual-try-on/${product.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Virtual Try-On
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
