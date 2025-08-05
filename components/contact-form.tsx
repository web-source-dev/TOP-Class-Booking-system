"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  specialInstructions: string
  preferredContact: "email" | "phone" | "text"
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<ContactFormData>
  isEmailFromWix?: boolean
}

export function ContactForm({ onSubmit, isLoading = false, initialData, isEmailFromWix = false }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    specialInstructions: initialData?.specialInstructions || "",
    preferredContact: initialData?.preferredContact || "email",
  })

  const [errors, setErrors] = useState<Partial<ContactFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when initialData changes (e.g., when Wix message arrives)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {}

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLElement) {
      const form = e.target.closest("form")
      const inputs = form?.querySelectorAll("input, textarea, select")
      const index = Array.from(inputs || []).indexOf(e.target as Element)
      const nextInput = inputs?.[index + 1] as HTMLElement
      if (nextInput) {
        e.preventDefault()
        nextInput.focus()
      }
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <User className="h-6 w-6 text-tc-vibrant-blue" />
          <h1 className="text-3xl font-bold text-gray-900">Contact Information</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Please provide your contact details so we can confirm your booking and reach you if needed.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Personal Information */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Personal Information
                </h2>
                <p className="text-gray-600 text-sm">
                  Your name and contact details
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(errors.firstName && "border-red-500 focus:border-red-500")}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <Alert variant="destructive" className="py-1">
                      <AlertDescription id="firstName-error" className="text-xs">{errors.firstName}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(errors.lastName && "border-red-500 focus:border-red-500")}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <Alert variant="destructive" className="py-1">
                      <AlertDescription id="lastName-error" className="text-xs">{errors.lastName}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4 text-tc-vibrant-blue" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      errors.email && "border-red-500 focus:border-red-500",
                      isEmailFromWix && formData.email && "bg-green-50 border-green-200"
                    )}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-required="true"
                    disabled={isSubmitting || (isEmailFromWix && !!formData.email)}
                    readOnly={isEmailFromWix && !!formData.email}
                  />
                  {errors.email && (
                    <Alert variant="destructive" className="py-1">
                      <AlertDescription id="email-error" className="text-xs">{errors.email}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-4 w-4 text-tc-vibrant-blue" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(errors.phone && "border-red-500 focus:border-red-500")}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <Alert variant="destructive" className="py-1">
                      <AlertDescription id="phone-error" className="text-xs">{errors.phone}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Address Information */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Service Address
                </h2>
                <p className="text-gray-600 text-sm">
                  Where we'll be providing the cleaning service
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-tc-vibrant-blue" />
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(errors.address && "border-red-500 focus:border-red-500")}
                    aria-describedby={errors.address ? "address-error" : undefined}
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                  {errors.address && (
                    <Alert variant="destructive" className="py-1">
                      <AlertDescription id="address-error" className="text-xs">{errors.address}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(errors.city && "border-red-500 focus:border-red-500")}
                      aria-describedby={errors.city ? "city-error" : undefined}
                      aria-required="true"
                      disabled={isSubmitting}
                    />
                    {errors.city && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription id="city-error" className="text-xs">{errors.city}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(errors.state && "border-red-500 focus:border-red-500")}
                      aria-describedby={errors.state ? "state-error" : undefined}
                      aria-required="true"
                      disabled={isSubmitting}
                    />
                    {errors.state && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription id="state-error" className="text-xs">{errors.state}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm font-medium">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(errors.zipCode && "border-red-500 focus:border-red-500")}
                      aria-describedby={errors.zipCode ? "zipCode-error" : undefined}
                      aria-required="true"
                      disabled={isSubmitting}
                    />
                    {errors.zipCode && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription id="zipCode-error" className="text-xs">{errors.zipCode}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Communication Preferences - Full Width */}
      <div className="mt-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Communication Preferences
              </h2>
              <p className="text-gray-600 text-sm">
                How you'd like us to contact you
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preferredContact" className="text-sm font-medium">
                  Preferred Contact Method
                </Label>
                <Select
                  value={formData.preferredContact}
                  onValueChange={(value: "email" | "phone" | "text") => handleInputChange("preferredContact", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions" className="text-sm font-medium flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-tc-vibrant-blue" />
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  placeholder="Any special instructions for our team..."
                  className="min-h-[100px] resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue text-white py-3 text-lg font-semibold rounded-lg"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Review"
          )}
        </Button>
      </div>
    </div>
  )
} 