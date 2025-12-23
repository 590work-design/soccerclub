import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slot } from '@/services/api';
import { SLOT_STATUS, SLOT_STATUS_LABELS } from '@/utils/constants';

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: {
    date: string;
    time: string;
    description: string;
    status: string;
  }) => void;
  slot: Slot | null;
}

export const EditSlotModal = ({ isOpen, onClose, onSubmit, slot }: EditSlotModalProps) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    description: '',
    status: SLOT_STATUS.PENDING as string,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slot) {
      setFormData({
        date: slot.date,
        time: slot.time,
        description: slot.description,
        status: slot.status as string,
      });
    }
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(slot.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating slot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Edit Slot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-time">Time</Label>
            <Input
              id="edit-time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter slot description..."
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SLOT_STATUS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {SLOT_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
