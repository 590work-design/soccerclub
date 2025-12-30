import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { api, TaskTemplate, Slot } from "@/services/api";
import { toast } from "sonner";

interface ManageTasksProps {
    // Props kept for compatibility but data is fetched internally now
    slots?: (Slot & { volunteer?: any })[];
    onAddClick?: () => void;
    onDeleteClick?: (id: number) => void;
    onSlotClick?: (slot: any) => void;
}

export const ManageTasks = ({ onAddClick, onDeleteClick, onSlotClick }: ManageTasksProps) => {
    const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPast, setShowPast] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const data = await api.taskTemplates.getAll();
                setTaskTemplates(data);
            } catch (error) {
                console.error("Failed to fetch task templates", error);
                toast.error("Failed to load tasks");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleAddTask = async (data: any) => {
        try {
            // Map dialog data to API payload
            // Default location_id to 1 for now as we don't have a locations API
            const payload = {
                name: data.name,
                description: data.description,
                location_id: data.location_id,
                start_date: data.dateBy ? format(data.dateBy, 'yyyy-MM-dd') : undefined,
                end_date: data.dateTo ? format(data.dateTo, 'yyyy-MM-dd') : undefined,
                is_active: true
            };

            await api.taskTemplates.create(payload);
            toast.success("Task created successfully");
            setIsAddOpen(false);

            // Refresh list
            const updatedTasks = await api.taskTemplates.getAll();
            setTaskTemplates(updatedTasks);
        } catch (error) {
            console.error("Failed to create task", error);
            toast.error("Failed to create task");
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.taskTemplates.delete(id);
            setTaskTemplates(prev => prev.filter(t => t.id !== id));
            toast.success("Task deleted successfully");
        } catch (error) {
            console.error("Failed to delete task", error);
            toast.error("Failed to delete task");
        }
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <AddTaskDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSubmit={handleAddTask}
            />
            {/* Blue Header Strip */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-6 w-6" />
                    <h2 className="text-xl font-bold">Manage Tasks</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80 hover:text-white">
                        <span className="mr-2">Help</span>
                        <div className="h-5 w-5 rounded-full border border-white flex items-center justify-center text-xs">?</div>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {/* Controls */}
                <div className="flex items-center justify-end mb-4 gap-4">
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

                    <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Task
                    </Button>
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        Loading tasks...
                                    </TableCell>
                                </TableRow>
                            ) : taskTemplates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No tasks found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                taskTemplates.map((task) => (
                                    <TableRow
                                        key={task.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => onSlotClick?.(task)}
                                    >
                                        <TableCell className="py-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {task.name?.charAt(0).toUpperCase() || "T"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {task.name}
                                        </TableCell>
                                        <TableCell>
                                            {task.created_by ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            {task.description}
                                        </TableCell>
                                        <TableCell>
                                            {task.start_date ? format(new Date(task.start_date), 'dd MMM yyyy').toLowerCase() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {task.end_date ? format(new Date(task.end_date), 'dd MMM yyyy').toLowerCase() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTask(task.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};
