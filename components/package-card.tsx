"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface Package {
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
}

interface PackageCardProps {
  pkg: Package
  isSelected: boolean
  onSelect: (pkg: Package) => void
}

export function PackageCard({ pkg, isSelected, onSelect }: PackageCardProps) {
  const tierColor = {
    Basic: "bg-gray-200 text-gray-800", // Neutral for Basic
    Concierge: "bg-tc-light-vibrant-blue text-tc-dark-vibrant-blue", // Blue for Concierge
    Partner: "bg-tc-light-vibrant-blue text-tc-dark-vibrant-blue", // Blue for Partner
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-xl",
        isSelected
          ? "border-4 border-tc-vibrant-blue shadow-xl"
          : "border-2 border-gray-200 hover:border-tc-vibrant-blue", // Updated border colors
      )}
      onClick={() => onSelect(pkg)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
          <Badge className={cn("px-3 py-1 rounded-full text-sm", tierColor[pkg.tier])}>{pkg.tier}</Badge>
        </div>
        <CardDescription className="text-sm text-gray-600">{pkg.whoFor}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-tc-dark-vibrant-blue">
          {" "}
          {/* Updated text color */}
          <DollarSign className="h-5 w-5" />
          {pkg.priceRange}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          {pkg.timeEstimate}
        </div>
        <p className="text-sm text-gray-700">{pkg.description}</p>
        <ul className="grid gap-2 text-sm text-gray-800">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-tc-vibrant-blue flex-shrink-0 mt-1" /> {/* Updated icon color */}
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
