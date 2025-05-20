"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"

const categories = [
  {
    id: 1,
    name: "Sunglasses",
    image: "/placeholder.svg?height=400&width=400",
    count: 42,
  },
  {
    id: 2,
    name: "Optical",
    image: "/placeholder.svg?height=400&width=400",
    count: 36,
  },
  {
    id: 3,
    name: "Reading",
    image: "/placeholder.svg?height=400&width=400",
    count: 28,
  },
  {
    id: 4,
    name: "Sports",
    image: "/placeholder.svg?height=400&width=400",
    count: 15,
  },
]

export function CategoryShowcase() {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
      {categories.map((category) => (
        <Link key={category.id} href={`/products?category=${category.name.toLowerCase()}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Card className="overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300"
                  style={{
                    transform: hoveredCategory === category.id ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm">{category.count} Products</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
