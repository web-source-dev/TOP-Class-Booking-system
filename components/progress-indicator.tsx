"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStep {
  id: string
  title: string
  description: string
  status: "completed" | "current" | "upcoming"
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Booking progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed"
          const isCurrent = step.status === "current"
          const isUpcoming = step.status === "upcoming"
          
          return (
            <li key={step.id} className="flex-1 relative">
              {/* Step connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-8 w-full h-0.5 -z-10",
                    isCompleted ? "bg-tc-vibrant-blue" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
              
              {/* Step content */}
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    isCompleted && "bg-tc-vibrant-blue border-tc-vibrant-blue",
                    isCurrent && "border-tc-vibrant-blue bg-white",
                    isUpcoming && "border-gray-300 bg-white"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-tc-vibrant-blue",
                        isUpcoming && "text-gray-500"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Step title */}
                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCompleted && "text-tc-vibrant-blue",
                      isCurrent && "text-tc-vibrant-blue",
                      isUpcoming && "text-gray-500"
                    )}
                  >
                    {step.title}
                  </span>
                  
                  {/* Step description - hidden on mobile */}
                  <p
                    className={cn(
                      "text-xs mt-1 hidden sm:block",
                      isCompleted && "text-tc-vibrant-blue/80",
                      isCurrent && "text-tc-vibrant-blue/80",
                      isUpcoming && "text-gray-400"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Screen reader text */}
              <span className="sr-only">
                {isCompleted && `${step.title} - completed`}
                {isCurrent && `${step.title} - current step`}
                {isUpcoming && `${step.title} - upcoming`}
              </span>
            </li>
          )
        })}
      </ol>
      
      {/* Progress percentage for screen readers */}
      <div className="sr-only" aria-live="polite">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
      </div>
    </nav>
  )
} 