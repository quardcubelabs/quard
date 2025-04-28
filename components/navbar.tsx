"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import CartIcon from "@/components/cart-icon"
import UserAvatar from "@/components/user-avatar"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to handle protected route navigation
  const handleProtectedNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!user && !isLoading) {
      e.preventDefault()
      window.location.href = "/auth/login"
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-teal/90 backdrop-blur-md shadow-md py-1 sm:py-2 md:py-3"
          : "bg-transparent py-2 sm:py-3 md:py-5",
      )}
    >
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Logo size={isScrolled ? "xs" : "sm"} />
            <span className="font-bold text-lg sm:text-xl tracking-tight text-navy hidden md:inline">
              QUARDCUBELABS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-navy font-medium hover:text-navy/80 transition-colors">
              Services
            </Link>
            <Link href="/shop" className="text-navy font-medium hover:text-navy/80 transition-colors">
              Shop
            </Link>
            <Link 
              href="/orders" 
              className="text-navy font-medium hover:text-navy/80 transition-colors"
              onClick={(e) => handleProtectedNavigation(e, "/orders")}
            >
              Orders
            </Link>
            <Link href="/projects" className="text-navy font-medium hover:text-navy/80 transition-colors">
              Projects
            </Link>
            <Link href="/about" className="text-navy font-medium hover:text-navy/80 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-navy font-medium hover:text-navy/80 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <CartIcon />
            <UserAvatar />
            {!user && !isLoading && (
              <Button
                className="bg-navy hover:bg-navy/90 text-white rounded-full px-6"
                onClick={() => (window.location.href = "/auth/register")}
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button and Cart */}
          <div className="md:hidden flex items-center gap-1 sm:gap-2">
            <CartIcon />
            <div className="mx-2">
              <UserAvatar />
            </div>
            <button className="p-1 text-navy" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <Logo size="sm" />
                <button className="p-1 text-navy" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <Link
                    href="/services"
                    className="block text-navy font-medium hover:text-navy/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="/shop"
                    className="block text-navy font-medium hover:text-navy/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/orders"
                    className="block text-navy font-medium hover:text-navy/80 transition-colors"
                    onClick={(e) => {
                      setIsMenuOpen(false)
                      handleProtectedNavigation(e, "/orders")
                    }}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/projects"
                    className="block text-navy font-medium hover:text-navy/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Projects
                  </Link>
                  <Link
                    href="/about"
                    className="block text-navy font-medium hover:text-navy/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-navy font-medium hover:text-navy/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </nav>
              <div className="p-4 border-t">
                {!user && !isLoading ? (
                  <Button
                    className="w-full bg-navy hover:bg-navy/90 text-white rounded-full"
                    onClick={() => {
                      setIsMenuOpen(false)
                      window.location.href = "/auth/register"
                    }}
                  >
                    Get Started
                  </Button>
                ) : (
                  <div className="flex items-center justify-between">
                    <UserAvatar />
                    <span className="text-sm text-navy">
                      {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
