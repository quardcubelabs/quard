"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"

type CartItem = {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
  }
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  isLoading: boolean
  addItem: (product: any, quantity?: number) => void
  updateItemQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearItems: () => void
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
        setItemCount(parsedCart.reduce((total: number, item: CartItem) => total + item.quantity, 0))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
    setItemCount(items.reduce((total, item) => total + item.quantity, 0))
  }, [items])

  const addItem = (product: any, quantity = 1) => {
    setIsLoading(true)
    try {
      setItems((prevItems) => {
        // Check if product is already in cart
        const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id)

        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += quantity
          return updatedItems
        } else {
          // Add new item
          return [...prevItems, { product, quantity }]
        }
      })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateItemQuantity = (productId: number, quantity: number) => {
    setIsLoading(true)
    try {
      setItems((prevItems) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          return prevItems.filter((item) => item.product.id !== productId)
        } else {
          // Update quantity
          return prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        }
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (productId: number) => {
    setIsLoading(true)
    try {
      setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearItems = () => {
    setIsLoading(true)
    try {
      setItems([])
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        addItem,
        updateItemQuantity,
        removeItem,
        clearItems,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
