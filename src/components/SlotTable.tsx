import { Edit2, Trash2, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slot } from '@/services/api';
import { SLOT_STATUS } from '@/utils/constants';

interface SlotTableProps {
  slots: Slot[];
  onSendWhatsApp: (id: number) => void;
  onSendEmail: (id: number) => void;
}

export const SlotTable = ({ slots, onSendWhatsApp, onSendEmail }: SlotTableProps) => {
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

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No slots found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date & Time</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Description</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-4">
                <div>
                  <p className="font-medium text-card-foreground">{slot.date}</p>
                  <p className="text-sm text-muted-foreground">{slot.time}</p>
                </div>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-card-foreground">{slot.description}</p>
              </td>
              <td className="px-4 py-4">
                <Badge variant={getStatusVariant(slot.status)}>
                  {getStatusLabel(slot.status)}
                </Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSendWhatsApp(slot.id)}
                    title="Send WhatsApp reminder"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSendEmail(slot.id)}
                    title="Send email reminder"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
