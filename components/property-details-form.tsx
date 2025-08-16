"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Home, Bed, Bath, Minus, Plus, Square, AlertTriangle, Users, PawPrint, Sparkles, Handshake, PackageIcon, ChevronLeft, ChevronRight, Settings, Info, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/image-upload"

interface PropertyDetails {
  bedrooms: number
  bathrooms: number
  squareFootage: number
  propertyType: "house" | "apartment" | "condo" | "townhouse" | "office" | "commercial"
  serviceType: "full" | "partial"
  condition: "excellent" | "good" | "fair" | "poor"
  floors: number
  pets: boolean
  children: boolean
  specialAreas: string[]
  additionalNotes: string
  // Image uploads
  propertyImages: Array<{
    id: string
    url: string
    publicId: string
    name: string
    size: number
  }>
  // Tier-specific fields
  listingType?: "occupied" | "vacant" | "staging"
  urgency?: "standard" | "rush" | "same-day"
  partnershipTier?: "tier1" | "tier2" | "tier3"
}

interface PropertyDetailsErrors {
  bedrooms?: string
  bathrooms?: string
  squareFootage?: string
  propertyType?: string
  serviceType?: string
  condition?: string
  floors?: string
  pets?: string
  children?: string
  specialAreas?: string
  additionalNotes?: string
  propertyImages?: string
  listingType?: string
  urgency?: string
  partnershipTier?: string
}

interface PropertyDetailsFormProps {
  onSubmit: (data: PropertyDetails) => Promise<void>
  isLoading?: boolean
  selectedTier?: "Basic" | "Concierge" | "Partner"
  selectedPackage?: string
}

const propertyTypes = [
  { value: "house", label: "Single Family House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condominium" },
  { value: "townhouse", label: "Townhouse" },
  { value: "office", label: "Office Space" },
  { value: "commercial", label: "Commercial Property" },
]

const serviceTypes = [
  { value: "full", label: "Full House - Flat Rate" },
  { value: "partial", label: "Partial - Hourly Rate" },
]

const conditions = [
  { value: "excellent", label: "Excellent - Like new" },
  { value: "good", label: "Good - Well maintained" },
  { value: "fair", label: "Fair - Some wear and tear" },
  { value: "poor", label: "Poor - Needs attention" },
]

const basicSpecialAreas = [
  "Kitchen with heavy grease",
  "Bathroom with mold/mildew",
  "Carpet stains",
  "Hardwood floor damage",
  "Move-in/move-out cleaning",
  "Appliance deep cleaning",
  "Cabinet and drawer cleaning",
  "Storage space cleaning",
  "Fridge Deep Clean",
  "Oven Deep Clean",
  "None"
]

const conciergeSpecialAreas = [
  "Kitchen with heavy grease",
  "Bathroom with mold/mildew",
  "Carpet stains",
  "Hardwood floor damage",
  "Window treatments",
  "Ceiling fans",
  "Light fixtures",
  "Appliances",
  "Garage",
  "Basement",
  "Attic",
  "Outdoor areas",
  "Staging areas",
  "Move-in/move-out cleaning",
  "Appliance deep cleaning",
  "Cabinet and drawer cleaning",
  "Storage space cleaning",
  "fridge-deep-clean",
  "oven-deep-clean",
  "None"
]

const partnerSpecialAreas = [
  "Kitchen with heavy grease",
  "Bathroom with mold/mildew",
  "Carpet stains",
  "Hardwood floor damage",
  "Window treatments",
  "Ceiling fans",
  "Light fixtures",
  "Appliances",
  "Garage",
  "Basement",
  "Attic",
  "Outdoor areas",
  "Staging areas",
  "Premium finishes",
  "Luxury appliances",
  "Custom cabinetry",
  "Move-in/move-out cleaning",
  "Appliance deep cleaning",
  "Cabinet and drawer cleaning",
  "Storage space cleaning",
  "Fridge Deep Clean",
  "Oven Deep Clean",
  "None"
]

const listingTypes = [
  { value: "occupied", label: "Occupied - Residents present" },
  { value: "vacant", label: "Vacant - Empty property" },
  { value: "staging", label: "Staging - Furniture/decor present" },
]

