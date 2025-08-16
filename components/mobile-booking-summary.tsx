"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PackageIcon, PlusCircle, CalendarDays, Settings, ChevronUp, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBookingSummaryProps {
  selectedPackage: {
    id: string
    name: string
    tier: "Basic" | "Concierge" | "Partner"
    category: "Instant" | "Concierge" | "Partner" | "MoveInOut"
    description: string
    whoFor: string
    timeEstimate: string
    priceRange: string
    minPrice: number
    features: string[]
  } | null
  selectedAddOns: Set<string>
  selectedDate: Date | undefined
  selectedTime: string | undefined
  calculateTotalPrice: number
  addOnsData: { id: string; name: string; price: number }[]
  isOccupied: boolean
  lightStaging: boolean
  scentBooster: boolean
  finalDayTouchUp: boolean
  propertyDetails?: {
    bedrooms: number
    bathrooms: number
    squareFootage: number
    propertyType: string
    serviceType: string
    condition: string
    floors: number
    pets: boolean
    children: boolean
    specialAreas: string[]
    additionalNotes: string
    propertyImages: Array<{
      id: string
      url: string
      publicId: string
      name: string
      size: number
    }>
    listingType?: "occupied" | "vacant" | "staging"
    urgency?: "standard" | "rush" | "same-day"
  }
  propertyImages?: Array<{
    id: string
    url: string
    publicId: string
    name: string
    size: number
  }>
  paymentType?: "oneTime" | "monthly" | "quarterly"
  additionalServicePricing?: {
    occupiedHome: number
    lightStaging: number
    scentBooster: number
    finalDayTouchUp: number
  }
  conciergeServicePricing?: {
    listingStatus: {
      occupied: number
      vacant: number
      staging: number
    }
    urgency: {
      standard: number
      rush: number
      "same-day": number
    }
  }
}

