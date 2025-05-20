"use client"

import Link from "next/link"
import { ChevronLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sample3DModel } from "@/components/sample-3d-model"

export default function SampleModelPage() {
  // Function to create and download a sample GLB file
  const downloadSampleGLB = () => {
    // This is just a placeholder - in a real app, you would have a real GLB file to download
    alert(
      "In a real implementation, this would download a sample GLB file. For now, please use your own 3D model file.",
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Sample 3D Model</h1>
        <p className="text-muted-foreground mt-1">Example of a 3D glasses model for virtual try-on</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Sample 3D Glasses</CardTitle>
            <CardDescription>This is what a 3D model looks like when rendered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <Sample3DModel className="h-[400px]" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={downloadSampleGLB} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Sample GLB File
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3D Model Requirements</CardTitle>
            <CardDescription>Guidelines for creating and uploading 3D models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">File Format</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Use GLB format (preferred) or GLTF</li>
                <li>Keep file size under 5MB for optimal performance</li>
                <li>Ensure textures are embedded in the GLB file</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Model Structure</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Center the model at the origin (0,0,0)</li>
                <li>Orient the model to face forward (negative Z-axis)</li>
                <li>Scale the model appropriately (typically 1 unit = 1 meter)</li>
                <li>Use a simple hierarchy with minimal nested groups</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Optimization</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Reduce polygon count (aim for under 50k triangles)</li>
                <li>Use compressed textures (WebP or JPEG) at reasonable sizes (1024x1024 max)</li>
                <li>Remove unnecessary animations or bones</li>
                <li>Test your model in a web viewer before uploading</li>
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Creating 3D Models</h3>
              <p className="text-sm text-amber-700 mb-2">
                You can create 3D models using software like Blender (free), Maya, or 3DS Max. Export your model as GLB
                format for the best compatibility.
              </p>
              <p className="text-sm text-amber-700">
                If you don't have your own 3D models, you can find free or paid models on sites like Sketchfab,
                TurboSquid, or CGTrader.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="https://docs.pmnd.rs/react-three-fiber/getting-started/introduction" target="_blank">
                Three.js Documentation
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/models/new">Upload Your Model</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
