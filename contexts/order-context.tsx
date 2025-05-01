"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@supabase/supabase-js"

type OrderContextType = {
  orderCount: number
  refreshOrderCount: () => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderCount, setOrderCount] = useState(0)
  const { user } = useAuth()

  const fetchOrderCount = async () => {
    try {
      if (!user) {
        setOrderCount(0)
        return
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Count orders for the current user
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error fetching order count:", error)
        return
      }
      
      setOrderCount(count || 0)
    } catch (error) {
      console.error("Error fetching order count:", error)
    }
  }

  // Fetch order count when user changes
  useEffect(() => {
    fetchOrderCount()
  }, [user])

  // Function to manually refresh the order count
  const refreshOrderCount = async () => {
    await fetchOrderCount()
  }

  return (
    <OrderContext.Provider
      value={{
        orderCount,
        refreshOrderCount
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
} 