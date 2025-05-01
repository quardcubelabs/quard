"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingBag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createOrder } from "@/lib/actions"
import type { Product } from "@/lib/product-actions"
import { useOrders } from "@/contexts/order-context"

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { refreshOrderCount } = useOrders()

  const handleOrder = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place an order",
        variant: "destructive",
      })
      router.push('/auth/login')
      return
    }
    
    setIsLoading(true)
    
    try {
      const userData = {
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        email: user.email,
        street: user.user_metadata?.street || "",
        city: user.user_metadata?.city || "",
        state: user.user_metadata?.state || "",
        country: user.user_metadata?.country || "Tanzania",
        postal_code: user.user_metadata?.postal_code || "",
      }
      
      const result = await createOrder(product.id, 1, user.id, userData)
      
      if (result.success) {
        toast({
          title: "Order placed",
          description: "Your order has been successfully placed",
        })
        
        await refreshOrderCount()
        
        router.push(`/orders/${result.orderId}`)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to place order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full rounded-2xl border-2 border-navy/20 bg-white/50 overflow-hidden transition-all duration-300 hover:border-navy hover:shadow-lg">
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-brand-red text-white border-0">{product.category}</Badge>
          </div>

          {/* Quick actions overlay */}
          <div
            className={`absolute inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex gap-1 sm:gap-2">
              <Button
                size="sm"
                className="bg-white text-navy hover:bg-white/90 rounded-full text-xs sm:text-sm"
                onClick={handleOrder}
                disabled={isLoading || product.stock <= 0}
              >
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Order Now
              </Button>
              <Link href={`/shop/${product.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/20 rounded-full"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-2">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-current" : "fill-none"}`} />
              ))}
            </div>
            <span className="text-sm text-navy/70 ml-2">{product.rating.toFixed(1)}</span>
          </div>

          <h3 className="text-lg font-bold mb-2 text-navy group-hover:text-brand-red transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-navy/70 mb-4 text-sm line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-navy">${Number(product.price).toFixed(2)}</span>
            <span
              className={`text-xs ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-amber-500" : "text-red-500"}`}
            >
              {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
