import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SLOT_STATUS } from '@/utils/constants';

interface SlotDetailViewProps {
  slot: any;
  onBack: () => void;
}

export const SlotDetailView = ({ slot, onBack }: SlotDetailViewProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case SLOT_STATUS.CONFIRMED:
        return 'default';
      case SLOT_STATUS.PENDING:
        return 'secondary';
      case SLOT_STATUS.CANCELLED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header with back button and Message button */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Slots
          </Button>
          
          <Button variant="default" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-card-foreground">Slot Details</h2>
          <Badge variant={getStatusVariant(slot.status)}>
            {getStatusLabel(slot.status)}
          </Badge>
        </div>
      </div>

      {/* Slot detail content - blank for now as requested */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Slot Information</h3>
            <div className="space-y-2 text-muted-foreground">
              <p><span className="font-medium">Date:</span> {slot.date}</p>
              <p><span className="font-medium">Time:</span> {slot.time}</p>
              <p><span className="font-medium">Description:</span> {slot.description}</p>
            </div>
          </div>

          {slot.volunteer && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Volunteer Information</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><span className="font-medium">Name:</span> {slot.volunteer.name}</p>
                <p><span className="font-medium">Phone:</span> {slot.volunteer.phone}</p>
                <p><span className="font-medium">Points:</span> {slot.volunteer.points}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