const urgencyLevels = [
  { value: "standard", label: "Standard - 2-3 days" },
  { value: "rush", label: "Rush - 24-48 hours" },
  { value: "same-day", label: "Same Day - Premium rate" },
]
const partnershipTiers = [
  { value: "tier1", label: "Tier 1 - Up to 2 cleanings/month" },
  { value: "tier2", label: "Tier 2 - Up to 5 cleanings/month" },
  { value: "tier3", label: "Tier 3 - Unlimited cleanings" },
]

export function PropertyDetailsForm({ onSubmit, isLoading = false, selectedTier = "Basic", selectedPackage }: PropertyDetailsFormProps) {
  const [formData, setFormData] = useState<PropertyDetails>({
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: 0,
    propertyType: "house",
    serviceType: "full",
    condition: "good",
    floors: 1,
    pets: false,
    children: false,
    specialAreas: [],
    additionalNotes: "",
    propertyImages: [],
    listingType: "occupied",
    urgency: "standard",
    partnershipTier: "tier1",
  })

  const [errors, setErrors] = useState<PropertyDetailsErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New sub-stage state
  const [currentSubStage, setCurrentSubStage] = useState<"basic" | "condition" | "service" | "additional">("basic")

  // Sub-stage configuration
  const subStages = [
    {
      id: "basic" as const,
      title: "Basic Property Info",
      description: "Property type and size details",
      icon: Home,
      required: true
    },
    {
      id: "condition" as const,
      title: "Property Condition",
      description: "Condition and lifestyle factors",
      icon: Settings,
      required: true
    },
    {
      id: "service" as const,
      title: "Service Details",
      description: "Service type, special areas, and property images",
      icon: PackageIcon,
      required: true
    },
    {
      id: "additional" as const,
      title: "Additional Information",
      description: "Notes and tier-specific options",
      icon: Info,
      required: false
    }
  ]

  // Get current sub-stage index
  const currentSubStageIndex = subStages.findIndex(stage => stage.id === currentSubStage)

  // Check if current sub-stage is complete
  const isSubStageComplete = (stageId: string): boolean => {
    switch (stageId) {
      case "basic":
        // Basic step requires: property type, service type, bedrooms, bathrooms, square footage, floors
        return !!formData.propertyType && 
               !!formData.serviceType && 
               formData.bedrooms >= 0 && 
               formData.bathrooms >= 0 && 
               formData.squareFootage >= 100 && 
               formData.floors >= 1
      case "condition":
        // Condition step requires: condition rating and lifestyle factors (pets/children)
        return !!formData.condition && 
               formData.floors >= 1 &&
               (formData.pets !== undefined && formData.children !== undefined)
      case "service":
        // Service step requires: service type and at least one special area selection (or "None")
        return !!formData.serviceType && 
               formData.specialAreas.length > 0
      case "additional":
        // Additional step is optional but should have some content if user wants to proceed
        return true // Optional stage - always considered complete
      default:
        return false
    }
  }

  // Get special areas based on tier
  const getSpecialAreas = () => {
    switch (selectedTier) {
      case "Basic":
        return basicSpecialAreas
      case "Concierge":
        return conciergeSpecialAreas
      case "Partner":
        return partnerSpecialAreas
      default:
        return basicSpecialAreas
    }
  }

  // Get tier-specific icon
  const getTierIcon = () => {
    switch (selectedTier) {
      case "Basic":
        return <Home className="h-6 w-6 text-tc-vibrant-blue" />
      case "Concierge":
        return <Sparkles className="h-6 w-6 text-tc-vibrant-blue" />
      case "Partner":
        return <Handshake className="h-6 w-6 text-tc-vibrant-blue" />
      default:
        return <Home className="h-6 w-6 text-tc-vibrant-blue" />
    }
  }

  // Get tier-specific title
  const getTierTitle = () => {
    switch (selectedTier) {
      case "Basic":
        return "Instant Impact Property Details"
      case "Concierge":
        return "Concierge Property Assessment"
      case "Partner":
        return "Partner Property Analysis"
      default:
        return "Property Details"
    }
  }

  // Get tier-specific description
  const getTierDescription = () => {
    switch (selectedTier) {
      case "Basic":
        return "Quick assessment for immediate cleaning needs"
      case "Concierge":
        return "Detailed evaluation for premium service planning"
      case "Partner":
        return "Comprehensive analysis for partnership optimization"
      default:
        return "Help us understand your property"
    }
  }

  const validateForm = (): boolean => {
    const newErrors: PropertyDetailsErrors = {}

    if (formData.bedrooms < 0) newErrors.bedrooms = "Bedrooms must be 0 or more"
    if (formData.bathrooms < 0) newErrors.bathrooms = "Bathrooms must be 0 or more"
    if (formData.squareFootage < 100) newErrors.squareFootage = "Square footage must be at least 100 sq ft"
    if (formData.floors < 1) newErrors.floors = "Must have at least 1 floor"

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
      console.error("Property details submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof PropertyDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const incrementBedrooms = () => {
    handleInputChange("bedrooms", formData.bedrooms + 1)
  }

  const decrementBedrooms = () => {
    if (formData.bedrooms > 0) {
      handleInputChange("bedrooms", formData.bedrooms - 1)
    }
  }

  const incrementBathrooms = () => {
    handleInputChange("bathrooms", formData.bathrooms + 1)
  }

  const decrementBathrooms = () => {
    if (formData.bathrooms > 0) {
      handleInputChange("bathrooms", Math.max(0, formData.bathrooms - 1))
    }
  }

  const incrementFloors = () => {
    handleInputChange("floors", formData.floors + 1)
  }

  const decrementFloors = () => {
    if (formData.floors > 1) {
      handleInputChange("floors", formData.floors - 1)
    }
  }

  const handleSpecialAreaToggle = (area: string) => {
    setFormData(prev => {
      if (area === "None") {
        // If "None" is clicked, clear all other selections and only select "None"
        return {
          ...prev,
          specialAreas: prev.specialAreas.includes("None") ? [] : ["None"]
        }
      } else {
        // If any other area is clicked, remove "None" and toggle the selected area
        const newSpecialAreas = prev.specialAreas.includes(area)
          ? prev.specialAreas.filter(a => a !== area)
          : [...prev.specialAreas.filter(a => a !== "None"), area]
        
        return {
          ...prev,
          specialAreas: newSpecialAreas
        }
      }
    })
  }

  const handleNextSubStage = () => {
    if (currentSubStageIndex < subStages.length - 1) {
      setCurrentSubStage(subStages[currentSubStageIndex + 1].id)
    }
  }

  const handlePreviousSubStage = () => {
    if (currentSubStageIndex > 0) {
      setCurrentSubStage(subStages[currentSubStageIndex - 1].id)
    }
  }

  const handleSubStageClick = (stageId: string) => {
    const stageIndex = subStages.findIndex(stage => stage.id === stageId)
    
    // Allow navigation only if:
    // 1. It's the current stage (no change)
    // 2. It's a previous stage (can go back)
    // 3. It's the next stage AND all previous stages are complete
    if (stageIndex === currentSubStageIndex) {
      // Current stage - always allowed
      return
    } else if (stageIndex < currentSubStageIndex) {
      // Previous stage - always allowed to go back
      setCurrentSubStage(stageId as any)
    } else if (stageIndex === currentSubStageIndex + 1) {
      // Next stage - only if current stage is complete
      const isCurrentStageComplete = isSubStageComplete(currentSubStage)
      if (isCurrentStageComplete) {
        setCurrentSubStage(stageId as any)
      }
    }
    // Future stages (beyond next) - not allowed
  }

  return (
    <div className="w-full space-y-8">
      {/* Tier Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {getTierIcon()}
          <h1 className="text-3xl font-bold text-gray-900">{getTierTitle()}</h1>
        </div>
        <p className="text-gray-600 text-lg">{getTierDescription()}</p>
        {selectedPackage && (
          <p className="text-sm text-tc-vibrant-blue mt-2">Selected: {selectedPackage}</p>
        )}
      </div>

      {/* Sub-Stage Progress Indicator */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Property Assessment Steps</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentSubStageIndex + 1} of {subStages.length} • 
              {isSubStageComplete(currentSubStage) ? (
                <span className="text-green-600 font-medium"> Current step complete ✓</span>
              ) : (
                <span className="text-orange-600 font-medium"> Complete current step to continue</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subStages.map((stage, index) => {
              const isCompleted = isSubStageComplete(stage.id)
              const isCurrent = currentSubStage === stage.id
              const isCurrentStageComplete = isSubStageComplete(currentSubStage)
              const isNextStage = index === currentSubStageIndex + 1
              const isPreviousStage = index < currentSubStageIndex
              const isFutureStage = index > currentSubStageIndex + 1
              
              // Determine if this stage is clickable
              const isClickable = isCurrent || isPreviousStage || (isNextStage && isCurrentStageComplete)
              
              return (
                <Card
                  key={stage.id}
                  className={cn(
                    "transition-all duration-200 border-2 cursor-pointer hover:shadow-md",
                    isCurrent
                      ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                      : isCompleted
                      ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                      : isPreviousStage
                      ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                      : isNextStage && isCurrentStageComplete
                      ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/5"
                      : isNextStage && !isCurrentStageComplete
                      ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                      : isFutureStage
                      ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                      : "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                  )}
                  onClick={() => handleSubStageClick(stage.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <stage.icon className={cn(
                        "h-6 w-6",
                        "text-tc-vibrant-blue"
                      )} />
                    </div>
                    <h3 className={cn(
                      "font-semibold text-sm mb-1",
                     "text-gray-900"
                    )}>{stage.title}</h3>
                    <p className={cn(
                      "text-xs",
                      "text-gray-600"
                    )}>{stage.description}</p>
                    {(isCompleted || isPreviousStage || isFutureStage) && (
                      <div className="mt-2">
                        <div className="w-4 h-4 bg-tc-vibrant-blue rounded-full mx-auto flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Sub-Stage Content */}
      <Card className="p-6">
        <div className="space-y-6">
                     {/* Sub-Stage Header */}
           <div className="text-center">
             <div className="flex items-center justify-center gap-3 mb-2">
               {React.createElement(subStages[currentSubStageIndex].icon, { className: "h-6 w-6 text-tc-vibrant-blue" })}
               <h2 className="text-2xl font-bold text-gray-900">{subStages[currentSubStageIndex].title}</h2>
             </div>
             <p className="text-gray-600">{subStages[currentSubStageIndex].description}</p>
             
             {/* Step Completion Status */}
             {!isSubStageComplete(currentSubStage) && (
               <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                 <div className="text-sm text-orange-800 font-medium mb-1">Required to complete this step:</div>
                 <div className="text-xs text-orange-700">
                   {currentSubStage === "basic" && (
                     <ul className="list-disc list-inside space-y-1">
                       {!formData.propertyType && <li>Select property type</li>}
                       {!formData.serviceType && <li>Select service type</li>}
                       {formData.bedrooms < 0 && <li>Set number of bedrooms</li>}
                       {formData.bathrooms < 0 && <li>Set number of bathrooms</li>}
                       {formData.squareFootage < 100 && <li>Enter square footage (min 100 sq ft)</li>}
                       {formData.floors < 1 && <li>Set number of floors</li>}
                     </ul>
                   )}
                   {currentSubStage === "condition" && (
                     <ul className="list-disc list-inside space-y-1">
                       {!formData.condition && <li>Select property condition</li>}
                       {formData.floors < 1 && <li>Set number of floors</li>}
                       {formData.pets === undefined && <li>Indicate if you have pets</li>}
                       {formData.children === undefined && <li>Indicate if you have children</li>}
                     </ul>
                   )}
                   {currentSubStage === "service" && (
                     <ul className="list-disc list-inside space-y-1">
                       {!formData.serviceType && <li>Select service type</li>}
                       {formData.specialAreas.length === 0 && <li>Select at least one special area or "None"</li>}
                     </ul>
                   )}
                   {currentSubStage === "additional" && (
                     <div>This step is optional - you can proceed with or without additional notes</div>
                   )}
                 </div>
               </div>
             )}
             

           </div>

                     {/* Basic Property Info Sub-Stage */}
           {currentSubStage === "basic" && (
             <div className="space-y-8">
               {/* Property Type & Service Grid */}
               <div className="space-y-6">
                 {/* Property Type Grid */}
                 <div className="space-y-4">
                   <Label className="text-sm font-medium">Property Type</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {propertyTypes.slice(0, 4).map((type) => (
                       <Card
                         key={type.value}
                         className={cn(
                           "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                           formData.propertyType === type.value
                             ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                             : "border-gray-200 hover:border-gray-300"
                         )}
                         onClick={() => handleInputChange("propertyType", type.value)}
                       >
                         <CardContent className="p-4 text-center">
                           <Home className="h-6 w-6 mx-auto mb-2 text-tc-vibrant-blue" />
                           <h3 className="font-semibold text-gray-900 text-sm">{type.label}</h3>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 </div>

                 {/* Service Type Grid */}
                 <div className="space-y-4">
                   <Label className="text-sm font-medium">Service Type</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {serviceTypes.map((service) => (
                       <Card
                         key={service.value}
                         className={cn(
                           "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                           formData.serviceType === service.value
                             ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                             : "border-gray-200 hover:border-gray-300"
                         )}
                         onClick={() => handleInputChange("serviceType", service.value)}
                       >
                         <CardContent className="p-4 text-center">
                           <h3 className="font-semibold text-gray-900 text-sm">{service.label}</h3>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 </div>
               </div>

                               {/* Property Size Grid */}
                <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Bedrooms */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bed className="h-4 w-4 text-tc-vibrant-blue" />
                      Bedrooms
                    </Label>
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementBedrooms}
                        disabled={formData.bedrooms <= 0}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                        {formData.bedrooms}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementBedrooms}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {formData.bedrooms > 2 && (
                      <div className="text-xs text-tc-vibrant-blue font-medium text-center bg-tc-light-vibrant-blue/20 px-2 py-1 rounded">
                        +${(formData.bedrooms - 2) * 50} additional charge
                      </div>
                    )}
                    {errors.bedrooms && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription className="text-xs">{errors.bedrooms}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bath className="h-4 w-4 text-tc-vibrant-blue" />
                      Bathrooms
                    </Label>
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementBathrooms}
                        disabled={formData.bathrooms <= 0}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                        {formData.bathrooms}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementBathrooms}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {formData.bathrooms > 1 && (
                      <div className="text-xs text-tc-vibrant-blue font-medium text-center bg-tc-light-vibrant-blue/20 px-2 py-1 rounded">
                        +${(formData.bathrooms - 1) * 25} additional charge
                      </div>
                    )}
                    {errors.bathrooms && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription className="text-xs">{errors.bathrooms}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* Square Footage & Floors Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Square className="h-4 w-4 text-tc-vibrant-blue" />
                      Square Footage
                    </Label>
                    <Input
                      type="number"
                      min="100"
                      value={formData.squareFootage}
                      onChange={(e) => handleInputChange("squareFootage", parseInt(e.target.value) || 0)}
                      className={cn(errors.squareFootage && "border-red-500 focus:border-red-500")}
                      placeholder="e.g., 1500"
                    />
                    {errors.squareFootage && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription className="text-xs">{errors.squareFootage}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Home className="h-4 w-4 text-tc-vibrant-blue" />
                      Floors
                    </Label>
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementFloors}
                        disabled={formData.floors <= 1}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                        {formData.floors}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementFloors}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {errors.floors && (
                      <Alert variant="destructive" className="py-1">
                        <AlertDescription className="text-xs">{errors.floors}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

                     {/* Property Condition Sub-Stage */}
           {currentSubStage === "condition" && (
             <div className="space-y-8">
               {/* Property Condition Grid */}
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-3">
                   {conditions.map((condition) => (
                     <Card
                       key={condition.value}
                       className={cn(
                         "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                         formData.condition === condition.value
                           ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                           : "border-gray-200 hover:border-gray-300"
                       )}
                       onClick={() => handleInputChange("condition", condition.value)}
                     >
                       <CardContent className="p-3 text-center">
                         <h3 className="font-semibold text-gray-900 text-xs">{condition.label}</h3>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>

               {/* Lifestyle Factors Grid */}
               <div className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                      formData.pets
                        ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleInputChange("pets", !formData.pets)}
                  >
                    <CardContent className="p-4 text-center">
                      <PawPrint className="h-6 w-6 mx-auto mb-2 text-tc-vibrant-blue" />
                      <h3 className="font-semibold text-gray-900 text-sm">Pets in the Home</h3>
                      <p className="text-xs text-gray-600 mt-1">Dogs, cats, or other pets</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                      formData.children
                        ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleInputChange("children", !formData.children)}
                  >
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-tc-vibrant-blue" />
                      <h3 className="font-semibold text-gray-900 text-sm">Children in the Home</h3>
                      <p className="text-xs text-gray-600 mt-1">Kids or young family members</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

                     {/* Service Details Sub-Stage */}
           {currentSubStage === "service" && (
             <div className="space-y-8">
               {/* Special Areas Grid */}
               <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {getSpecialAreas().map((area) => (
                     <Card
                       key={area}
                       className={cn(
                         "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                         formData.specialAreas.includes(area)
                           ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                           : "border-gray-200 hover:border-gray-300"
                       )}
                       onClick={() => handleSpecialAreaToggle(area)}
                     >
                       <CardContent className="p-3 text-center">
                         <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-tc-vibrant-blue" />
                         <h3 className="font-semibold text-gray-900 text-xs">{area}</h3>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>

              {/* Tier-specific options */}
              {selectedTier === "Concierge" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Concierge Options
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Premium service customization
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Listing Status</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {listingTypes.map((type) => (
                        <Card
                          key={type.value}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                            formData.listingType === type.value
                              ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => handleInputChange("listingType", type.value)}
                        >
                          <CardContent className="p-3 text-center">
                            <h3 className="font-semibold text-gray-900 text-xs">{type.label}</h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Service Urgency</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {urgencyLevels.map((urgency) => {
                        const urgencyPricing = {
                          standard: 0,
                          rush: 100,
                          "same-day": 200
                        }
                        const additionalCharge = urgencyPricing[urgency.value as keyof typeof urgencyPricing]
                        
                        return (
                          <Card
                            key={urgency.value}
                            className={cn(
                              "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                              formData.urgency === urgency.value
                                ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => handleInputChange("urgency", urgency.value)}
                          >
                            <CardContent className="p-3 text-center">
                              <h3 className="font-semibold text-gray-900 text-xs">{urgency.label}</h3>
                              {additionalCharge > 0 && (
                                <div className="text-xs text-tc-vibrant-blue font-medium mt-1 bg-tc-light-vibrant-blue/20 px-2 py-1 rounded">
                                  +${additionalCharge} additional
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedTier === "Partner" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Partnership Options
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Partnership tier selection
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Partnership Tier</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {partnershipTiers.map((tier) => (
                        <Card
                          key={tier.value}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                            formData.partnershipTier === tier.value
                              ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => handleInputChange("partnershipTier", tier.value)}
                        >
                          <CardContent className="p-4 text-center">
                            <PackageIcon className="h-6 w-6 mx-auto mb-2 text-tc-vibrant-blue" />
                            <h3 className="font-semibold text-gray-900 text-sm">{tier.label}</h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Service Urgency</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {urgencyLevels.map((urgency) => {
                        const urgencyPricing = {
                          standard: 0,
                          rush: 100,
                          "same-day": 200
                        }
                        const additionalCharge = urgencyPricing[urgency.value as keyof typeof urgencyPricing]
                        
                        return (
                          <Card
                            key={urgency.value}
                            className={cn(
                              "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                              formData.urgency === urgency.value
                                ? "border-tc-vibrant-blue bg-tc-light-vibrant-blue/10"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => handleInputChange("urgency", urgency.value)}
                          >
                            <CardContent className="p-3 text-center">
                              <h3 className="font-semibold text-gray-900 text-xs">{urgency.label}</h3>
                              {additionalCharge > 0 && (
                                <div className="text-xs text-tc-vibrant-blue font-medium mt-1 bg-tc-light-vibrant-blue/20 px-2 py-1 rounded">
                                  +${additionalCharge} additional
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Property Images Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Property Images
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Upload photos to help us better understand your property and provide more accurate service
                  </p>
                </div>
                
                <ImageUpload
                  onImagesChange={(images) => handleInputChange("propertyImages", images)}
                  maxImages={10}
                  maxFileSize={5}
                  disabled={isSubmitting}
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better service:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload photos of areas that need special attention</li>
                    <li>• Include shots of any damage, stains, or problem areas</li>
                    <li>• Show the overall condition of rooms and surfaces</li>
                    <li>• Photos help us provide more accurate pricing and service planning</li>
                  </ul>
                </div>
              </div>
            </div>
          )}



                     {/* Additional Information Sub-Stage */}
           {currentSubStage === "additional" && (
             <div className="space-y-6">
               <Textarea
                 value={formData.additionalNotes}
                 onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                 placeholder={
                   selectedTier === "Basic" 
                     ? "Special instructions or access notes..."
                     : selectedTier === "Concierge"
                     ? "Detailed requirements, staging preferences, or special instructions..."
                     : "Partnership-specific requirements, volume details, or special arrangements..."
                 }
                 className="min-h-[200px] resize-none"
               />
             </div>
           )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousSubStage}
          disabled={currentSubStageIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-4">
          {currentSubStageIndex < subStages.length - 1 ? (
            <Button
              type="button"
              onClick={handleNextSubStage}
              disabled={!isSubStageComplete(currentSubStage)}
              className="bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue text-white flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue text-white py-3 text-lg font-semibold rounded-lg"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Add-ons"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 