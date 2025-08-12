"use client"

import { useState, useMemo, useEffect, useCallback, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, PackageIcon, PlusCircle, CalendarDays, Settings, Loader2, User, Building } from "lucide-react"
import { PackageCard } from "@/components/package-card"
import { AddOnToggle } from "@/components/add-on-toggle"
import { MobileBookingSummary } from "@/components/mobile-booking-summary"
import { ContactForm } from "@/components/contact-form"

import { AvailabilityCalendar } from "@/components/availability-calendar"

import { PropertyDetailsForm } from "@/components/property-details-form"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  bookingRateLimiter,
  formSubmissionRateLimiter,
  getClientIdentifier,
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateZipCode,
  detectSuspiciousActivity
} from "@/lib/rate-limiter"

// Data Definitions (same as before, just for context)
interface CleaningPackage {
  id: string
  name: string
  tier: "Basic" | "Concierge" | "Partner"
  category: "Instant" | "Concierge" | "Partner"
  description: string
  whoFor: string
  timeEstimate: string
  priceRange: string
  minPrice: number
  features: string[]
}

interface AddOn {
  id: string
  name: string
  price: number
}

const packagesData: CleaningPackage[] = [
  {
    id: "instant-impact-refresh",
    name: "Instant Impact Refresh",
    tier: "Basic",
    category: "Instant",
    description:
      "A quick but thorough one-time clean to give your home or listing that fresh, welcoming feel. Perfect for light tidy-ups, unexpected guest visits, or before a photo shoot.",
    whoFor: "Busy homeowners, tenants moving out, or agents with a small listing needing fast shine.",
    timeEstimate: "2–3 hours, 1–2 cleaners",
    priceRange: "$199",
    minPrice: 199,
    features: ["Light tidy-up", "Surface wipe-down", "Vacuum/Mop floors", "Bathroom refresh", "Kitchen wipe-down"],
  },
  {
    id: "instant-impact-final-touch",
    name: "Instant Impact Final Touch",
    tier: "Basic",
    category: "Instant",
    description:
      "A detailed spot-clean focusing on your home’s or listing’s most important areas — kitchens, bathrooms, floors, and high-touch spots. A great last pass before an open house or move-in.",
    whoFor: "Realtors needing show-ready polish or owners prepping for handover.",
    timeEstimate: "3–4 hours, 1–2 cleaners",
    priceRange: "$249",
    minPrice: 249,
    features: [
      "Detailed kitchen & bathroom clean",
      "Floor deep clean",
      "High-touch surface disinfection",
      "Spot cleaning",
      "Trash removal",
    ],
  },
  {
    id: "instant-impact-ready-clean",
    name: "Instant Impact Ready Clean",
    tier: "Basic",
    category: "Instant",
    description:
      "A full one-time deep clean covering all main rooms, appliances, baseboards, plus final detail work. Ideal for pre-move-in/move-out or a big “reset” for your home.",
    whoFor: "Renters, sellers, new homeowners — or anyone wanting the full “just-moved-in” fresh start.",
    timeEstimate: "4–6 hours, 2 cleaners",
    priceRange: "$349",
    minPrice: 349,
    features: [
      "Full deep clean of all main rooms",
      "Appliance exterior clean",
      "Baseboard cleaning",
      "Window sills & tracks dusted",
      "Final detail work",
    ],
  },
  {
    id: "instant-impact-showcase",
    name: "Instant Impact Showcase",
    tier: "Basic",
    category: "Instant",
    description:
      "Our premium one-off clean for high-value listings or special showings. Includes full interior detail, high-touch disinfection, light staging help (straightening décor, final touches), and a signature scent if requested.",
    whoFor: "Luxury agents, homeowners selling premium properties, or Airbnb hosts wanting a guest-ready feel.",
    timeEstimate: "6+ hours, 2–3 cleaners",
    priceRange: "$499",
    minPrice: 499,
    features: [
      "Premium full interior detail",
      "High-touch disinfection",
      "Light staging assistance",
      "Signature scent (optional)",
      "Photo-ready touches",
    ],
  },
  {
    id: "show-ready-concierge",
    name: "Show-Ready Concierge",
    tier: "Concierge",
    category: "Concierge",
    description: "Target: Occupied listings needing a fresh, show-ready look.",
    whoFor: "Occupied listings",
    timeEstimate: "Varies",
    priceRange: "$499",
    minPrice: 499,
    features: [
      "General whole-home clean (light staging polish)",
      "High-touch surface disinfecting",
      "Scent boost (light, agent-approved)",
      "Trash removal",
      "Light declutter and spot checks",
      "Final-day touch-up (if booked within 48 hrs of listing photos/open house)",
    ],
  },
  {
    id: "move-out-concierge",
    name: "Move-Out Concierge",
    tier: "Concierge",
    category: "Concierge",
    description: "Target: Vacated homes to get them sparkling for next owner/walkthrough.",
    whoFor: "Vacated homes",
    timeEstimate: "Varies",
    priceRange: "$599",
    minPrice: 599,
    features: [
      "Deep clean: baseboards, inside cabinets/drawers",
      "Appliances inside/out (fridge, oven, dishwasher)",
      "Windowsills & tracks dusted",
      "Full bathroom scrub, grout touch",
      "Trash removal & deodorize",
      "Final-day walkthrough & touch-up option",
    ],
  },
  {
    id: "showcase-concierge",
    name: "Showcase Concierge",
    tier: "Concierge",
    category: "Concierge",
    description: "Target: Premium listings that need to wow buyers — “white glove” level.",
    whoFor: "Premium listings",
    timeEstimate: "Varies",
    priceRange: "$799",
    minPrice: 799,
    features: [
      "Everything in Show-Ready & Move-Out Concierge",
      "Scent boosters & air freshening detail",
      "Appliance polishing & stainless steel shine",
      "Final-day freshen-up visit (within 24 hrs of showing)",
      "Photo-ready details: folded towels, pillows, light staging tweaks",
      "Brochure stand wipe-down if provided",
    ],
  },
  {
    id: "tier-1-powered-partner",
    name: "Tier 1 – Powered Partner",
    tier: "Partner",
    category: "Partner",
    description: "Exclusive partnership option for Realtors.",
    whoFor: "Realtors",
    timeEstimate: "Up to 2 full-service cleanings per month",
    priceRange: "$398/month",
    minPrice: 398,
    features: [
      "Up to 2 full-service cleanings per month at $199/clean",
      "Priority scheduling – next-day slots when available",
      "Dedicated contact line to the TC Cleaning coordinator",
      "1 free touch-up per listing",
      "Use of the ‘Powered by TC Cleaning’ branding on marketing",
      "$10 bonus for each confirmed 5-star review generated",
      "Lead sharing optional",
    ],
  },
  {
    id: "tier-2-signature-affiliate-partner",
    name: "Tier 2 – Signature Affiliate Partner",
    tier: "Partner",
    category: "Partner",
    description: "Exclusive partnership option for Realtors.",
    whoFor: "Realtors",
    timeEstimate: "Up to 4 full-service cleanings per month",
    priceRange: "$499–$599/month",
    minPrice: 499,
    features: [
      "Up to 4 full-service cleanings per month",
      "Guaranteed 24-hour priority slots",
      "Direct contact line & text support",
      "2 touch-ups per month plus staging assist if needed",
      "Co-branded marketing materials",
      "Featured Agent Spotlight on TC Cleaning website & socials",
      "$10 per confirmed 5-star review PLUS 10% commission for 3 months per new client referred",
      "Warm lead sharing: agent commits to sending 5 warm leads per month",
      "Long-term 1% commission on client accounts for 12 months",
      "3 listings/month fully covered for free cleanings",
      "Full co-branding integration",
    ],
  },
]

