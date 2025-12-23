import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VolunteerCard } from './VolunteerCard';
import { Volunteer } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface VolunteerListProps {
  volunteers: Volunteer[];
  loading: boolean;
  selectedVolunteerId: number | null;
  onSelectVolunteer: (id: number) => void;
  initialFilter?: { type: string; value: string };
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  currentPage?: number;
  totalVolunteers?: number;
  pageSize?: number;
}

export const VolunteerList = ({
  volunteers,
  loading,
  selectedVolunteerId,
  onSelectVolunteer,
  initialFilter,
  onLoadMore,
  hasMore,
  loadingMore,
  onNextPage,
  onPrevPage,
  currentPage,
  totalVolunteers,
  pageSize = 30,
}: VolunteerListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Apply initial filter from dashboard
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.type === 'status') {
        setStatusFilter(initialFilter.value);
      } else if (initialFilter.type === 'booking') {
        setBookingFilter(initialFilter.value);
      }
      setShowFilters(true);
    }
  }, [initialFilter]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      // Search filter
      const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
      
      // Booking filter
      let matchesBooking = true;
      if (bookingFilter === 'booked') {
        matchesBooking = volunteer.booked_slots > 0;
      } else if (bookingFilter === 'non-booked') {
        matchesBooking = volunteer.booked_slots === 0;
      }
      
      return matchesSearch && matchesStatus && matchesBooking;
    });
  }, [volunteers, searchQuery, statusFilter, bookingFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setBookingFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || bookingFilter !== 'all';

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Search bar and filter toggle */}
      <div className="border-b border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search volunteers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bookingFilter} onValueChange={setBookingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Booking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="booked">Has Bookings</SelectItem>
                  <SelectItem value="non-booked">No Bookings</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setStatusFilter('all')}
                    />
                  </Badge>
                )}
                {bookingFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {bookingFilter === 'booked' ? 'Has Bookings' : 'No Bookings'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setBookingFilter('all')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Volunteer list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No volunteers found</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {(() => {
              const startIndex = typeof currentPage === 'number' ? currentPage * pageSize + 1 : 1;
              const endIndex = startIndex + filteredVolunteers.length - 1;
              return (
                <p className="text-xs text-muted-foreground mb-3">
                  Showing {startIndex} to {endIndex} of {totalVolunteers ?? volunteers.length} volunteers
                </p>
              );
            })()}
            <div className="space-y-3">
              {filteredVolunteers.map((volunteer) => (
                <VolunteerCard
                  key={volunteer.id}
                  volunteer={volunteer}
                  isSelected={selectedVolunteerId === volunteer.id}
                  onClick={() => onSelectVolunteer(volunteer.id)}
                />
              ))}
            </div>
            {/* Pagination controls (Prev / Next) */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <Button onClick={onPrevPage} disabled={!currentPage || currentPage <= 0 || loadingMore}>
                    Previous
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Page {typeof currentPage === 'number' ? (currentPage + 1) : '?'} </div>
                <div>
                  <Button onClick={onNextPage} disabled={!hasMore || loadingMore}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
