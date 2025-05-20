import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// Product types
export type Product = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  modelImage?: string
  isNew?: boolean
  colors: string[]
  frameShape: string
  material: string
  stock: number
  created_at: string
}

export type Order = {
  id: number
  user_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shipping_address: Address
  billing_address: Address
  payment_method: string
  created_at: string
}

export type OrderItem = {
  product_id: number
  quantity: number
  price: number
  product: Product
}

export type Address = {
  first_name: string
  last_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}

export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: "customer" | "admin"
  created_at: string
}

// Database functions
export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data as Product[]
}

export async function getProductById(id: number) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    return null
  }

  return data as Product
}

export async function createProduct(product: Omit<Product, "id" | "created_at">) {
  const { data, error } = await supabase.from("products").insert([product]).select()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return data[0] as Product
}

export async function updateProduct(id: number, updates: Partial<Product>) {
  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select()

  if (error) {
    console.error(`Error updating product with id ${id}:`, error)
    return null
  }

  return data[0] as Product
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error)
    return false
  }

  return true
}

export async function getOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data as Order[]
}

export async function getOrderById(id: number) {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching order with id ${id}:`, error)
    return null
  }

  return data as Order
}

export async function createOrder(order: Omit<Order, "id" | "created_at">) {
  const { data, error } = await supabase.from("orders").insert([order]).select()

  if (error) {
    console.error("Error creating order:", error)
    return null
  }

  return data[0] as Order
}

export async function updateOrder(id: number, updates: Partial<Order>) {
  const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select()

  if (error) {
    console.error(`Error updating order with id ${id}:`, error)
    return null
  }

  return data[0] as Order
}

export async function getUsers() {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data as User[]
}

export async function getUserById(id: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching user with id ${id}:`, error)
    return null
  }

  return data as User
}
