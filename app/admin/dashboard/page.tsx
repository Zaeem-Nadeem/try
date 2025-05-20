"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box, Camera, DollarSign, Package, Users, PlusCircle, Upload, BarChart3 } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseClient } from "@/lib/supabase-client"
import { AdminGuide } from "@/components/admin-guide"
import { SetupStorage } from "@/components/setup-storage"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    products: 0,
    models: 0,
    customers: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        // Get product count
        const { count: productCount, error: productError } = await supabaseClient
          .from("products")
          .select("*", { count: "exact", head: true })

        if (productError) throw productError

        // Get model count
        const { count: modelCount, error: modelError } = await supabaseClient
          .from("models")
          .select("*", { count: "exact", head: true })

        if (modelError) throw modelError

        setStats({
          products: productCount || 0,
          models: modelCount || 0,
          customers: 128, // Placeholder
          revenue: 12580, // Placeholder
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your glasses store</p>
        </div>
      </div>

      {/* Storage Setup Component */}
      <SetupStorage />

      {/* Admin Guide */}
      <AdminGuide />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.products}</div>
            <p className="text-xs text-muted-foreground">Total products in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">3D Models</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.models}</div>
            <p className="text-xs text-muted-foreground">Products with virtual try-on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.customers}</div>
            <p className="text-xs text-muted-foreground">Active users this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${loading ? "..." : stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total sales this month</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-violet-500" />
              Product Management
            </CardTitle>
            <CardDescription>Add and manage your glasses products</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add new products, update existing ones, and manage your inventory.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/admin/products")}>
              View All Products
            </Button>
            <Button onClick={() => router.push("/admin/products/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-violet-500" />
              3D Models
            </CardTitle>
            <CardDescription>Manage virtual try-on models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload 3D models for your products to enable virtual try-on functionality.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/admin/models")}>
              View All Models
            </Button>
            <Button onClick={() => router.push("/admin/models/new")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Model
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Analytics
            </CardTitle>
            <CardDescription>View store performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track sales, customer engagement, and virtual try-on usage.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/admin")}>
              View Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
