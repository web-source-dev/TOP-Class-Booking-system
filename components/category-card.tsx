"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  name: string
  description: string
  icon: LucideIcon
  onSelect: () => void
}

export function CategoryCard({ name, description, icon: Icon, onSelect }: CategoryCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-tc-vibrant-blue", // Updated hover border
        "border-2 border-gray-200 flex flex-col items-center justify-center p-6 text-center",
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-4 flex flex-col items-center text-center">
        <Icon className="h-16 w-16 text-tc-vibrant-blue mb-4" /> {/* Updated icon color */}
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      </CardHeader>
      <CardContent className="text-base text-gray-700 text-center">
        <p>{description}</p>
      </CardContent>
    </Card>
  )
}
