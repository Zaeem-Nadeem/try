import Link from "next/link"
import { CuboidIcon as CubeIcon, Package, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AdminGuide() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CubeIcon className="h-5 w-5 text-violet-500" />
          Quick Guide: Adding Products with 3D Models
        </CardTitle>
        <CardDescription>Follow these steps to add a new product with 3D model</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 border rounded-lg p-4 bg-violet-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                  1
                </div>
                <h3 className="font-semibold text-lg">Create Product</h3>
              </div>
              <ul className="list-disc pl-10 space-y-2 text-sm">
                <li>
                  Go to <strong>Add Product</strong> page
                </li>
                <li>Fill in product details (name, price, category)</li>
                <li>Upload a product image</li>
                <li>
                  Click <strong>Save Product</strong>
                </li>
              </ul>
              <div className="mt-4 flex justify-end">
                <Button asChild size="sm">
                  <Link href="/admin/products/new">
                    <Package className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex-1 border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">2</div>
                <h3 className="font-semibold text-lg">Upload 3D Model</h3>
              </div>
              <ul className="list-disc pl-10 space-y-2 text-sm">
                <li>
                  Go to <strong>Upload Model</strong> page
                </li>
                <li>Select your product from the dropdown</li>
                <li>Upload your 3D model file (.glb or .gltf)</li>
                <li>
                  Click <strong>Upload 3D Model</strong>
                </li>
              </ul>
              <div className="mt-4 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/models/new">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Model
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">Important Notes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
              <li>The process is split into two steps: first create the product, then add the 3D model</li>
              <li>3D models must be in GLB or GLTF format</li>
              <li>After creating a product, you'll be automatically redirected to the 3D model upload page</li>
              <li>You can also add 3D models to existing products later</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/products">View All Products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/models">View All Models</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
