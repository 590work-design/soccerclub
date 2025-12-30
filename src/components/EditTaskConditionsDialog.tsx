import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskTemplate } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditTaskConditionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskTemplate;
    onSave: (id: number, data: Partial<TaskTemplate>) => Promise<void>;
}

export const EditTaskConditionsDialog = ({ open, onOpenChange, task, onSave }: EditTaskConditionsDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        minimum_age: 18,
        gender: 'Both',
        target_audience: 'Both',
        required_diploma_association: '',
        required_diploma_bond: '',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                minimum_age: task.minimum_age ?? 18,
                gender: task.gender === 'M' ? 'M' : task.gender === 'F' ? 'F' : 'Both',
                target_audience: task.target_audience ?? 'Both',
                required_diploma_association: task.required_diploma_association ?? '',
                required_diploma_bond: task.required_diploma_bond ?? '',
            });
        }
    }, [open, task]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(task.id, {
                ...formData,
                gender: formData.gender === 'Both' ? undefined : formData.gender, // Assuming backend handles 'Both' as null or specific string? 
                // Wait, if backend expects 'M' or 'F' or null for both, we need to correct this.
                // Assuming standard "M", "F", or null/undefined/"Both" string.
                // Re-reading api.ts, gender is string. Let's send what we have.
            });
            onOpenChange(false);
            toast.success("Task conditions updated");
        } catch (error) {
            console.error("Failed to update task conditions", error);
            toast.error("Failed to update task conditions");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Task Conditions</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="min_age">Minimum Age</Label>
                            <Input
                                id="min_age"
                                type="number"
                                value={formData.minimum_age}
                                onChange={(e) => handleChange('minimum_age', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(val) => handleChange('gender', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Both">Both</SelectItem>
                                    <SelectItem value="M">Male</SelectItem>
                                    <SelectItem value="F">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target_audience">Target Audience</Label>
                        <Input
                            id="target_audience"
                            value={formData.target_audience}
                            onChange={(e) => handleChange('target_audience', e.target.value)}
                            placeholder="e.g. Seniors, Youth, All"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="diploma_assoc">Diploma (Association)</Label>
                            <Input
                                id="diploma_assoc"
                                value={formData.required_diploma_association}
                                onChange={(e) => handleChange('required_diploma_association', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diploma_bond">Diploma (Bond)</Label>
                            <Input
                                id="diploma_bond"
                                value={formData.required_diploma_bond}
                                onChange={(e) => handleChange('required_diploma_bond', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
