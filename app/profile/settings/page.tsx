"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Check, Bell, Lock, Mail, Eye, EyeOff } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading, signOut } = useAuth()

  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name: string) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      // In a real app, you would call an API to change the password
      // For this demo, we'll simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      })
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while changing your password.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      // In a real app, you would call an API to save the settings
      // For this demo, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Your settings have been saved successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving your settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (isLoading) {
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
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Account Settings</h1>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-navy/20 p-8">
              <div className="space-y-8">
                {/* Notification Settings */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive notifications about your orders and account</p>
                      </div>
                      <Switch 
                        id="emailNotifications" 
                        checked={settings.emailNotifications} 
                        onCheckedChange={() => handleToggle("emailNotifications")} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingEmails" className="font-medium">Marketing Emails</Label>
                        <p className="text-sm text-gray-600">Receive emails about new products and promotions</p>
                      </div>
                      <Switch 
                        id="marketingEmails" 
                        checked={settings.marketingEmails} 
                        onCheckedChange={() => handleToggle("marketingEmails")} 
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Security Settings */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Security Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Switch 
                        id="twoFactorAuth" 
                        checked={settings.twoFactorAuth} 
                        onCheckedChange={() => handleToggle("twoFactorAuth")} 
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={settings.currentPassword}
                              onChange={handleChange}
                              className="bg-white/70 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={settings.newPassword}
                              onChange={handleChange}
                              className="bg-white/70 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={settings.confirmPassword}
                              onChange={handleChange}
                              className="bg-white/70 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <Button type="submit" className="bg-navy hover:bg-navy/90 text-white" disabled={isSaving}>
                          {isSaving ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Email Settings */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-white/70 opacity-70"
                      />
                      <p className="text-xs text-gray-500 mt-1">To change your email, please contact support</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Danger Zone */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Danger Zone
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-medium text-red-700 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </Button>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button 
                    onClick={handleSaveSettings} 
                    className="bg-navy hover:bg-navy/90 text-white w-full"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 