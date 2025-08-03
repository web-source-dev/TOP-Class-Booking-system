"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CalendarDays, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlot {
  id: string
  time: string
  available: boolean
  bookingCount?: number
  maxBookings?: number
}

interface AvailabilityData {
  date: string
  slots: TimeSlot[]
}

interface AvailabilityCalendarProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  selectedTime?: string
  disabled?: boolean
}

// API endpoint for availability
const API_BASE_URL = 'http://localhost:5000/api'

export function AvailabilityCalendar({
  selectedDate,
  onDateSelect,
  onTimeSelect,
  selectedTime,
  disabled = false,
}: AvailabilityCalendarProps) {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSlots, setCurrentSlots] = useState<TimeSlot[]>([])

  // Fetch availability from API
  const fetchAvailability = async (date: Date) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const dateString = date.toISOString().split('T')[0]
      
      const response = await fetch(`${API_BASE_URL}/bookings/availability/${dateString}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
             if (result.success && result.data) {
         setCurrentSlots(result.data.slots)
       } else {
         throw new Error(result.message || 'Failed to fetch availability data')
       }
    } catch (err) {
      setError("Failed to load availability. Please try again.")
      console.error("Availability fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch availability when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate)
    } else {
      setCurrentSlots([])
    }
  }, [selectedDate])

  // Disable past dates only
  const disabledDates = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return (date: Date) => {
      return date < today // Disable past dates only
    }
  }, [])

  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date)
    if (selectedTime) {
      onTimeSelect("") // Clear selected time when date changes
    }
  }

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time)
  }

  const getAvailabilityStatus = (slot: TimeSlot) => {
    if (!slot.available) return "Fully Booked"
    if (slot.bookingCount !== undefined && slot.maxBookings) {
      const remaining = slot.maxBookings - slot.bookingCount
      if (remaining === 0) return "Fully Booked"
      if (remaining === 1) return "1 Spot Left"
      if (remaining <= 3) return `${remaining} Spots Left`
      return "Available"
    }
    return "Available"
  }

  const getAvailabilityColor = (slot: TimeSlot) => {
    if (!slot.available) return "bg-red-100 text-red-800"
    if (slot.bookingCount && slot.maxBookings) {
      const remaining = slot.maxBookings - slot.bookingCount
      if (remaining === 1) return "bg-orange-100 text-orange-800"
      if (remaining <= 3) return "bg-yellow-100 text-yellow-800"
    }
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CalendarDays className="h-6 w-6 text-tc-vibrant-blue" />
          <h1 className="text-3xl font-bold text-gray-900">Schedule Your Service</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Choose your preferred date and time for your cleaning service.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Calendar */}
        <div className="space-y-8">
          <Card className="p-4 w-full">
            <div className="space-y-4 w-full">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Select Date
                </h2>
                <p className="text-gray-600 text-sm">
                  Choose your preferred cleaning date. Available dates are highlighted.
                </p>
              </div>
              
              <div className="w-full flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={disabledDates}
                  className="rounded-md border w-full max-w-sm"
                  aria-label="Select cleaning date"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Time Slots */}
        <div className="space-y-8">
          {selectedDate ? (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Available Time Slots
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : currentSlots.length > 0 ? (
                  <div className="space-y-3">
                    {currentSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant="outline"
                        className={cn(
                          "w-full justify-between p-4 h-auto",
                          selectedTime === slot.time && "border-tc-vibrant-blue bg-tc-light-vibrant-blue",
                          !slot.available && "opacity-50 cursor-not-allowed",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => slot.available && !disabled && handleTimeSelect(slot.time)}
                        disabled={!slot.available || disabled}
                        aria-describedby={`slot-${slot.id}-status`}
                      >
                        <div className="flex items-center gap-3">
                          {slot.available ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium">{slot.time}</span>
                        </div>
                        <Badge className={getAvailabilityColor(slot)}>
                          {getAvailabilityStatus(slot)}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No time slots available for this date.</p>
                    <p className="text-sm">Please select a different date.</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Time Slots
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Select a date to see available time slots
                  </p>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Please select a date first</p>
                  <p className="text-sm">Available time slots will appear here</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>


    </div>
  )
} 