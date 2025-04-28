"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft, Printer } from "lucide-react"

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

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState(true)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real app, you would fetch the order from your API using params.id
        // For this demo, we'll use mock data
        const mockOrder: Order = {
          id: params.id as string,
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
        }
        
        setOrder(mockOrder)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingOrder(false)
      }
    }

    if (user && params.id) {
      fetchOrder()
    }
  }, [user, params.id, toast])

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

  const printInvoice = (order: Order) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print the invoice.",
        variant: "destructive",
      })
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              color: #333;
              background-color: #fff;
            }
            .invoice {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: 0 auto;
              background-color: white;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #2B5741;
            }
            .logo-container {
              display: flex;
              align-items: center;
            }
            .logo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              border: 3px solid #00467f;
              background-color: #36e8d5;
              margin-right: 15px;
            }
            .logo-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(3, 1fr);
              width: 40px;
              height: 40px;
              gap: 2px;
            }
            .logo-cell {
              background-color: red;
            }
            .logo-cell.empty {
              background-color: transparent;
            }
            .logo-cell.rounded-tr {
              border-top-right-radius: 100%;
            }
            .logo-cell.rounded-bl {
              border-bottom-left-radius: 100%;
            }
            .company-info {
              flex: 1;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #2B5741;
              margin: 0 0 10px 0;
            }
            .company-details {
              font-size: 14px;
              color: #666;
            }
            .invoice-info {
              text-align: right;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              color: #2B5741;
              margin: 0 0 10px 0;
            }
            .invoice-number {
              font-size: 16px;
              margin: 0 0 5px 0;
            }
            .invoice-date {
              font-size: 14px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              color: #2B5741;
              margin-bottom: 10px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .divider {
              display: flex;
              gap: 20px;
            }
            .divider > div {
              flex: 1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background-color: white;
            }
            th {
              background-color: #2B5741;
              color: white;
              text-align: left;
              padding: 12px;
              font-size: 14px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #ddd;
              font-size: 14px;
              vertical-align: top;
            }
            .items-table th, .items-table td {
              text-align: left;
            }
            .items-table th:nth-child(2), .items-table td:nth-child(2) {
              text-align: center;
            }
            .items-table th:nth-child(3), .items-table td:nth-child(3),
            .items-table th:nth-child(4), .items-table td:nth-child(4) {
              text-align: right;
            }
            .total-section {
              margin-top: 30px;
              padding-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .total-table {
              width: 300px;
            }
            .total-table td {
              padding: 8px 12px;
            }
            .total-table tr:last-child {
              font-weight: bold;
              font-size: 16px;
              color: #2B5741;
              border-top: 2px solid #2B5741;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .terms-title {
              font-size: 16px;
              color: #2B5741;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .terms-list {
              margin: 0;
              padding-left: 20px;
              font-size: 14px;
              color: #666;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .invoice {
                width: 100%;
                min-height: auto;
                padding: 20mm;
                margin: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="logo-container">
                <div class="logo">
                  <div class="logo-grid">
                    <div class="logo-cell empty"></div>
                    <div class="logo-cell"></div>
                    <div class="logo-cell rounded-tr"></div>
                    <div class="logo-cell"></div>
                    <div class="logo-cell"></div>
                    <div class="logo-cell"></div>
                    <div class="logo-cell rounded-bl"></div>
                    <div class="logo-cell"></div>
                    <div class="logo-cell empty"></div>
                  </div>
                </div>
                <div class="company-info">
                  <div class="company-name">QUARDCUBELABS</div>
                  <div class="company-details">
                    P.O. Box 33761, Dar es Salaam, Tanzania<br>
                    Mobile: +255(0) 746 624 875<br>
                    Email: info@quardcubelabs.com
                  </div>
                </div>
              </div>
              <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${order.id}</div>
                <div class="invoice-date">Date: ${formatDate(order.created_at)}</div>
                <div class="invoice-date">Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
              </div>
            </div>

            <div class="divider">
              <div class="section">
                <div class="section-title">Bill To</div>
                <table>
                  <tr>
                    <td><strong>Customer:</strong></td>
                    <td>${order.customer_name}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>${user?.email || 'N/A'}</td>
                  </tr>
                </table>
              </div>
              <div class="section">
                <div class="section-title">Ship To</div>
                <table>
                  <tr>
                    <td><strong>Address:</strong></td>
                    <td>
                      ${order.shipping_address.street}<br>
                      ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
                      ${order.shipping_address.country}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Method:</strong></td>
                    <td>Office Pickup</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Order Details</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 40%">Product</th>
                    <th style="width: 20%">Quantity</th>
                    <th style="width: 20%">Unit Price</th>
                    <th style="width: 20%">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>TZS ${item.price.toLocaleString()}</td>
                      <td>TZS ${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <table class="total-table">
                <tr>
                  <td>Subtotal:</td>
                  <td style="text-align: right">TZS ${order.total.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td style="text-align: right">TZS 0</td>
                </tr>
                <tr>
                  <td>Tax (18% VAT):</td>
                  <td style="text-align: right">Included</td>
                </tr>
                <tr>
                  <td>Total:</td>
                  <td style="text-align: right">TZS ${order.total.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <div class="terms-title">Terms & Conditions</div>
              <ol class="terms-list">
                <li>Goods are shipped upon confirmation of 100% payment</li>
                <li>Terms & conditions shall apply in handling, processing and shipping of the purchased goods</li>
                <li>All payments should be made through the designated payment methods of QUARDCUBELABS</li>
                <li>For any inquiries, please contact our support team at support@quardcubelabs.com</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    // Wait for images to load before printing
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  if (isLoading || isLoadingOrder) {
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

  if (!order) {
    return (
      <main className="min-h-screen bg-teal text-navy">
        <div className="pattern-grid fixed inset-0 pointer-events-none"></div>
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center">Order not found</div>
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="hover:bg-navy/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
                <h1 className="text-3xl font-bold">Order Details</h1>
              </div>
              <Button
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-navy hover:bg-navy/90 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-navy/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {order.id}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(order.created_at)}</p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {order.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {user?.email}</p>
                    <p><span className="font-medium">Address:</span></p>
                    <div className="pl-4">
                      <p>{order.shipping_address.street}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-navy text-white">
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/10">
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-navy/5">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold">
                        <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Print Invoice Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-[#36e8d5]/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#36e8d5] flex items-center justify-center p-1.5">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* First column */}
                  <rect x="10" y="40" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                  <rect x="10" y="70" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                  {/* Second column */}
                  <rect x="40" y="10" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                  <rect x="40" y="40" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                  <rect x="40" y="70" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                  {/* Third column */}
                  <rect x="70" y="10" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                  <rect x="70" y="40" width="20" height="20" stroke="#ff0000" strokeWidth="2" fill="none" rx="3" ry="3" />
                </svg>
              </div>
              Print Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-navy">Are you sure you want to print the invoice for order {order.id}?</p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsPrintModalOpen(false)}
                className="border-[#36e8d5] hover:bg-[#36e8d5]/10 text-navy"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsPrintModalOpen(false)
                  printInvoice(order)
                }}
                className="bg-[#36e8d5] hover:bg-[#36e8d5]/90 text-navy"
              >
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
} 