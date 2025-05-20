"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Upload, CuboidIcon as CubeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { ModelViewer } from "@/components/model-viewer"

type Product = {
  id: number
  name: string
  category: string
  image_url: string
}

type Model = {
  id: number
  product_id: number
  model_url: string
  thumbnail_url: string
  created_at: string
  product: Product
}

export default function ModelsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all-models")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Fetch products that don't have 3D models yet
        const { data: productsData, error: productsError } = await supabaseClient
          .from("products")
          .select("id, name, category, image_url")

        if (productsError) throw productsError

        setProducts(productsData || [])

        // Fetch existing models with their related products
        const { data: modelsData, error: modelsError } = await supabaseClient.from("models").select(`
            id, 
            product_id, 
            model_url, 
            thumbnail_url, 
            created_at,
            product:products(id, name, category, image_url)
          `)

        if (modelsError) throw modelsError

        setModels(modelsData || [])
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load model data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Filter products that don't have models yet
  const productsWithoutModels = products.filter((product) => !models.some((model) => model.product_id === product.id))

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDeleteModel = async (id: number) => {
    if (confirm("Are you sure you want to delete this 3D model? This action cannot be undone.")) {
      try {
        // Get model to get URL
        const { data: modelData, error: fetchError } = await supabaseClient
          .from("models")
          .select("model_url, thumbnail_url")
          .eq("id", id)
          .single()

        if (fetchError) throw fetchError

        // Delete the actual files from storage
        if (modelData.model_url) {
          const modelFilePath = modelData.model_url.split("/").pop()
          if (modelFilePath) {
            await supabaseClient.storage.from("3d-models").remove([modelFilePath])
          }
        }

        if (modelData.thumbnail_url) {
          const thumbnailFilePath = modelData.thumbnail_url.split("/").pop()
          if (thumbnailFilePath) {
            await supabaseClient.storage.from("3d-models").remove([thumbnailFilePath])
          }
        }

        // Delete from database
        const { error: deleteError } = await supabaseClient.from("models").delete().eq("id", id)

        if (deleteError) throw deleteError

        // Update local state
        setModels(models.filter((model) => model.id !== id))

        toast({
          title: "Model deleted",
          description: "The 3D model has been successfully deleted.",
        })
      } catch (error) {
        console.error("Error deleting model:", error)
        toast({
          title: "Error",
          description: "Failed to delete 3D model. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href="/admin" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">3D Models</h1>
          <p className="text-muted-foreground mt-1">Manage 3D models for virtual try-on</p>
        </div>
        <Button onClick={() => router.push("/admin/models/new")} className="shrink-0">
          <Upload className="mr-2 h-4 w-4" />
          Upload New Model
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all-models">All Models</TabsTrigger>
          <TabsTrigger value="products-without-models">Products Without Models</TabsTrigger>
        </TabsList>

        <TabsContent value="all-models">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <CubeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No 3D Models Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't uploaded any 3D models yet. Add your first model to enable virtual try-on.
              </p>
              <Button onClick={() => router.push("/admin/models/new")}>Upload First Model</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <Card key={model.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {model.thumbnail_url ? (
                      <img
                        src={model.thumbnail_url || "/placeholder.svg"}
                        alt={`${model.product.name} model`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ModelViewer modelUrl={model.model_url} className="h-full" />
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{model.product.name}</CardTitle>
                    <CardDescription>Added on {formatDate(model.created_at)}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex justify-between">
                    <span className="text-sm text-muted-foreground">{model.product.category}</span>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/virtual-try-on/${model.product_id}`)}
                      >
                        Preview
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteModel(model.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products-without-models">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : productsWithoutModels.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <div className="h-12 w-12 mx-auto text-green-500 mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">All Products Have 3D Models</h3>
              <p className="text-muted-foreground">
                Great job! All of your products have 3D models for virtual try-on.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsWithoutModels.map((product) => (
                <Card key={product.id} className="overflow-hidden border-dashed">
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Button
                        onClick={() => router.push(`/admin/models/new?productId=${product.id}`)}
                        variant="secondary"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Add 3D Model
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <span className="text-sm text-amber-500 font-medium flex items-center">
                      <CubeIcon className="h-4 w-4 mr-1" />
                      Missing 3D model
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
