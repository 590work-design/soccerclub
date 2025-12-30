import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, User, Filter } from 'lucide-react';
import { api, Slot } from '@/services/api';
import { format } from 'date-fns';

interface TaskAssignedTabProps {
    taskId: number;
    taskName: string;
}

export const TaskAssignedTab = ({ taskId, taskName }: TaskAssignedTabProps) => {
    // State for assignments (slots + volunteer info)
    const [assignments, setAssignments] = useState<(Slot & { volunteerName?: string, volunteerGroup?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAssignments = async () => {
            setLoading(true);
            try {
                // In a real app we'd have a specific endpoint like `api.tasks.getAssignments(taskId)`
                // For now, we fetch tall slots and filter (or use the mock data approach)

                // Helper to fetch slots. Since our mock slots are keyed by volunteer_id, we might need to iterate
                // But for now, let's assume api.slots.getAll() returns a flat list we can filter
                const allSlots = await api.slots.getAll();
                const allVolunteers = await api.volunteers.getAllAll();

                // Filter slots that might belong to this task.
                // Since our current Slot model doesn't strictly have `task_template_id` in backend yet,
                // we'll filter by matching description or strict ID if we added it effectively.
                // Ideally, we rely on the `task_template_id` we added to the interface.
                const relevantSlots = allSlots.filter(s => {
                    // Strict match if property exists
                    if (s.task_template_id) return s.task_template_id === taskId;

                    // Fallback fuzzy match for demo/mock purposes if IDs not populated
                    return s.description.toLowerCase().includes(taskName.toLowerCase());
                });

                const enriched = relevantSlots.map(slot => {
                    const vol = allVolunteers.find(v => v.id === slot.volunteer_id);
                    return {
                        ...slot,
                        volunteerName: vol?.name || `Volunteer ${slot.volunteer_id}`,
                        volunteerGroup: vol?.group_number ? `Group ${vol.group_number}` : '-'
                    };
                });

                setAssignments(enriched);
            } catch (err) {
                console.error("Failed to load assignments", err);
            } finally {
                setLoading(false);
            }
        };

        loadAssignments();
    }, [taskId, taskName]);


    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                    <User className="h-5 w-5" /> Assigned persons
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                        <Checkbox id="show-past" />
                        <label htmlFor="show-past">Show past</label>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                        <Filter className="h-3 w-3" /> Set up
                    </Button>
                </div>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Rel. code</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Comments</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : assignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                                    No assigned persons found for "{taskName}".
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignments.map((row, idx) => (
                                <TableRow key={row.id || idx}>
                                    <TableCell><User className="h-8 w-8 p-1.5 bg-primary/10 text-primary rounded-full" /></TableCell>
                                    <TableCell className="font-medium text-primary">{row.volunteerName}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{row.volunteerGroup}</TableCell>
                                    <TableCell className="text-muted-foreground">{row.date}</TableCell>
                                    <TableCell>{row.time}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={taskName}>{taskName} Location</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 hover:bg-green-100">{row.status}</Badge>
                                    </TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Pencil className="h-3 w-3" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
