"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-violet-500 to-fuchsia-500">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                See the World in Style with Our Premium Glasses
              </h1>
              <p className="max-w-[600px] text-white md:text-xl">
                Discover our collection of high-quality eyewear and try them on virtually before you buy.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="bg-white text-violet-600 hover:bg-gray-100">
                <Link href="/products">Shop Collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                <Link href="/virtual-try-on" className="flex items-center gap-1">
                  Try Glasses Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <motion.div
            className="relative h-[300px] lg:h-[400px] xl:h-[600px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                rotate: isHovered ? [0, -5, 5, 0] : 0,
                transition: { duration: 1, repeat: isHovered ? Number.POSITIVE_INFINITY : 0 },
              }}
            >
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Stylish glasses"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
