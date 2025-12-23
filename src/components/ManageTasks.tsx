import { useState } from 'react';
import { Plus, Trash2, Calendar, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Slot, Volunteer } from '@/services/api';

interface ManageTasksProps {
    slots: (Slot & { volunteer?: Volunteer })[];
    onAddClick?: () => void;
    onDeleteClick?: (id: number) => void;
}

export const ManageTasks = ({ slots, onAddClick, onDeleteClick }: ManageTasksProps) => {
    const [showPast, setShowPast] = useState(false);

    // Filter slots based on "Show past" toggle if needed, or just show all for now
    // The screenshot shows "Taken" which likely means 'confirmed' status
    const takenSlots = slots.filter(slot => slot.status === 'confirmed');

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="flex-1 overflow-auto p-6">
                {/* Header / Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-foreground">Manage Tasks</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="show-past"
                                checked={showPast}
                                onCheckedChange={(c) => setShowPast(!!c)}
                            />
                            <label
                                htmlFor="show-past"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show past
                            </label>
                        </div>

                        <Button onClick={onAddClick} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </div>

                {/* Tasks Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Task manager</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Start date</TableHead>
                                <TableHead>End date</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {takenSlots.map((slot) => (
                                <TableRow key={slot.id}>
                                    <TableCell className="py-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={slot.volunteer?.avatar} />
                                            <AvatarFallback>
                                                {slot.volunteer?.name?.charAt(0).toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {slot.volunteer?.assigned_task || slot.description || "Bar service"}
                                    </TableCell>
                                    <TableCell>
                                        {slot.volunteer?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {slot.description || (slot as any).notes || ""}
                                    </TableCell>
                                    <TableCell>
                                        {slot.date ? format(new Date(slot.date), 'dd MMM yyyy').toLowerCase() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {/* End date not currently in Slot model */}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => onDeleteClick?.(slot.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {takenSlots.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No tasks found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};