const addOnsData: AddOn[] = [
  { id: "refrigerator-clean", name: "Fridge\nClean", price: 35 },
  { id: "oven-range-clean", name: "Oven\nClean", price: 45 },
  { id: "cabinet-wipe-down", name: "Cabinet\nWipe", price: 45 },
  { id: "pantry-closet-clean", name: "Pantry\nClean", price: 50 },
  { id: "baseboard-trim-detailing", name: "Baseboard\nDetail", price: 60 },
  { id: "interior-window-detailing", name: "Window\nDetail", price: 150 },
  { id: "exterior-window-polish", name: "Window\nPolish", price: 200 },
  { id: "blind-shutter-dusting", name: "Blind\nDusting", price: 30 },
  { id: "garage-clean-out", name: "Garage\nClean", price: 200 },
  { id: "patio-deck-wash", name: "Patio\nWash", price: 150 },
  { id: "carpet-steam-cleaning", name: "Carpet\nClean", price: 160 },
  { id: "tile-grout-cleaning", name: "Tile &\nGrout", price: 250 },
  { id: "upholstery-cleaning", name: "Upholstery\nClean", price: 174 },
  { id: "deodorizing", name: "Deodorizing\nService", price: 350 },
  { id: "front-entry-refresh", name: "Entry\nRefresh", price: 80 },
  { id: "light-fixture-cleaning", name: "Light\nClean", price: 30 },
  { id: "attic-basement-sweep", name: "Attic\nSweep", price: 100 },
  { id: "pressure-washing", name: "Pressure\nWash", price: 150 },
  { id: "pool-deck-cleaning", name: "Pool\nDeck", price: 150 },
  { id: "trash-bin-wash", name: "Trash\nWash", price: 20 },
]

// Additional service pricing
const additionalServicePricing = {
  occupiedHome: 89,
  lightStaging: 139,
  scentBooster: 35,
  finalDayTouchUp: 79,
}


// Contact form data interface
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
  id?: string
}

// Property details interface
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
  // Tier-specific fields
  listingType?: "occupied" | "vacant" | "staging"
  urgency?: "standard" | "rush" | "same-day"
  stagingLevel?: "none" | "light" | "full"
  partnershipTier?: "tier1" | "tier2" | "tier3"
}

