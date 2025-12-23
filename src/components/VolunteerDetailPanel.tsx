// src/components/VolunteerDetailPanel.tsx
import { useState, useEffect } from 'react';
import { X, ClipboardList, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, Slot } from '@/services/api'; // ADDED: import api to fetch real slots from backend
import { Badge } from '@/components/ui/badge'; // ADDED: use Badge for slot status display

interface Volunteer {
  id: number;
  name: string;
  _raw?: any; // ADDED: raw backend object available if needed (keeps original backend fields)
}

interface VolunteerDetailPanelProps {
  volunteer: Volunteer;
  onClose: () => void;
}

export const VolunteerDetailPanel = ({ volunteer, onClose }: VolunteerDetailPanelProps) => {
  // ADDED: local state to load slots from backend for the selected volunteer
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null); // ADDED: surface fetch errors
  const [fullVolunteerRaw, setFullVolunteerRaw] = useState<any | null>(null);
  const [loadingVolunteerFull, setLoadingVolunteerFull] = useState(false);
  const [volunteerFullError, setVolunteerFullError] = useState<string | null>(null);

  // ADDED: fetch slots when volunteer changes (uses api.slots.getByVolunteerId)
  useEffect(() => {
    if (!volunteer) return;

    let mounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError(null);

      try {
        // Use schedule data included in the volunteer object only.
        // The volunteer API already provides preferred and schedule information
        // according to your backend; do not call the slots API because it's
        // unrelated for this data.
        const rawLocal = ((volunteer as any)._raw) ?? (volunteer as any);

        const slotCandidatesKeys = [
          'slots', 'scheduled_tasks', 'schedule', 'scheduled_tasks_list', 'bookings', 'assigned_slots', 'shifts', 'volunteer_slots', 'slots_list'
        ];

        let found: any[] | null = null;
        for (const k of slotCandidatesKeys) {
          if (rawLocal && Array.isArray(rawLocal[k]) && rawLocal[k].length > 0) {
            found = rawLocal[k];
            console.debug('[VolunteerDetailPanel] using schedule from volunteer._raw field:', k);
            break;
          }
        }

        if (found) {
          const mapped: Slot[] = found.map((s: any, idx: number) => ({
            id: s.id ?? s.slot_id ?? `${volunteer.id}-local-${idx}`,
            volunteer_id: s.volunteer_id ?? volunteer.id,
            date: s.date ?? s.start_date ?? s.day ?? (s.datetime ? String(s.datetime).split('T')[0] : ''),
            time: s.time ?? s.start_time ?? s.time_range ?? (s.datetime ? String(s.datetime).split('T')[1] : ''),
            description: s.description ?? s.title ?? s.task ?? s.name ?? '',
            status: (s.status ?? s.state ?? 'confirmed') as 'confirmed' | 'pending' | 'cancelled',
          }));

          if (mounted) setSlots(mapped);
        } else {
          // No schedule present on volunteer object — show empty schedule (no error)
          if (mounted) setSlots([]);
        }
      } catch (err: any) {
        console.error('Unexpected error processing schedule for volunteer', volunteer.id, err);
        if (mounted) setSlots([]);
        if (mounted) setSlotsError(err?.message ?? 'Failed to load schedule');
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => { mounted = false; };
  }, [volunteer]);

  // Fetch full volunteer record if preferred tasks are missing from the passed-in props
  useEffect(() => {
    let mounted = true;
    const rawLocal = ((volunteer as any)._raw) ?? (volunteer as any);
    const needsFetch = !rawLocal || (!rawLocal.preferred_task && !rawLocal.preferred_tasks && !rawLocal.preferred);
    if (!needsFetch) {
      // clear previously fetched full record if present
      setFullVolunteerRaw(null);
      setVolunteerFullError(null);
      return;
    }

    const fetchFullVolunteer = async () => {
      setLoadingVolunteerFull(true);
      setVolunteerFullError(null);
      try {
        const resp = await api.volunteers.getById(volunteer.id);
        if (mounted) {
          setFullVolunteerRaw((resp as any)._raw ?? resp);
        }
      } catch (err: any) {
        console.debug('Failed to fetch full volunteer record', volunteer.id, err?.message ?? err);
        if (mounted) setVolunteerFullError(err?.message ?? 'Failed to load volunteer details');
      } finally {
        if (mounted) setLoadingVolunteerFull(false);
      }
    };

    fetchFullVolunteer();
    return () => { mounted = false; };
  }, [volunteer]);

  // ADDED: read preferred tasks from backend fields if present
  // backend might return `preferred_task`, `preferred_tasks` or similar
  // prefer the full volunteer raw data if we fetched it, otherwise use the passed-in raw
  const raw = fullVolunteerRaw ?? (((volunteer as any)._raw) ?? (volunteer as any));
  // IMPORTANT: avoid mixing `??` with `||` (syntax error). Use `??` consistently.
  const preferredFromBackend = raw.preferred_task ?? raw.preferred_tasks ?? raw.preferred ?? [];
  // If we tried to fetch a full volunteer record and it failed, surface that error near preferred tasks
  const preferredLoadError = volunteerFullError;
  const preferredTasks = Array.isArray(preferredFromBackend)
    ? preferredFromBackend
    : (preferredFromBackend ? [preferredFromBackend] : []);

  // ADDED: simple formatter for slot date & time
  const formatSlotDate = (s: Slot) => `${s.date} • ${s.time}`;

  // ADDED: status badge helper
  // NOTE: Badge component's allowed variants are: 'default' | 'secondary' | 'destructive' | 'outline'
  const statusBadge = (status: string | undefined) => {
    switch (status) {
      case 'confirmed':
        // use 'default' to represent success-like / neutral positive
        return <Badge variant="default">Confirmed</Badge>;
      case 'pending':
        // use 'outline' to indicate a pending/warning-like visual
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status ?? 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
            {volunteer.name?.charAt(0)?.toUpperCase() ?? 'V'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{volunteer.name}</h2>
            {raw.email && <p className="text-sm text-muted-foreground">{raw.email}</p>}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prefer Task Section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Prefer Task</h3>
          </div>

          {/* ADDED: render preferred tasks from backend when available */}
          {preferredLoadError ? (
            <div className="text-sm text-destructive">Error loading preferred tasks: {preferredLoadError}</div>
          ) : preferredTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No preferred tasks configured.</div>
          ) : (
            <div className="space-y-3">
              {preferredTasks.map((task: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{typeof task === 'string' ? task : task.title ?? String(task)}</p>
                    {typeof task === 'string' ? null : task.description ? <p className="text-xs text-muted-foreground">{task.description}</p> : null}
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Preferred</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Task Section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Schedule Task</h3>
          </div>

          {/* ADDED: render real slots fetched from backend with loading, empty and error states */}
          {slotsError ? (
            <div className="text-sm text-destructive">Error loading schedule: {slotsError}</div>
          ) : loadingSlots ? (
            <div className="text-sm text-muted-foreground">Loading schedule...</div>
          ) : slots.length === 0 ? (
            <div className="text-sm text-muted-foreground">No scheduled tasks</div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{slot.description}</p>
                    <p className="text-xs text-muted-foreground">{formatSlotDate(slot)}</p>
                  </div>
                  <div className="shrink-0">
                    {statusBadge(slot.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};