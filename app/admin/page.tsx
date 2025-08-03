'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Filter, Eye, Calendar, DollarSign, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  bookingId: string;
  selectedPackage: {
    name: string;
    tier: string;
    category: string;
    minPrice: number;
  };
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
  };
  propertyDetails: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    propertyType: string;
  };
  selectedDate: string;
  selectedTime: string;
  totalPrice: number;
  status: 'pending' | 'paidFailed' | 'paidSuccess' | 'cancelled';
  createdAt: string;
  selectedAddOns: string[];
  addOnsTotal: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    packageTier: 'all',
    dateRange: 'all'
  });

  const fetchBookings = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      
      // Filter out "all" values and empty strings
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => 
          value && value !== 'all' && value !== ''
        )
      );
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...cleanFilters
      });

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce the API calls to prevent rate limiting
    const timeoutId = setTimeout(() => {
      fetchBookings(1, filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    fetchBookings(page, filters);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paidFailed: { color: 'bg-red-100 text-red-800', label: 'Payment Failed' },
      paidSuccess: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      Basic: { color: 'bg-blue-100 text-blue-800', label: 'Basic' },
      Concierge: { color: 'bg-purple-100 text-purple-800', label: 'Concierge' },
      Partner: { color: 'bg-orange-100 text-orange-800', label: 'Partner' }
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.Basic;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || 'Not selected';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage and view all customer bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            Total: {pagination.totalItems}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or booking ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
                         <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
               <SelectTrigger>
                 <SelectValue placeholder="Filter by status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="pending">Pending</SelectItem>
                 <SelectItem value="paidSuccess">Paid</SelectItem>
                 <SelectItem value="paidFailed">Payment Failed</SelectItem>
                 <SelectItem value="cancelled">Cancelled</SelectItem>
               </SelectContent>
             </Select>

             <Select value={filters.packageTier} onValueChange={(value) => handleFilterChange('packageTier', value)}>
               <SelectTrigger>
                 <SelectValue placeholder="Filter by tier" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Tiers</SelectItem>
                 <SelectItem value="Basic">Basic</SelectItem>
                 <SelectItem value="Concierge">Concierge</SelectItem>
                 <SelectItem value="Partner">Partner</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-mono text-sm">
                        {booking.bookingId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.contactData.firstName} {booking.contactData.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{booking.contactData.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.selectedPackage.name}</div>
                          {getTierBadge(booking.selectedPackage.tier)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{booking.propertyDetails.bedrooms} bed, {booking.propertyDetails.bathrooms} bath</div>
                          <div className="text-gray-500">{booking.propertyDetails.propertyType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(booking.selectedDate)}</div>
                          <div className="text-gray-500">{formatTime(booking.selectedTime)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(booking.totalPrice)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        <Dialog open={isDetailOpen && selectedBooking?._id === booking._id} onOpenChange={(open) => {
                          setIsDetailOpen(open);
                          if (!open) setSelectedBooking(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Booking Details - {booking.bookingId}</DialogTitle>
                            </DialogHeader>
                            <BookingDetailView booking={booking} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === pagination.currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        className={pagination.currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <div className="text-center text-sm text-gray-500 mt-2">
                  Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} total bookings
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Booking Detail Component
function BookingDetailView({ booking }: { booking: Booking }) {
  return (
    <div className="space-y-6">
      {/* Booking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Booking ID</div>
            <div className="font-mono">{booking.bookingId}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <div>{getStatusBadge(booking.status)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Created</div>
            <div>{formatDate(booking.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Price</div>
            <div className="font-medium">{formatPrice(booking.totalPrice)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div>{booking.contactData.firstName} {booking.contactData.lastName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Email</div>
            <div>{booking.contactData.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Phone</div>
            <div>{booking.contactData.phone}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Location</div>
            <div>{booking.contactData.city}, {booking.contactData.state}</div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Bedrooms</div>
            <div>{booking.propertyDetails.bedrooms}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Bathrooms</div>
            <div>{booking.propertyDetails.bathrooms}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Square Footage</div>
            <div>{booking.propertyDetails.squareFootage.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Property Type</div>
            <div className="capitalize">{booking.propertyDetails.propertyType}</div>
          </div>
        </CardContent>
      </Card>

      {/* Package Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Package & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Package</div>
              <div className="font-medium">{booking.selectedPackage.name}</div>
              {getTierBadge(booking.selectedPackage.tier)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Category</div>
              <div>{booking.selectedPackage.category}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Base Price</div>
              <div>{formatPrice(booking.selectedPackage.minPrice)}</div>
            </div>
          </div>
          
          {booking.selectedAddOns && booking.selectedAddOns.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Selected Add-ons</div>
              <div className="space-y-1">
                {booking.selectedAddOns.map((addon, index) => (
                  <div key={index} className="text-sm">• {addon}</div>
                ))}
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium">Add-ons Total:</span> {formatPrice(booking.addOnsTotal)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Selected Date</div>
            <div>{formatDate(booking.selectedDate)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Selected Time</div>
            <div>{formatTime(booking.selectedTime)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions (reused from main component)
function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    paidFailed: { color: 'bg-red-100 text-red-800', label: 'Payment Failed' },
    paidSuccess: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge className={config.color}>{config.label}</Badge>;
}

function getTierBadge(tier: string) {
  const tierConfig = {
    Basic: { color: 'bg-blue-100 text-blue-800', label: 'Basic' },
    Concierge: { color: 'bg-purple-100 text-purple-800', label: 'Concierge' },
    Partner: { color: 'bg-orange-100 text-orange-800', label: 'Partner' }
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.Basic;
  return <Badge className={config.color}>{config.label}</Badge>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(timeString: string) {
  return timeString || 'Not selected';
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
} 