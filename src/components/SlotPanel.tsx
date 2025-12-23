import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, Award, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlotTable } from './SlotTable';
import { api, Volunteer, Slot, ENABLE_SLOTS_API } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface SlotPanelProps {
  selectedVolunteer: Volunteer | null;
  onClose?: () => void;
}

export const SlotPanel = ({ selectedVolunteer, onClose }: SlotPanelProps) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ENABLE_SLOTS_API) {
      // Slots API disabled — show empty list and don't call backend
      setSlots([]);
      setLoading(false);
      return;
    }

    if (selectedVolunteer) {
      fetchSlots();
    }
  }, [selectedVolunteer]);

  const fetchSlots = async () => {
    if (!selectedVolunteer) return;
    
    setLoading(true);
    try {
      const data = await api.slots.getByVolunteerId(selectedVolunteer.id);
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSendWhatsApp = async (id: number) => {
    try {
      await api.slots.sendWhatsApp(id);
      toast.success('WhatsApp reminder sent successfully');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error('Failed to send WhatsApp reminder. Please try again.');
    }
  };

  const handleSendEmail = async (id: number) => {
    try {
      await api.slots.sendEmail(id);
      toast.success('Email reminder sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email reminder. Please try again.');
    }
  };

  if (!selectedVolunteer) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Select a volunteer from the left to view slot details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background relative">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      {/* Header section */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {selectedVolunteer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-card-foreground">{selectedVolunteer.name}</h2>
            <div className="mt-3 flex gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {slots.length} Total Slots
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {slots.filter(s => s.status === 'confirmed').length} Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedVolunteer.points} Points
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={fetchSlots} disabled={loading || !ENABLE_SLOTS_API}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Slot table */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <SlotTable
            slots={slots}
            onSendWhatsApp={handleSendWhatsApp}
            onSendEmail={handleSendEmail}
          />
        )}
      </div>

    </div>
  );
};
