"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, Home, RefreshCw, Phone, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function FailedPage() {
  return (
    <div className="min-h-screen bg-tc-light-blue py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8 pt-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-orange-100 p-6">
                <AlertTriangle className="h-16 w-16 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              Booking Not Completed
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your booking could not be completed. No payment has been processed.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pb-12">
            <div className="space-y-6">
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Why wasn't my booking completed?
                </h3>
                <p className="text-red-700 mb-4">
                  Your booking was not completed and no payment has been charged. Common reasons include:
                </p>
                <ul className="space-y-1 text-red-700 list-disc list-inside">
                  <li>Payment was not completed by user</li>
                  <li>Payment method declined or expired</li>
                  <li>Network connection interrupted during checkout</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  No worries - here's what you can do:
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try booking again.
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Contact support if you need help with payment methods
                  </li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Need help completing your booking?
                </h3>
                <p className="text-gray-600 mb-4">
                  Our team can help you complete your booking or assist with payment issues:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> support@topclassclean.com</p>
                  <p><strong>Business Hours:</strong> Mon-Fri 8AM-6PM, Sat 9AM-4PM</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 border-tc-vibrant-blue text-tc-vibrant-blue hover:bg-tc-light-blue py-3 text-lg"
                >
                  <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    Return to Home
                  </Link>
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}