function BookingSystemContent() {
  const [currentStage, setCurrentStage] = useState<"category" | "tiers" | "property-details" | "add-ons" | "schedule" | "contact" | "review">(
    "category"
  )
  const [selectedCategory, setSelectedCategory] = useState<"Instant" | "Concierge" | "Partner" | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<CleaningPackage | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [isOccupied, setIsOccupied] = useState(false)
  const [lightStaging, setLightStaging] = useState(false)
  const [scentBooster, setScentBooster] = useState(false)
  const [finalDayTouchUp, setFinalDayTouchUp] = useState(false)

  // New state for enhanced features
  const [contactData, setContactData] = useState<ContactFormData | null>(null)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // LocalStorage keys
  const STORAGE_KEY = 'topclass_booking_data'

  useEffect(() => {
    // Request user info when component mounts
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "request-user-info" }, "*");
      console.log("🔄 Requested user info from Wix");
    }

    // Listen for response from Wix
    const handleMessage = (event: MessageEvent) => {
      // Optional: security check
      // if (event.origin !== "https://your-wix-domain.com") return;

      const { type, email, id,categoryparam } = event.data;

      if (type === "userInfo") {
        setContactData({
          email: email || "",
          id: id || "",
          firstName: contactData?.firstName || "",
          lastName: contactData?.lastName || "", 
          phone: contactData?.phone || "", 
          address: contactData?.address || "", 
          city: contactData?.city || "", 
          state: contactData?.state || "", 
          zipCode: contactData?.zipCode || "", 
          specialInstructions: contactData?.specialInstructions || "", 
          preferredContact: contactData?.preferredContact || "email", 
        });
        setSelectedCategory(categoryparam as "Instant" | "Concierge" | "Partner" )
        // Move to tiers stage when category is received from Wix
        if (categoryparam) {
          setCurrentStage("tiers")
        }
        console.log("✅ Received user info from Wix:", { email, id ,categoryparam});
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const isMobile = useIsMobile()

  // LocalStorage functions
  const saveToLocalStorage = useCallback(() => {
    const bookingData = {
      currentStage,
      selectedCategory,
      selectedPackage,
      selectedAddOns: Array.from(selectedAddOns),
      selectedDate: selectedDate?.toISOString(),
      selectedTime,
      isOccupied,
      lightStaging,
      scentBooster,
      finalDayTouchUp,
      contactData,
      propertyDetails,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData))
  }, [
    currentStage,
    selectedCategory,
    selectedPackage,
    selectedAddOns,
    selectedDate,
    selectedTime,
    isOccupied,
    lightStaging,
    scentBooster,
    finalDayTouchUp,
    contactData,
    propertyDetails
  ])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const bookingData = JSON.parse(savedData)

        // Check if data is less than 24 hours old
        const isDataFresh = Date.now() - bookingData.timestamp < 24 * 60 * 60 * 1000

        if (isDataFresh) {
          setCurrentStage(bookingData.currentStage || "category")
          setSelectedCategory(bookingData.selectedCategory || null)
          setSelectedPackage(bookingData.selectedPackage || null)
          setSelectedAddOns(new Set(bookingData.selectedAddOns || []))
          setSelectedDate(bookingData.selectedDate ? new Date(bookingData.selectedDate) : undefined)
          setSelectedTime(bookingData.selectedTime || undefined)
          setIsOccupied(bookingData.isOccupied || false)
          setLightStaging(bookingData.lightStaging || false)
          setScentBooster(bookingData.scentBooster || false)
          setFinalDayTouchUp(bookingData.finalDayTouchUp || false)
          setContactData(bookingData.contactData || null)
          setPropertyDetails(bookingData.propertyDetails || null)
        } else {
          // Clear old data
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Load data from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    // Only save if we have a selected category (not on home page)
    if (selectedCategory && currentStage !== "category") {
      saveToLocalStorage()
    }
  }, [saveToLocalStorage, currentStage, selectedCategory])

  // Progress steps for the booking process
  const progressSteps = useMemo(() => [
    { id: "tiers", title: "Package", description: "Select cleaning package" },
    { id: "property-details", title: "Property", description: "Property details" },
    { id: "add-ons", title: "Add-ons", description: "Customize services" },
    { id: "schedule", title: "Schedule", description: "Pick date & time" },
    { id: "contact", title: "Contact", description: "Your information" },
    { id: "review", title: "Review", description: "Confirm & pay" },
  ], [])

  // Get current step index
  const currentStepIndex = useMemo(() => {
    return progressSteps.findIndex(step => step.id === currentStage)
  }, [currentStage, progressSteps])

  // Get progress steps with status
  const stepsWithStatus = useMemo(() => {
    return progressSteps.map((step, index) => ({
      ...step,
      status: (index < currentStepIndex ? "completed" : index === currentStepIndex ? "current" : "upcoming") as "completed" | "current" | "upcoming"
    }))
  }, [progressSteps, currentStepIndex])

  const calculateTotalPrice = useMemo(() => {
    let total = selectedPackage ? selectedPackage.minPrice : 0
    
    // Add regular add-ons
    selectedAddOns.forEach((addOnId) => {
      const addOn = addOnsData.find((a) => a.id === addOnId)
      if (addOn) {
        total += addOn.price
      }
    })
    
    // Add additional services pricing
    if (isOccupied) {
      total += additionalServicePricing.occupiedHome
    }
    if (lightStaging) {
      total += additionalServicePricing.lightStaging
    }
    if (scentBooster) {
      total += additionalServicePricing.scentBooster
    }
    if (finalDayTouchUp) {
      total += additionalServicePricing.finalDayTouchUp
    }
    
    return total
  }, [selectedPackage, selectedAddOns, isOccupied, lightStaging, scentBooster, finalDayTouchUp])

  // Rate limiting and validation functions
  const checkRateLimit = async (action: 'booking' | 'form') => {
    const clientId = getClientIdentifier()
    let rateLimiter

    switch (action) {
      case 'booking':
        rateLimiter = bookingRateLimiter
        break
      case 'form':
        rateLimiter = formSubmissionRateLimiter
        break
    }

    const result = await rateLimiter.checkLimit(clientId)
    if (!result.allowed) {
      setRateLimitError(`Too many requests. Please try again in ${result.retryAfter} seconds.`)
      return false
    }
    return true
  }

  const validateContactData = (data: ContactFormData): boolean => {
    const errors: string[] = []

    // Sanitize inputs
    const sanitizedData = {
      firstName: sanitizeInput(data.firstName),
      lastName: sanitizeInput(data.lastName),
      email: sanitizeInput(data.email),
      phone: sanitizeInput(data.phone),
      address: sanitizeInput(data.address),
      city: sanitizeInput(data.city),
      state: sanitizeInput(data.state),
      zipCode: sanitizeInput(data.zipCode),
      specialInstructions: sanitizeInput(data.specialInstructions),
      preferredContact: data.preferredContact
    }

    // Validate required fields
    if (!sanitizedData.firstName) errors.push("First name is required")
    if (!sanitizedData.lastName) errors.push("Last name is required")
    if (!sanitizedData.email) {
      errors.push("Email is required")
    } else if (!validateEmail(sanitizedData.email)) {
      errors.push("Please enter a valid email address")
    }
    if (!sanitizedData.phone) {
      errors.push("Phone number is required")
    } else if (!validatePhone(sanitizedData.phone)) {
      errors.push("Please enter a valid phone number")
    }
    if (!sanitizedData.address) errors.push("Address is required")
    if (!sanitizedData.city) errors.push("City is required")
    if (!sanitizedData.state) errors.push("State is required")
    if (!sanitizedData.zipCode) {
      errors.push("ZIP code is required")
    } else if (!validateZipCode(sanitizedData.zipCode)) {
      errors.push("Please enter a valid ZIP code")
    }

    // Check for suspicious activity
    const suspiciousWarnings = detectSuspiciousActivity(sanitizedData)
    if (suspiciousWarnings.length > 0) {
      errors.push(...suspiciousWarnings)
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handlePropertyDetailsSubmit = async (data: PropertyDetails) => {
    setIsLoading(true)
    setRateLimitError(null)

    try {
      // Check rate limit
      const rateLimitOk = await checkRateLimit('form')
      if (!rateLimitOk) return

      // Store property details
      setPropertyDetails(data)
      setCurrentStage("add-ons")
    } catch (error) {
      console.error("Property details submission error:", error)
      setValidationErrors(["An error occurred. Please try again."])
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    setRateLimitError(null)

    try {
      // Check rate limit
      const rateLimitOk = await checkRateLimit('form')
      if (!rateLimitOk) return

      // Validate data
      if (!validateContactData(data)) return

      // Store contact data
      setContactData(data)
      setCurrentStage("review")
    } catch (error) {
      console.error("Contact form submission error:", error)
      setValidationErrors(["An error occurred. Please try again."])
    } finally {
      setIsLoading(false)
    }
  }





  const handlePackageSelect = (pkg: CleaningPackage) => {
    setSelectedPackage(pkg)
    setCurrentStage("property-details") // Move to property details stage
    setTimeout(() => {
      document.getElementById("property-details-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(addOnId)) {
        newSet.delete(addOnId)
      } else {
        newSet.add(addOnId)
      }
      return newSet
    })
  }

  const resetToCategories = () => {
    // Navigate back to home page instead of resetting to category stage
    window.parent.location.href = 'https://www.topclassclean.com/'
  }

  const resetToTiers = () => {
    setCurrentStage("tiers")
    setSelectedPackage(null)
    setSelectedAddOns(new Set())
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setIsOccupied(false)
    setLightStaging(false)
    setScentBooster(false)
    setFinalDayTouchUp(false)
    setContactData(null)
    setPropertyDetails(null)
    setRateLimitError(null)
    setValidationErrors([])
  }

  const resetToPropertyDetails = () => {
    setCurrentStage("property-details")
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setIsOccupied(false)
    setLightStaging(false)
    setScentBooster(false)
    setFinalDayTouchUp(false)
    setContactData(null)
    setRateLimitError(null)
    setValidationErrors([])
  }

  const resetToAddOns = () => {
    setCurrentStage("add-ons")
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setIsOccupied(false)
    setLightStaging(false)
    setScentBooster(false)
    setFinalDayTouchUp(false)
    setContactData(null)
    setRateLimitError(null)
    setValidationErrors([])
  }

  const resetToSchedule = () => {
    setCurrentStage("schedule")
    setContactData(null)
    setRateLimitError(null)
    setValidationErrors([])
  }

  const resetToContact = () => {
    setCurrentStage("contact")
    setRateLimitError(null)
    setValidationErrors([])
  }

  // Booking submission function
  const handleBookingSubmit = useCallback(async (paymentType: 'full' | 'deposit') => {
    setIsLoading(true)
    setRateLimitError(null)

    try {
      // Validate that we have all required data
      if (!selectedPackage || !contactData || !propertyDetails) {
        throw new Error("Please complete all booking steps before proceeding")
      }

      // Calculate add-ons total
      const addOnsTotal = Array.from(selectedAddOns).reduce((total, addOnId) => {
        const addOn = addOnsData.find((a) => a.id === addOnId)
        return total + (addOn ? addOn.price : 0)
      }, 0)

      // Prepare all booking data
      const bookingData = {
        selectedPackage,
        contactData,
        propertyDetails,
        selectedAddOns: Array.from(selectedAddOns),
        addOnsTotal,
        selectedDate: selectedDate?.toISOString(),
        selectedTime,
        isOccupied,
        lightStaging,
        scentBooster,
        finalDayTouchUp,
        totalPrice: calculateTotalPrice,
        paymentType,
        bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Send booking data to backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save booking')
      }

      // Success - show confirmation
      console.log('Booking saved successfully:', result)

      // Send message to Wix page to start payment
      if (window.parent && window.parent !== window) {
        // If embedded in Wix, send message to parent
        window.parent.postMessage({
          type: "start-payment",
          payload: bookingData
        }, '*')

        console.log('Payment request sent to Wix:', bookingData)
      }
        // Clear localStorage and reset form
        clearLocalStorage()

      } catch (error) {
        console.error('Booking submission error:', error)
        setRateLimitError((error as Error).message || 'Failed to save booking. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }, [
      selectedPackage,
      contactData,
      propertyDetails,
      selectedAddOns,
      selectedDate,
      selectedTime,
      isOccupied,
      lightStaging,
      scentBooster,
      finalDayTouchUp,
      calculateTotalPrice,
      addOnsData
    ])

  // Listen for messages from Wix (if needed for future integrations)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data

      if (data?.type === "booking-saved") {
        // Booking saved successfully
        console.log('Booking saved:', data)
        setRateLimitError(null)

      } else if (data?.type === "booking-error") {
        // Booking save error
        setRateLimitError(data.error || 'Failed to save booking')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])



  const filteredPackages = selectedCategory ? packagesData.filter((pkg) => pkg.category === selectedCategory) : []

  // Determine if summary panel should be shown
  const showSummaryPanel = currentStage !== "review" && currentStage !== "contact" && currentStage !== "property-details" && currentStage !== "tiers" && currentStage !== "schedule"

  return (
    <div className="min-h-screen bg-tc-light-blue py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className={cn(
          "grid gap-8",
          showSummaryPanel ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
        )}>
          <div className={cn(
            "bg-white p-8 rounded-xl shadow-lg",
            showSummaryPanel ? "lg:col-span-2" : "w-full"
          )}>


            {currentStage === "tiers" && (
              // Stage 2: Tier Selection within Category
              <div className="grid gap-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetToCategories}
                    className="w-full sm:w-auto bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <h2 className="text-3xl font-bold text-center text-gray-800 flex-grow">
                    {selectedCategory} Packages
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      isSelected={selectedPackage?.id === pkg.id}
                      onSelect={handlePackageSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {currentStage === "property-details" && selectedPackage && (
              // Stage 3: Property Details
              <div className="grid gap-8">
                <div className="flex flex-col sm:flex-row items-center justify-start mb-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetToTiers}
                    className="w-full sm:w-auto bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </div>

                {/* Rate Limit Error */}
                {rateLimitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{rateLimitError}</AlertDescription>
                  </Alert>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <section id="property-details-section">
                  <PropertyDetailsForm
                    onSubmit={handlePropertyDetailsSubmit}
                    isLoading={isLoading}
                    selectedTier={selectedPackage?.tier}
                    selectedPackage={selectedPackage?.name}
                  />
                </section>
              </div>
            )}

            {currentStage === "add-ons" && selectedPackage && (
              // Stage 4: Add-Ons
              <div className="w-full space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetToPropertyDetails}
                    className="w-full sm:w-auto bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <div className="text-center flex-grow">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Service</h2>
                    <p className="text-gray-600 text-lg">Personalize your cleaning experience with additional services</p>
                  </div>
                </div>

                <section id="add-ons-section" className="space-y-8">
                  {/* Selected Package Info */}
                  <Card className="p-6 bg-gradient-to-r from-tc-light-vibrant-blue/20 to-blue-50/50 border-2 border-tc-vibrant-blue/30 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedPackage.name}</h3>
                        <p className="text-gray-600 font-medium">Base Package Selected</p>
                      </div>
                      <Badge className="bg-tc-vibrant-blue text-white px-3 py-1 text-sm font-semibold">
                        {selectedPackage.tier}
                      </Badge>
                    </div>
                  </Card>

                  {/* Add-Ons Selection */}
                  <Card className="p-6 shadow-sm border-gray-100">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Enhance Your Service</CardTitle>
                      <CardDescription className="text-gray-600 text-base">
                        Select additional services to customize your cleaning experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {addOnsData.map((addOn) => (
                          <AddOnToggle
                            key={addOn.id}
                            addOn={addOn}
                            isSelected={selectedAddOns.has(addOn.id)}
                            onToggle={handleAddOnToggle}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setCurrentStage("schedule")}
                      className="bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue text-white py-4 px-8 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Continue to Schedule <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </section>
              </div>
            )}

            {currentStage === "schedule" && selectedPackage && (
              // Stage 4: Schedule
              <div className="grid gap-8">
                <div className="flex flex-col sm:flex-row items-center justify-start mb-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetToAddOns}
                    className="w-full sm:w-auto bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </div>

                <section id="schedule-section">

                  {/* Real-time Availability Calendar */}
                  <AvailabilityCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onTimeSelect={setSelectedTime}
                    selectedTime={selectedTime}
                    disabled={isLoading}
                  />

                  {/* Additional Preferences */}
                  <Card className="shadow-sm mt-6">
                    <CardHeader>
                      <CardTitle>Additional Preferences</CardTitle>
                      <CardDescription>Tailor your cleaning experience with these premium services.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="occupied-toggle">Occupied Home Surcharge</Label>
                          <span className="text-sm text-gray-500">Additional fee for occupied properties</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-tc-vibrant-blue font-semibold">${additionalServicePricing.occupiedHome}</span>
                          <Switch id="occupied-toggle" checked={isOccupied} onCheckedChange={setIsOccupied} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="light-staging-toggle">Light Staging</Label>
                          <span className="text-sm text-gray-500">Basic arrangement and presentation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-tc-vibrant-blue font-semibold">${additionalServicePricing.lightStaging}</span>
                          <Switch
                            id="light-staging-toggle"
                            checked={lightStaging}
                            onCheckedChange={setLightStaging}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="scent-booster-toggle">Scent Booster</Label>
                          <span className="text-sm text-gray-500">Professional fragrance enhancement</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-tc-vibrant-blue font-semibold">${additionalServicePricing.scentBooster}</span>
                          <Switch
                            id="scent-booster-toggle"
                            checked={scentBooster}
                            onCheckedChange={setScentBooster}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="final-day-touch-up-toggle">Final-Day Touch-Up</Label>
                          <span className="text-sm text-gray-500">Last-minute polish before showing</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-tc-vibrant-blue font-semibold">${additionalServicePricing.finalDayTouchUp}</span>
                          <Switch
                            id="final-day-touch-up-toggle"
                            checked={finalDayTouchUp}
                            onCheckedChange={setFinalDayTouchUp}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setCurrentStage("contact")}
                      disabled={!selectedDate || !selectedTime}
                      className="bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue"
                    >
                      Next: Contact Info <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </section>
              </div>
            )}

            {currentStage === "contact" && selectedPackage && (
              // Stage 5: Contact Information
              <div className="grid gap-8">
                <div className="flex flex-col sm:flex-row items-center justify-start mb-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetToSchedule}
                    className="w-full sm:w-auto bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </div>

                {/* Rate Limit Error */}
                {rateLimitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{rateLimitError}</AlertDescription>
                  </Alert>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <ContactForm
                  onSubmit={handleContactSubmit}
                  isLoading={isLoading}
                  initialData={contactData || undefined}
                  isEmailFromWix={!!contactData?.email}
                />
              </div>
            )}



            {currentStage === "review" && selectedPackage && (
              // Stage 5: Comprehensive Summary & Payment (No side panel)
              <div className="grid gap-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={resetToContact}
                    className="w-full sm:w-auto bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <h2 className="text-3xl font-bold text-center text-gray-800 flex-grow">Review Your Booking</h2>
                  <Button
                    variant="outline"
                    onClick={clearLocalStorage}
                    className="w-full sm:w-auto bg-transparent border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Clear
                  </Button>
                </div>

                <section id="review-section">
                  <Card className="shadow-lg border-2 border-tc-light-vibrant-blue">
                    <CardHeader className="bg-tc-light-vibrant-blue p-6 rounded-t-xl">
                      <CardTitle className="text-3xl font-bold text-tc-dark-vibrant-blue">Confirm Your Order</CardTitle>
                      <CardDescription className="text-tc-dark-vibrant-blue">
                        Please review all details carefully before proceeding to payment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8 p-6">
                      {/* Package Summary */}
                      <div className="grid gap-3">
                        <h4 className="flex items-center gap-2 font-semibold text-xl text-gray-800">
                          <PackageIcon className="h-6 w-6 text-tc-vibrant-blue" /> Cleaning Package
                        </h4>
                        {selectedPackage ? (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge
                                className={cn("px-3 py-1 rounded-full text-sm", {
                                  "bg-gray-200 text-gray-800": selectedPackage.tier === "Basic",
                                  "bg-tc-light-vibrant-blue text-tc-dark-vibrant-blue":
                                    selectedPackage.tier === "Concierge" || selectedPackage.tier === "Partner",
                                })}
                              >
                                {selectedPackage.tier}
                              </Badge>
                              <span className="font-medium text-lg">{selectedPackage.name}</span>
                            </div>
                            <span className="text-tc-dark-vibrant-blue font-bold text-lg mt-2 sm:mt-0">
                              {selectedPackage.priceRange}
                            </span>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No package selected.</p>
                        )}
                      </div>

                      {/* Add-Ons Summary */}
                      <div className="grid gap-3">
                        <h4 className="flex items-center gap-2 font-semibold text-xl text-gray-800">
                          <PlusCircle className="h-6 w-6 text-tc-vibrant-blue" /> Selected Add-Ons
                        </h4>
                        {selectedAddOns.size > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Array.from(selectedAddOns).map((addOnId) => {
                              const addOn = addOnsData.find((a) => a.id === addOnId)
                              return addOn ? (
                                <div
                                  key={addOn.id}
                                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                                >
                                  <span className="text-gray-700">{addOn.name}</span>
                                  <span className="font-medium text-gray-800">${addOn.price}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No add-ons selected.</p>
                        )}
                      </div>

                      {/* Date & Time Summary */}
                      <div className="grid gap-3">
                        <h4 className="flex items-center gap-2 font-semibold text-xl text-gray-800">
                          <CalendarDays className="h-6 w-6 text-tc-vibrant-blue" /> Date & Time
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg grid gap-2">
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

                      {/* Property Details Summary */}
                      {propertyDetails && (
                        <div className="grid gap-3">
                          <h4 className="flex items-center gap-2 font-semibold text-xl text-gray-800">
                            <Building className="h-6 w-6 text-tc-vibrant-blue" /> Property Details
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg grid gap-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p><span className="font-medium">Property Type:</span>{" "}
                                  <span className="text-gray-700 capitalize">{propertyDetails.propertyType}</span>
                                </p>
                                <p><span className="font-medium">Service Type:</span>{" "}
                                  <span className="text-gray-700 capitalize">{propertyDetails.serviceType === "full" ? "Full House - Flat Rate" : "Partial - Hourly Rate"}</span>
                                </p>
                                <p><span className="font-medium">Square Footage:</span>{" "}
                                  <span className="text-gray-700">{propertyDetails.squareFootage} sq ft</span>
                                </p>
                                <p><span className="font-medium">Condition:</span>{" "}
                                  <span className="text-gray-700 capitalize">{propertyDetails.condition}</span>
                                </p>
                                {/* Tier-specific fields */}
                                {propertyDetails.listingType && (
                                  <p><span className="font-medium">Listing Status:</span>{" "}
                                    <span className="text-gray-700 capitalize">{propertyDetails.listingType}</span>
                                  </p>
                                )}
                                {propertyDetails.urgency && (
                                  <p><span className="font-medium">Service Urgency:</span>{" "}
                                    <span className="text-gray-700 capitalize">{propertyDetails.urgency}</span>
                                  </p>
                                )}
                                {propertyDetails.stagingLevel && (
                                  <p><span className="font-medium">Staging Level:</span>{" "}
                                    <span className="text-gray-700 capitalize">{propertyDetails.stagingLevel}</span>
                                  </p>
                                )}
                                {propertyDetails.partnershipTier && (
                                  <p><span className="font-medium">Partnership Tier:</span>{" "}
                                    <span className="text-gray-700 capitalize">{propertyDetails.partnershipTier}</span>
                                  </p>
                                )}
                              </div>
                              <div>
                                <p><span className="font-medium">Bedrooms:</span>{" "}
                                  <span className="text-gray-700">{propertyDetails.bedrooms}</span>
                                </p>
                                <p><span className="font-medium">Bathrooms:</span>{" "}
                                  <span className="text-gray-700">{propertyDetails.bathrooms}</span>
                                </p>
                                <p><span className="font-medium">Floors:</span>{" "}
                                  <span className="text-gray-700">{propertyDetails.floors}</span>
                                </p>
                                <p><span className="font-medium">Lifestyle:</span>{" "}
                                  <span className="text-gray-700">
                                    {propertyDetails.pets && propertyDetails.children ? "Pets & Children" :
                                      propertyDetails.pets ? "Pets" :
                                        propertyDetails.children ? "Children" : "None"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {propertyDetails.specialAreas.length > 0 && (
                              <div>
                                <p className="font-medium">Special Areas:</p>
                                <ul className="list-disc list-inside text-gray-700 ml-4">
                                  {propertyDetails.specialAreas.map((area, index) => (
                                    <li key={index}>{area}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {propertyDetails.additionalNotes && (
                              <p>
                                <span className="font-medium">Additional Notes:</span>{" "}
                                <span className="text-gray-700">{propertyDetails.additionalNotes}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Information Summary */}
                      {contactData && (
                        <div className="grid gap-3">
                          <h4 className="flex items-center gap-2 font-semibold text-xl text-gray-800">
                            <User className="h-6 w-6 text-tc-vibrant-blue" /> Contact Information
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg grid gap-2">
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              <span className="text-gray-700">{contactData.firstName} {contactData.lastName}</span>
                            </p>
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              <span className="text-gray-700">{contactData.email}</span>
                            </p>
                            <p>
                              <span className="font-medium">Phone:</span>{" "}
                              <span className="text-gray-700">{contactData.phone}</span>
                            </p>
                            <p>
                              <span className="font-medium">Address:</span>{" "}
                              <span className="text-gray-700">
                                {contactData.address}, {contactData.city}, {contactData.state} {contactData.zipCode}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Preferred Contact:</span>{" "}
                              <span className="text-gray-700 capitalize">{contactData.preferredContact}</span>
                            </p>
                            {contactData.specialInstructions && (
                              <p>
                                <span className="font-medium">Special Instructions:</span>{" "}
                                <span className="text-gray-700">{contactData.specialInstructions}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}



                      {/* Preferences Summary */}
                      <div className="grid gap-3">
                        <h4 className="flex items-center gap-2 font-semibold text-xl text-gray-800">
                          <Settings className="h-6 w-6 text-tc-vibrant-blue" /> Additional Services
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          {(isOccupied || lightStaging || scentBooster || finalDayTouchUp) ? (
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
                            </>
                          ) : (
                            <p className="text-muted-foreground">No additional services selected.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-6 pb-6 px-6 gap-6 bg-tc-light-vibrant-blue rounded-b-xl">
                      <div className="text-3xl font-extrabold text-tc-dark-vibrant-blue">
                        Total: ${calculateTotalPrice}
                      </div>
                      <div className="flex justify-end w-full">
                        <Button
                          className="py-3 px-8 text-lg bg-tc-vibrant-blue hover:bg-tc-dark-vibrant-blue"
                          onClick={() => handleBookingSubmit('full')}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Book Now'
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </section>
              </div>
            )}
          </div>

          {/* Sticky Summary Panel (Conditional Visibility) for larger screens */}
          {showSummaryPanel && !isMobile && (
            <div className="lg:col-span-1">
              <Card className="sticky top-8 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Booking Summary</CardTitle>
                  <CardDescription>Details of your selected services.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Package:</h3>
                    {selectedPackage ? (
                      <p className="text-gray-700">
                        {selectedPackage.name}{" "}
                        <span className="text-muted-foreground">({selectedPackage.priceRange})</span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground">No package selected</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Add-Ons:</h3>
                    {selectedAddOns.size > 0 ? (
                      <ul className="list-disc list-inside text-gray-700">
                        {Array.from(selectedAddOns).map((addOnId) => {
                          const addOn = addOnsData.find((a) => a.id === addOnId)
                          return addOn ? (
                            <li key={addOn.id}>
                              {addOn.name} (${addOn.price})
                            </li>
                          ) : null
                        })}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No add-ons selected</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Date & Time:</h3>
                    <p className="text-gray-700">
                      {selectedDate ? selectedDate.toDateString() : "Not selected"}
                      {selectedTime && ` at ${selectedTime}`}
                    </p>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Estimated Total:</span>
                      <span className="text-3xl font-extrabold text-tc-vibrant-blue">${calculateTotalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
        </div>
      </div>
      {/* Mobile Booking Summary Banner */}
      {showSummaryPanel && isMobile && (
        <MobileBookingSummary
          selectedPackage={selectedPackage}
          selectedAddOns={selectedAddOns}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          calculateTotalPrice={calculateTotalPrice}
          addOnsData={addOnsData}
          isOccupied={isOccupied}
          lightStaging={lightStaging}
          scentBooster={scentBooster}
          finalDayTouchUp={finalDayTouchUp}
          additionalServicePricing={additionalServicePricing}
        />
      )}
    </div>
  )
}

export default function BookingSystem() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tc-light-blue flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tc-vibrant-blue"></div>
      </div>
    }>
      <BookingSystemContent />
    </Suspense>
  )
}
