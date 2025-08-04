"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Sparkles, Handshake } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  name: string
  description: string
  icon: any
  onSelect: () => void
}

function CategoryCard({ name, description, icon: Icon, onSelect }: CategoryCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-tc-vibrant-blue",
        "border-2 border-gray-200 flex flex-col items-center justify-center p-6 text-center",
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-4 flex flex-col items-center text-center">
        <Icon className="h-16 w-16 text-tc-vibrant-blue mb-4" />
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      </CardHeader>
      <CardContent className="text-base text-gray-700 text-center">
        <p>{description}</p>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleCategorySelect = (category: string) => {
    const encodedCategory = encodeURIComponent(category);
    const targetUrl = `https://www.topclassclean.com/book-now?category=${encodedCategory}`;
  
    if (typeof window !== "undefined") {
      window.parent.location.href = targetUrl;
    }
  };
  
  return (
    <div className="min-h-[60vh] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-6xl mx-auto">
        {/* Category Selection */}
        <div className="grid gap-8">
          <h2 className="text-3xl font-bold text-center text-gray-800">Choose Your Cleaning Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard
              name="Instant"
              description="Quick, thorough one-time cleans for immediate results."
              icon={Home}
              onSelect={() => handleCategorySelect("Instant")}
            />
            <CategoryCard
              name="Concierge"
              description="Premium, white-glove service for occupied or vacated homes."
              icon={Sparkles}
              onSelect={() => handleCategorySelect("Concierge")}
            />
            <CategoryCard
              name="Partner"
              description="Exclusive ongoing partnerships for real estate professionals."
              icon={Handshake}
              onSelect={() => handleCategorySelect("Partner")}
            />
          </div>
        </div>

        {/* Loading States */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tc-vibrant-blue"></div>
                <span>Loading {isLoading} services...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 