export function MobileBookingSummary({
  selectedPackage,
  selectedAddOns,
  selectedDate,
  selectedTime,
  calculateTotalPrice,
  addOnsData,
  isOccupied,
  lightStaging,
  scentBooster,
  finalDayTouchUp,
  propertyDetails,
  propertyImages = [],
  paymentType = "oneTime",
  additionalServicePricing = {
    occupiedHome: 89,
    lightStaging: 139,
    scentBooster: 35,
    finalDayTouchUp: 79,
  },
  conciergeServicePricing = {
    listingStatus: {
      occupied: 0,
      vacant: 50,
      staging: 75,
    },
    urgency: {
      standard: 0,
      rush: 100,
      "same-day": 200,
    },
  },
}: MobileBookingSummaryProps) {
  const [open, setOpen] = useState(false)

  const tierColor = {
    Basic: "bg-gray-200 text-gray-800",
    Concierge: "bg-tc-light-vibrant-blue text-tc-dark-vibrant-blue",
    Partner: "bg-tc-light-vibrant-blue text-tc-dark-vibrant-blue",
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md py-3 text-lg shadow-lg bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue z-50 md:hidden">
          View Summary: ${calculateTotalPrice} <ChevronUp className="ml-2 h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl p-0">
        <Card className="h-full flex flex-col border-none shadow-none">
          <CardHeader className="bg-tc-light-vibrant-blue p-6 rounded-t-xl flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-tc-dark-vibrant-blue">Your Booking Summary</CardTitle>
              <CardDescription className="text-tc-dark-vibrant-blue">
                Details of your selected services.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <ChevronUp className="h-6 w-6 text-tc-dark-vibrant-blue" />
              <span className="sr-only">Close Summary</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto grid gap-6 p-6">
            {/* Package Summary */}
            <div className="grid gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                <PackageIcon className="h-5 w-5 text-tc-vibrant-blue" /> Cleaning Package
              </h4>
              {selectedPackage ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn("px-2 py-0.5 rounded-full text-xs", {
                        "bg-gray-200 text-gray-800": selectedPackage.tier === "Basic",
                        "bg-tc-light-vibrant-blue text-tc-dark-vibrant-blue": selectedPackage.tier === "Concierge" || selectedPackage.tier === "Partner",
                      })}
                    >
                      {selectedPackage.tier}
                    </Badge>
                    <span className="font-medium text-base">{selectedPackage.name}</span>
                  </div>
                  <span className="text-tc-dark-vibrant-blue font-bold text-base mt-1 sm:mt-0">
                    {selectedPackage.priceRange}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No package selected.</p>
              )}
            </div>

            {/* Add-Ons Summary */}
            <div className="grid gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                <PlusCircle className="h-5 w-5 text-tc-vibrant-blue" /> Selected Add-Ons
              </h4>
              {selectedAddOns.size > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {Array.from(selectedAddOns).map((addOnId) => {
                    const addOn = addOnsData.find((a) => a.id === addOnId)
                    return addOn ? (
                      <div
                        key={addOn.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm"
                      >
                        <span className="text-gray-700">{addOn.name}</span>
                        <span className="font-medium text-gray-800">${addOn.price}</span>
                      </div>
                    ) : null
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No add-ons selected.</p>
              )}
            </div>

            {/* Date & Time Summary */}
            <div className="grid gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                <CalendarDays className="h-5 w-5 text-tc-vibrant-blue" /> Date & Time
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg grid gap-1 text-sm">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  <span className="text-gray-700">{selectedDate?.toDateString() || "Not selected"}</span>
                </p>
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  <span className="text-gray-700">{selectedTime || "Not selected"}</span>
                </p>
              </div>
            </div>

            {/* Additional Services Summary */}
            <div className="grid gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                <Settings className="h-5 w-5 text-tc-vibrant-blue" /> Additional Services
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                {(isOccupied || lightStaging || scentBooster || finalDayTouchUp || (propertyDetails && (propertyDetails.bedrooms > 2 || propertyDetails.bathrooms > 1)) || (propertyDetails && selectedPackage?.tier === "Concierge" && (propertyDetails.listingType || propertyDetails.urgency))) ? (
                  <>
                    {isOccupied && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Occupied Home Surcharge</span>
                        <span className="font-medium text-gray-800">${additionalServicePricing.occupiedHome}</span>
                      </div>
                    )}
                    {lightStaging && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Light Staging</span>
                        <span className="font-medium text-gray-800">${additionalServicePricing.lightStaging}</span>
                      </div>
                    )}
                    {scentBooster && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Scent Booster</span>
                        <span className="font-medium text-gray-800">${additionalServicePricing.scentBooster}</span>
                      </div>
                    )}
                    {finalDayTouchUp && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Final-Day Touch-Up</span>
                        <span className="font-medium text-gray-800">${additionalServicePricing.finalDayTouchUp}</span>
                      </div>
                    )}
                    {propertyDetails && propertyDetails.bedrooms > 2 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          Additional Bedrooms ({propertyDetails.bedrooms - 2} × $50)
                        </span>
                        <span className="font-medium text-gray-800">
                          ${(propertyDetails.bedrooms - 2) * 50}
                        </span>
                      </div>
                    )}
                    {propertyDetails && propertyDetails.bathrooms > 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          Additional Bathrooms ({propertyDetails.bathrooms - 1} × $25)
                        </span>
                        <span className="font-medium text-gray-800">
                          ${(propertyDetails.bathrooms - 1) * 25}
                        </span>
                      </div>
                    )}
                    {/* Concierge Service Charges */}
                    {propertyDetails && selectedPackage?.tier === "Concierge" && propertyDetails.listingType && propertyDetails.listingType !== "occupied" && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {propertyDetails.listingType === "vacant" ? "Vacant Property" : "Staging Property"}
                        </span>
                        <span className="font-medium text-gray-800">
                          ${conciergeServicePricing.listingStatus[propertyDetails.listingType]}
                        </span>
                      </div>
                    )}
                    {propertyDetails && selectedPackage?.tier === "Concierge" && propertyDetails.urgency && propertyDetails.urgency !== "standard" && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {propertyDetails.urgency === "rush" ? "Rush Service" : "Same Day Service"}
                        </span>
                        <span className="font-medium text-gray-800">
                          ${conciergeServicePricing.urgency[propertyDetails.urgency]}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No additional services selected.</p>
                )}
              </div>
            </div>

            {/* Property Images Summary */}
            {propertyImages.length > 0 && (
              <div className="grid gap-2">
                <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                  <Camera className="h-5 w-5 text-tc-vibrant-blue" /> Property Images
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    {propertyImages.slice(0, 6).map((image) => (
                      <div key={image.id} className="aspect-square rounded overflow-hidden border border-gray-200">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {propertyImages.length > 6 && (
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      +{propertyImages.length - 6} more images
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {propertyImages.length} image{propertyImages.length !== 1 ? 's' : ''} uploaded
                  </p>
                </div>
              </div>
            )}

            {/* Payment Type Summary */}
            <div className="grid gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                <PackageIcon className="h-5 w-5 text-tc-vibrant-blue" /> Payment Plan
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {paymentType === "oneTime" && "One Time Payment"}
                      {paymentType === "monthly" && "Monthly Recurring"}
                      {paymentType === "quarterly" && "Quarterly Recurring"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {paymentType === "oneTime" && "Single payment"}
                      {paymentType === "monthly" && "Monthly billing"}
                      {paymentType === "quarterly" && "Quarterly billing"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-tc-vibrant-blue">
                      {paymentType === "oneTime" && `$${calculateTotalPrice}`}
                      {paymentType === "monthly" && `$${calculateTotalPrice}/mo`}
                      {paymentType === "quarterly" && `$${calculateTotalPrice}/qtr`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 pb-4 px-6 bg-tc-light-vibrant-blue flex justify-between items-center">
            <div className="text-2xl font-extrabold text-tc-dark-vibrant-blue">Total: ${calculateTotalPrice}</div>
            <Button
              className="py-2 text-base bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue"
              onClick={() => setOpen(false)}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </SheetContent>
    </Sheet>
  )
}
