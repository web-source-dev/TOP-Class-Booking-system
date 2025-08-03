"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PackageIcon, PlusCircle, CalendarDays, Settings, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBookingSummaryProps {
  selectedPackage: {
    id: string
    name: string
    tier: "Basic" | "Concierge" | "Partner"
    category: "Instant Impact" | "Concierge" | "Partner"
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

            {/* Preferences Summary */}
            <div className="grid gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                <Settings className="h-5 w-5 text-tc-vibrant-blue" /> Additional Preferences
              </h4>
              <ul className="bg-gray-50 p-3 rounded-lg grid gap-1 text-sm">
                <li>
                  <span className="font-medium">Occupied Home:</span>{" "}
                  <span className="text-gray-700">
                    {selectedPackage?.tier === "Concierge" ? "N/A" : isOccupied ? "Yes" : "No"}
                  </span>
                </li>
                <li>
                  <span className="font-medium">Light Staging:</span>{" "}
                  <span className="text-gray-700">{lightStaging ? "Yes" : "No"}</span>
                </li>
                <li>
                  <span className="font-medium">Scent Booster:</span>{" "}
                  <span className="text-gray-700">{scentBooster ? "Yes" : "No"}</span>
                </li>
                <li>
                  <span className="font-medium">Final-Day Touch-Up:</span>{" "}
                  <span className="text-gray-700">{finalDayTouchUp ? "Yes" : "No"}</span>
                </li>
              </ul>
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
