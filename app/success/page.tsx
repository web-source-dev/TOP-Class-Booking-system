"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, Calendar, Mail } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-tc-light-blue py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Thank you for choosing TopClass Cleaning. Your booking has been successfully submitted.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pb-12">
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 border-tc-vibrant-blue text-tc-vibrant-blue hover:bg-tc-light-blue py-3 text-lg"
                >
                  <Button onClick={() => window.parent.location.href = 'https://www.topclassclean.com'}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Another Service
                  </Button>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}