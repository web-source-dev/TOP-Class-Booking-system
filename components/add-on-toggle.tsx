"use client"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddOn {
  id: string
  name: string
  price: number
}

interface AddOnToggleProps {
  addOn: AddOn
  isSelected: boolean
  onToggle: (id: string) => void
}

export function AddOnToggle({ addOn, isSelected, onToggle }: AddOnToggleProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative flex flex-col items-center justify-center p-3 h-28 text-center rounded-lg transition-all duration-200 overflow-hidden", // Further reduced height
        "hover:bg-tc-light-vibrant-blue hover:border-tc-vibrant-blue hover:shadow-md", // Updated hover colors
        isSelected
          ? "bg-tc-light-vibrant-blue border-tc-vibrant-blue text-tc-dark-vibrant-blue shadow-md" // Updated selected colors
          : "bg-white border-gray-200 text-gray-900 hover:text-gray-900", // Better text contrast
      )}
      onClick={() => onToggle(addOn.id)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <Check className="h-5 w-5 text-tc-vibrant-blue" /> {/* Updated icon color */}
        </div>
      )}
      <div className="flex flex-col items-center justify-center w-full h-full px-2 py-1">
        <div className="flex-1 flex items-center justify-center min-h-0 w-full">
          <span className="font-semibold text-xs leading-tight text-gray-900 break-words w-full text-center line-clamp-2 whitespace-pre-line">{addOn.name}</span>
        </div>
        <div className="flex items-center justify-center w-full pt-1">
          <span className="text-sm font-bold text-tc-vibrant-blue">${addOn.price}</span>
        </div>
      </div>
    </Button>
  )
}
