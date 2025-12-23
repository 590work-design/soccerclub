import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, MapPin, Award, MessageCircle, Filter, X, Search } from 'lucide-react';
import { api, Slot, Volunteer } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface AllSlotsViewProps {
  onSlotClick?: (slot: any) => void;
  initialFilter?: { type: string; value: string };
}

export const AllSlotsView = ({ onSlotClick, initialFilter }: AllSlotsViewProps) => {
  const [allSlots, setAllSlots] = useState<(Slot & { volunteer?: Volunteer })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Apply initial filter from dashboard
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.type === 'status' && initialFilter.value !== 'all') {
        setStatusFilter(initialFilter.value);
        setShowFilters(true);
      }
    }
  }, [initialFilter]);

  useEffect(() => {
    fetchAllSlots();
  }, []);

  const fetchAllSlots = async () => {
    setLoading(true);
    try {
      // Fetch all slots in one request (backend should support /api/slots)
      const slots = await api.slots.getAll();
      // If backend returns volunteer info embedded in each slot, use it.
      // Otherwise, slots will at least include volunteer_id and other details.
      const flattenedSlots = slots.map(s => ({ ...s, volunteer: (s as any).volunteer ?? undefined }));
      
      // Sort by date and time
      flattenedSlots.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAllSlots(flattenedSlots);
    } catch (error) {
      console.error('Error fetching all slots:', error);
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      // Search filter (by volunteer name or description)
      const matchesSearch = 
        slot.volunteer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allSlots, searchQuery, statusFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-background p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">All Slots</h2>
        <p className="text-sm text-muted-foreground">
          Showing {filteredSlots.length} of {allSlots.length} total slots
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by volunteer or description..."
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
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            )}

            {/* Active filter badges */}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {getStatusLabel(statusFilter)}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setStatusFilter('all')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {filteredSlots.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No slots found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasActiveFilters ? 'Try adjusting your filters' : 'There are no slots in the system yet.'}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSlots.map((slot) => (
            <Card 
              key={slot.id} 
              className="p-4 transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => onSlotClick?.(slot)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Date and Time */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{slot.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{slot.time}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm font-medium text-foreground">{slot.description}</p>
                  </div>

                  {/* Volunteer Info */}
                  {slot.volunteer && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-foreground">
                        {slot.volunteer.name}
                      </span>
                      <span>•</span>
                      <span>{slot.volunteer.phone}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        <span>{slot.volunteer.points} points</span>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {slot.volunteer?.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{slot.volunteer.address}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge and Message Button */}
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={getStatusBadge(slot.status)}>
                    {getStatusLabel(slot.status)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Message functionality coming soon');
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
