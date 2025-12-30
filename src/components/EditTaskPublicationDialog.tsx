import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TaskTemplate, api } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditTaskPublicationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskTemplate;
    onSaveSuccess: () => void; // Callback to refresh parent data
}

export const EditTaskPublicationDialog = ({ open, onOpenChange, task, onSaveSuccess }: EditTaskPublicationDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        publish_on_website: false,
        publish_on_mobile: false,
        allow_registration: false,
        allow_swapping: false,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                publish_on_website: task.publish_on_website ?? false,
                publish_on_mobile: task.publish_on_mobile ?? false,
                allow_registration: task.allow_registration ?? false,
                allow_swapping: task.allow_swapping ?? false,
            });
        }
    }, [open, task]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.taskTemplates.updatePublication(task.id, formData);
            onOpenChange(false);
            toast.success("Publication settings updated");
            onSaveSuccess();
        } catch (error) {
            console.error("Failed to update publication settings", error);
            toast.error("Failed to update publication settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task Publication</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="pub_website"
                            checked={formData.publish_on_website}
                            onCheckedChange={() => handleChange('publish_on_website')}
                        />
                        <Label htmlFor="pub_website">Publish on website and TV</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="pub_mobile"
                            checked={formData.publish_on_mobile}
                            onCheckedChange={() => handleChange('publish_on_mobile')}
                        />
                        <Label htmlFor="pub_mobile">Publish in the mobile app</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="allow_reg"
                            checked={formData.allow_registration}
                            onCheckedChange={() => handleChange('allow_registration')}
                        />
                        <Label htmlFor="allow_reg">Allow registration</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="allow_swap"
                            checked={formData.allow_swapping}
                            onCheckedChange={() => handleChange('allow_swapping')}
                        />
                        <Label htmlFor="allow_swap">Allow swapping</Label>
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
