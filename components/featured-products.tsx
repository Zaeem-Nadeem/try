"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabaseClient } from "@/lib/supabase-client"

type Product = {
  id: number
  name: string
  price: number
  image_url: string
  category: string
  is_new: boolean
  colors: string[]
  has_model: boolean
}

export function FeaturedProducts() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabaseClient
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4)

        if (productsError) throw productsError

        // For each product, check if it has a 3D model
        const productsWithModelStatus = await Promise.all(
          productsData.map(async (product) => {
            const { count, error } = await supabaseClient
              .from("models")
              .select("id", { count: "exact", head: true })
              .eq("product_id", product.id)

            return {
              ...product,
              has_model: count ? count > 0 : false,
            }
          }),
        )

        setProducts(productsWithModelStatus)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-slate-100 animate-pulse"></div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded"></div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="h-6 w-1/4 bg-slate-100 animate-pulse rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      {products.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: product.id * 0.1 }}
          whileHover={{ y: -10 }}
          onMouseEnter={() => setHoveredProduct(product.id)}
          onMouseLeave={() => setHoveredProduct(null)}
        >
          <Card className="overflow-hidden border-2 border-transparent transition-all hover:border-violet-300">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.image_url || "/placeholder.svg?height=300&width=300"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
              />
              {product.is_new && <Badge className="absolute right-2 top-2 bg-violet-600">New</Badge>}
              <div
                className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/60 transition-opacity duration-300 ${hoveredProduct === product.id ? "opacity-100" : "opacity-0"}`}
              >
                <Button size="sm" variant="secondary" className="h-9 w-9 rounded-full p-0">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Add to cart</span>
                </Button>
                {product.has_model && (
                  <Button asChild size="sm" variant="secondary" className="h-9 w-9 rounded-full p-0">
                    <Link href={`/virtual-try-on/${product.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Try on</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-1">
                <h3 className="font-semibold">{product.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{(4 + Math.random()).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({Math.floor(Math.random() * 100) + 20})</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <div className="font-semibold">${product.price}</div>
              <div className="flex gap-1">
                {product.colors &&
                  product.colors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-full border"
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
                  ))}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
