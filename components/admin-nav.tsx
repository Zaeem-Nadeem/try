"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Camera,
  CuboidIcon as CubeIcon,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Video,
} from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "3D Models",
      href: "/admin/models",
      icon: Camera,
    },
    {
      name: "Sample Model",
      href: "/admin/sample-model",
      icon: CubeIcon,
    },
    {
      name: "Webcam Test",
      href: "/webcam-test",
      icon: Video,
    },
    {
      name: "Simple Webcam",
      href: "/simple-webcam",
      icon: Video,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
            isActive(item.href)
              ? "bg-violet-50 text-violet-900"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
