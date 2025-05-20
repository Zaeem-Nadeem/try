"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, Filter, ShoppingCart, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// This would come from your database in a real app
const allProducts = [
  {
    id: 1,
    name: "Aviator Classic",
    price: 129.99,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=300&width=300",
    category: "Sunglasses",
    isNew: true,
    colors: ["Black", "Gold", "Silver"],
    frameShape: "Aviator",
    material: "Metal",
  },
  {
    id: 2,
    name: "Retro Round",
    price: 99.99,
    rating: 4.6,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300",
    category: "Optical",
    isNew: false,
    colors: ["Tortoise", "Black", "Blue"],
    frameShape: "Round",
    material: "Acetate",
  },
  {
    id: 3,
    name: "Modern Square",
    price: 149.99,
    rating: 4.9,
    reviews: 56,
    image: "/placeholder.svg?height=300&width=300",
    category: "Sunglasses",
    isNew: true,
    colors: ["Black", "Brown", "Green"],
    frameShape: "Square",
    material: "Metal",
  },
  {
    id: 4,
    name: "Cat Eye Vintage",
    price: 119.99,
    rating: 4.7,
    reviews: 72,
    image: "/placeholder.svg?height=300&width=300",
    category: "Optical",
    isNew: false,
    colors: ["Red", "Black", "Tortoise"],
    frameShape: "Cat Eye",
    material: "Acetate",
  },
  {
    id: 5,
    name: "Sport Wrap",
    price: 159.99,
    rating: 4.5,
    reviews: 48,
    image: "/placeholder.svg?height=300&width=300",
    category: "Sports",
    isNew: false,
    colors: ["Black", "Blue", "Red"],
    frameShape: "Wrap",
    material: "Plastic",
  },
  {
    id: 6,
    name: "Classic Wayfarer",
    price: 139.99,
    rating: 4.9,
    reviews: 112,
    image: "/placeholder.svg?height=300&width=300",
    category: "Sunglasses",
    isNew: false,
    colors: ["Black", "Tortoise", "Blue"],
    frameShape: "Rectangle",
    material: "Acetate",
  },
  {
    id: 7,
    name: "Rimless Reading",
    price: 89.99,
    rating: 4.3,
    reviews: 37,
    image: "/placeholder.svg?height=300&width=300",
    category: "Reading",
    isNew: false,
    colors: ["Silver", "Gold", "Black"],
    frameShape: "Oval",
    material: "Metal",
  },
  {
    id: 8,
    name: "Oversized Square",
    price: 169.99,
    rating: 4.7,
    reviews: 64,
    image: "/placeholder.svg?height=300&width=300",
    category: "Sunglasses",
    isNew: true,
    colors: ["Black", "Brown", "Tortoise"],
    frameShape: "Square",
    material: "Acetate",
  },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category")

  const [filters, setFilters] = useState({
    categories: initialCategory ? [initialCategory] : [],
    frameShapes: [],
    materials: [],
    colors: [],
    priceRange: [0, 200],
  })

  const [sortOption, setSortOption] = useState("featured")
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const currentFilters = [...prev[filterType]]
      const index = currentFilters.indexOf(value)

      if (index === -1) {
        currentFilters.push(value)
      } else {
        currentFilters.splice(index, 1)
      }

      return {
        ...prev,
        [filterType]: currentFilters,
      }
    })
  }

  const handlePriceChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      frameShapes: [],
      materials: [],
      colors: [],
      priceRange: [0, 200],
    })
  }

  const filteredProducts = allProducts
    .filter((product) => {
      // Filter by category
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false
      }

      // Filter by frame shape
      if (filters.frameShapes.length > 0 && !filters.frameShapes.includes(product.frameShape)) {
        return false
      }

      // Filter by material
      if (filters.materials.length > 0 && !filters.materials.includes(product.material)) {
        return false
      }

      // Filter by color (if any color matches)
      if (filters.colors.length > 0 && !product.colors.some((color) => filters.colors.includes(color))) {
        return false
      }

      // Filter by price range
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return a.price - b.price
        case "price-high-low":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "newest":
          return b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1
        default: // featured
          return 0
      }
    })

  // Set initial category from URL parameter
  useEffect(() => {
    if (initialCategory) {
      setFilters((prev) => ({
        ...prev,
        categories: [initialCategory],
      }))
    }
  }, [initialCategory])

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Mobile Filter Button */}
        <div className="w-full md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down your product search with filters.</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-6">
                  {/* Mobile Filters */}
                  <div>
                    <h3 className="font-medium mb-2">Category</h3>
                    <div className="space-y-2">
                      {["Sunglasses", "Optical", "Reading", "Sports"].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={() => handleFilterChange("categories", category)}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Frame Shape</h3>
                    <div className="space-y-2">
                      {["Aviator", "Round", "Square", "Rectangle", "Cat Eye", "Oval", "Wrap"].map((shape) => (
                        <div key={shape} className="flex items-center space-x-2">
                          <Checkbox
                            id={`shape-${shape}`}
                            checked={filters.frameShapes.includes(shape)}
                            onCheckedChange={() => handleFilterChange("frameShapes", shape)}
                          />
                          <Label htmlFor={`shape-${shape}`}>{shape}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Material</h3>
                    <div className="space-y-2">
                      {["Metal", "Acetate", "Plastic"].map((material) => (
                        <div key={material} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material}`}
                            checked={filters.materials.includes(material)}
                            onCheckedChange={() => handleFilterChange("materials", material)}
                          />
                          <Label htmlFor={`material-${material}`}>{material}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Color</h3>
                    <div className="space-y-2">
                      {["Black", "Gold", "Silver", "Tortoise", "Blue", "Brown", "Green", "Red"].map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={filters.colors.includes(color)}
                            onCheckedChange={() => handleFilterChange("colors", color)}
                          />
                          <Label htmlFor={`color-${color}`}>{color}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Price Range</h3>
                    <Slider
                      defaultValue={filters.priceRange}
                      min={0}
                      max={200}
                      step={10}
                      onValueChange={handlePriceChange}
                      className="mb-6"
                    />
                    <div className="flex justify-between">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-1/4 bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <Button onClick={clearFilters} variant="ghost" size="sm" className="h-8 text-sm">
              Clear All
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <div className="space-y-2">
                {["Sunglasses", "Optical", "Reading", "Sports"].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`desktop-category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => handleFilterChange("categories", category)}
                    />
                    <Label htmlFor={`desktop-category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Frame Shape</h3>
              <div className="space-y-2">
                {["Aviator", "Round", "Square", "Rectangle", "Cat Eye", "Oval", "Wrap"].map((shape) => (
                  <div key={shape} className="flex items-center space-x-2">
                    <Checkbox
                      id={`desktop-shape-${shape}`}
                      checked={filters.frameShapes.includes(shape)}
                      onCheckedChange={() => handleFilterChange("frameShapes", shape)}
                    />
                    <Label htmlFor={`desktop-shape-${shape}`}>{shape}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Material</h3>
              <div className="space-y-2">
                {["Metal", "Acetate", "Plastic"].map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`desktop-material-${material}`}
                      checked={filters.materials.includes(material)}
                      onCheckedChange={() => handleFilterChange("materials", material)}
                    />
                    <Label htmlFor={`desktop-material-${material}`}>{material}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="space-y-2">
                {["Black", "Gold", "Silver", "Tortoise", "Blue", "Brown", "Green", "Red"].map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`desktop-color-${color}`}
                      checked={filters.colors.includes(color)}
                      onCheckedChange={() => handleFilterChange("colors", color)}
                    />
                    <Label htmlFor={`desktop-color-${color}`}>{color}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Price Range</h3>
              <Slider
                defaultValue={filters.priceRange}
                min={0}
                max={200}
                step={10}
                onValueChange={handlePriceChange}
                className="mb-6"
              />
              <div className="flex justify-between">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold mb-2 sm:mb-0">
              {initialCategory ? `${initialCategory} Glasses` : "All Glasses"}
            </h1>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <p className="text-sm text-muted-foreground">{filteredProducts.length} products</p>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.categories.length > 0 ||
            filters.frameShapes.length > 0 ||
            filters.materials.length > 0 ||
            filters.colors.length > 0 ||
            filters.priceRange[0] > 0 ||
            filters.priceRange[1] < 200) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.categories.map((category) => (
                <Badge key={`badge-category-${category}`} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("categories", category)} />
                </Badge>
              ))}

              {filters.frameShapes.map((shape) => (
                <Badge key={`badge-shape-${shape}`} variant="secondary" className="flex items-center gap-1">
                  {shape}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("frameShapes", shape)} />
                </Badge>
              ))}

              {filters.materials.map((material) => (
                <Badge key={`badge-material-${material}`} variant="secondary" className="flex items-center gap-1">
                  {material}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("materials", material)} />
                </Badge>
              ))}

              {filters.colors.map((color) => (
                <Badge key={`badge-color-${color}`} variant="secondary" className="flex items-center gap-1">
                  {color}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("colors", color)} />
                </Badge>
              ))}

              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handlePriceChange([0, 200])} />
                </Badge>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="No products found"
                width={120}
                height={120}
                className="mb-6 opacity-50"
              />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Card className="overflow-hidden border-2 border-transparent transition-all hover:border-violet-300">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {product.isNew && <Badge className="absolute right-2 top-2 bg-violet-600">New</Badge>}
                      <div
                        className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/60 transition-opacity duration-300 ${hoveredProduct === product.id ? "opacity-100" : "opacity-0"}`}
                      >
                        <Button size="sm" variant="secondary" className="h-9 w-9 rounded-full p-0">
                          <ShoppingCart className="h-4 w-4" />
                          <span className="sr-only">Add to cart</span>
                        </Button>
                        <Button asChild size="sm" variant="secondary" className="h-9 w-9 rounded-full p-0">
                          <Link href={`/virtual-try-on/${product.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Try on</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="font-semibold">${product.price}</div>
                      <div className="flex gap-1">
                        {product.colors.map((color, i) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
