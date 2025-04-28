"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, Search } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

type OrderItem = {
  id: number
  name: string
  quantity: number
  price: number
  image: string
}

type Order = {
  id: string
  customer_name: string
  created_at: string
  status: "pending" | "completed" | "cancelled"
  total: number
  items: OrderItem[]
  shipping_address: {
    street: string
    city: string
    state: string
    country: string
    postal_code: string
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch orders from your API
        // For this demo, we'll use mock data
        const mockOrders: Order[] = [
          {
            id: "ORD-001",
            customer_name: "John Doe",
            created_at: "2024-04-16",
            status: "completed",
            total: 299.99,
            items: [
              {
                id: 1,
                name: "Premium Widget",
                quantity: 2,
                price: 149.99,
                image: "/images/products/widget.jpg"
              }
            ],
            shipping_address: {
              street: "123 Main St",
              city: "New York",
              state: "NY",
              country: "United States",
              postal_code: "10001"
            }
          },
          {
            id: "ORD-002",
            customer_name: "Jane Smith",
            created_at: "2024-04-15",
            status: "pending",
            total: 199.99,
            items: [
              {
                id: 2,
                name: "Super Gadget",
                quantity: 1,
                price: 199.99,
                image: "/images/products/gadget.jpg"
              }
            ],
            shipping_address: {
              street: "456 Oak Ave",
              city: "Los Angeles",
              state: "CA",
              country: "United States",
              postal_code: "90001"
            }
          },
          {
            id: "ORD-003",
            customer_name: "Bob Wilson",
            created_at: "2024-04-14",
            status: "cancelled",
            total: 499.99,
            items: [
              {
                id: 3,
                name: "Mega Device",
                quantity: 1,
                price: 499.99,
                image: "/images/products/device.jpg"
              }
            ],
            shipping_address: {
              street: "789 Pine St",
              city: "Chicago",
              state: "IL",
              country: "United States",
              postal_code: "60601"
            }
          }
        ]
        
        setOrders(mockOrders)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingOrders(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user, toast])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
    }).format(amount)
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading || isLoadingOrders) {
    return (
      <main className="min-h-screen bg-teal text-navy">
        <div className="pattern-grid fixed inset-0 pointer-events-none"></div>
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-teal text-navy">
      <div className="pattern-grid fixed inset-0 pointer-events-none"></div>
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">ORDERS MADE</h1>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-navy/20 p-6">
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="relative w-full max-w-xs">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={() => setSelectedStatus("all")}
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  className="bg-navy text-white hover:bg-navy/90"
                >
                  All Orders
                </Button>
                <Button
                  onClick={() => setSelectedStatus("completed")}
                  variant={selectedStatus === "completed" ? "default" : "outline"}
                  className={selectedStatus === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Completed
                </Button>
                <Button
                  onClick={() => setSelectedStatus("pending")}
                  variant={selectedStatus === "pending" ? "default" : "outline"}
                  className={selectedStatus === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Pending
                </Button>
                <Button
                  onClick={() => setSelectedStatus("cancelled")}
                  variant={selectedStatus === "cancelled" ? "default" : "outline"}
                  className={selectedStatus === "cancelled" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Cancelled
                </Button>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-navy text-white">
                      <th className="px-4 py-3 text-left">Order</th>
                      <th className="px-4 py-3 text-left">Customer Name</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/10">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-navy/5">
                        <td className="px-4 py-3">{order.id}</td>
                        <td className="px-4 py-3">{order.customer_name}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="hover:bg-navy/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="outline" className="bg-navy text-white">
                  1
                </Button>
                <Button variant="outline" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 