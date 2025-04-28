"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import PaymentMethodSelector from "@/components/shop/payment-method-selector"
import MobilePaymentModal from "@/components/shop/mobile-payment-modal"
import { checkout } from "@/lib/actions"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, updateItemQuantity, removeItem, clearItems, getCartTotal } = useCart()

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [showMobilePaymentModal, setShowMobilePaymentModal] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // If mobile payment is selected, show the mobile payment modal
      if (paymentMethod === "mobile") {
        setShowMobilePaymentModal(true)
        setIsCheckingOut(false)
        return
      }

      // Create form data for checkout
      const formData = new FormData()
      Object.entries(shippingInfo).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Call the server action
      const result = await checkout(formData)

      if (result.success) {
        // Generate a random order ID
        setOrderId(result.orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
        setCheckoutSuccess(true)

        // Clear the cart
        clearItems()

        toast({
          title: "Order Placed",
          description: "Your order has been successfully placed!",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to process your order. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleMobilePaymentComplete = () => {
    setShowMobilePaymentModal(false)

    // Generate a random order ID
    const generatedOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    setOrderId(generatedOrderId)
    setCheckoutSuccess(true)

    // Clear the cart
    clearItems()

    toast({
      title: "Order Placed",
      description: "Your mobile payment was successful and your order has been placed!",
    })
  }

  const handleMobilePaymentCancel = () => {
    setShowMobilePaymentModal(false)
    setIsCheckingOut(false)

    toast({
      title: "Payment Cancelled",
      description: "Your mobile payment was cancelled.",
      variant: "destructive",
    })
  }

  if (checkoutSuccess) {
    return (
      <main className="min-h-screen bg-teal text-navy">
        <div className="pattern-grid fixed inset-0 pointer-events-none"></div>
        <Navbar />

        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-navy/80 mb-6">
                Thank you for your purchase. Your order has been confirmed and will be shipped shortly.
              </p>
              <p className="text-navy/80 mb-8">
                Order ID: <span className="font-medium">{orderId}</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-navy hover:bg-navy/90 text-white rounded-full"
                  onClick={() => router.push("/shop")}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  className="border-navy text-navy hover:bg-navy/10 rounded-full"
                  onClick={() => router.push("/")}
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-teal text-navy">
      <div className="pattern-grid fixed inset-0 pointer-events-none"></div>
      <Navbar />

      {showMobilePaymentModal && (
        <MobilePaymentModal
          amount={getCartTotal() * 1.08}
          onComplete={handleMobilePaymentComplete}
          onCancel={handleMobilePaymentCancel}
        />
      )}

      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Your Cart</h1>
            <p className="text-base sm:text-lg md:text-xl text-navy/80 max-w-3xl mx-auto">
              Review your items and proceed to checkout
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white/50 rounded-2xl border-2 border-navy/20 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Shopping Cart ({items.length} items)</h2>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => clearItems()}
                      >
                        Clear Cart
                      </Button>
                    </div>

                    <div className="divide-y divide-navy/10">
                      {items.map((item) => (
                        <div key={item.product.id} className="py-4 sm:py-6 flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between">
                              <Link
                                href={`/shop/${item.product.id}`}
                                className="font-medium text-navy hover:text-brand-red transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>

                            <p className="text-sm text-navy/70 mb-2">{item.product.category}</p>

                            <div className="flex justify-between items-center">
                              <div className="flex items-center border border-navy/20 rounded-full overflow-hidden">
                                <button
                                  onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 text-navy hover:bg-navy/10"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 text-navy hover:bg-navy/10"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Link
                        href="/shop"
                        className="inline-flex items-center text-navy hover:text-brand-red transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white/50 rounded-2xl border-2 border-navy/20 overflow-hidden sticky top-32">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-navy/70">Subtotal</span>
                        <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy/70">Shipping</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-navy/70">Tax</span>
                        <span className="font-medium">${(getCartTotal() * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-navy/10 pt-4 flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${(getCartTotal() * 1.08).toFixed(2)}</span>
                      </div>
                    </div>

                    <form onSubmit={handleCheckout}>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={shippingInfo.name}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 rounded-md border border-navy/20 bg-white/70 focus:outline-none focus:border-navy"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 rounded-md border border-navy/20 bg-white/70 focus:outline-none focus:border-navy"
                          />
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium mb-1">
                            Shipping Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={shippingInfo.address}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 rounded-md border border-navy/20 bg-white/70 focus:outline-none focus:border-navy"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={shippingInfo.city}
                              onChange={handleInputChange}
                              required
                              className="w-full p-2 rounded-md border border-navy/20 bg-white/70 focus:outline-none focus:border-navy"
                            />
                          </div>
                          <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              id="postalCode"
                              name="postalCode"
                              value={shippingInfo.postalCode}
                              onChange={handleInputChange}
                              required
                              className="w-full p-2 rounded-md border border-navy/20 bg-white/70 focus:outline-none focus:border-navy"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium mb-1">
                            Country
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={shippingInfo.country}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 rounded-md border border-navy/20 bg-white/70 focus:outline-none focus:border-navy"
                          >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Payment Method</h3>
                        <PaymentMethodSelector selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-navy hover:bg-navy/90 text-white rounded-full py-6"
                        disabled={isCheckingOut}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {isCheckingOut ? "Processing..." : "Complete Purchase"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-navy/10 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-navy/50" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-navy/70 mb-8">Looks like you haven't added any products to your cart yet.</p>

              <Button className="bg-navy hover:bg-navy/90 text-white rounded-full" onClick={() => router.push("/shop")}>
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
