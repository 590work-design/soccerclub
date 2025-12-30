import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TaskTemplate, api, Location as ApiLocation } from '@/services/api';
import { toast } from 'sonner';

interface EditTaskSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskTemplate;
    onSave: (id: number, data: Partial<TaskTemplate>) => Promise<void>;
}

export const EditTaskSettingsDialog = ({
    open,
    onOpenChange,
    task,
    onSave,
}: EditTaskSettingsDialogProps) => {
    const [formData, setFormData] = useState<Partial<TaskTemplate>>({});
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<ApiLocation[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await api.locations.getAll();
                setLocations(data);
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        if (open) {
            setFormData({
                name: task.name,
                description: task.description,
                location_id: task.location_id, // Ensure we map this
                start_date: task.start_date ? task.start_date.split('T')[0] : '',
                end_date: task.end_date ? task.end_date.split('T')[0] : '',
                calendar_color: task.calendar_color,
                task_value: task.task_value,
                default_task_duration: task.default_task_duration,
                min_volunteers: task.min_volunteers,
                max_volunteers: task.max_volunteers,
            });
        }
    }, [open, task]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleLocationChange = (value: string) => {
        setFormData(prev => ({ ...prev, location_id: Number(value) }));
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            await onSave(task.id, formData);
            onOpenChange(false);
            toast.success('Task settings updated successfully');
        } catch (error) {
            console.error('Failed to update task:', error);
            toast.error('Failed to update task settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task Settings</DialogTitle>
                    <DialogDescription>
                        Update the core details for this task template. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Core Info Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Task Name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                placeholder="Brief description of the task"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Select
                                value={formData.location_id?.toString() || ''}
                                onValueChange={handleLocationChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.length > 0 ? (
                                        locations.map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                                {loc.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No locations found
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Timing Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={formData.start_date || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                name="end_date"
                                type="date"
                                value={formData.end_date || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="calendar_color">Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="calendar_color"
                                    name="calendar_color"
                                    type="color"
                                    value={formData.calendar_color || '#fbbf24'}
                                    onChange={handleChange}
                                    className="w-full h-10 p-1 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task_value">Points</Label>
                            <Input
                                id="task_value"
                                name="task_value"
                                type="number"
                                value={formData.task_value || 0}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="default_task_duration">Duration (hrs)</Label>
                            <Input
                                id="default_task_duration"
                                name="default_task_duration"
                                type="number"
                                step="0.5"
                                value={formData.default_task_duration || 0}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Volunteers Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min_volunteers">Min Volunteers</Label>
                            <Input
                                id="min_volunteers"
                                name="min_volunteers"
                                type="number"
                                value={formData.min_volunteers || 1}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_volunteers">Max Volunteers</Label>
                            <Input
                                id="max_volunteers"
                                name="max_volunteers"
                                type="number"
                                value={formData.max_volunteers || 1}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveClick} disabled={loading}>
                        {loading ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
